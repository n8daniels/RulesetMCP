/**
 * Rule service - business logic for querying and applying rules
 */

import { Rule, RuleViolation, RuleSeverity, RuleArea } from '../model/rule.js';
import { Project } from '../model/project.js';
import { RulesetConfig } from '../model/config.js';
import { scanProjectRules } from '../scanner/rulesScanner.js';

export class RuleService {
  private ruleCache: Map<string, Rule[]> = new Map();
  private config: RulesetConfig;

  constructor(config: RulesetConfig) {
    this.config = config;
  }

  /**
   * Load rules for a specific project
   */
  async loadProjectRules(projectId: string): Promise<Rule[]> {
    // Check cache first
    if (this.ruleCache.has(projectId)) {
      return this.ruleCache.get(projectId)!;
    }

    const project = this.config.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const { rules, filesScanned, errors } = await scanProjectRules(project);

    console.log(`Loaded ${rules.length} rules from ${filesScanned} files for project "${projectId}"`);
    if (errors.length > 0) {
      console.warn(`Encountered ${errors.length} errors while scanning rules`);
    }

    this.ruleCache.set(projectId, rules);
    return rules;
  }

  /**
   * Get rules with optional filtering
   */
  async getRules(params: {
    projectId: string;
    area?: RuleArea | RuleArea[];
    tags?: string[];
    severity?: RuleSeverity | RuleSeverity[];
    limit?: number;
  }): Promise<Rule[]> {
    const allRules = await this.loadProjectRules(params.projectId);

    let filtered = allRules;

    // Filter by area
    if (params.area) {
      const areas = Array.isArray(params.area) ? params.area : [params.area];
      filtered = filtered.filter(r => areas.includes(r.area));
    }

    // Filter by tags
    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter(r =>
        params.tags!.some(tag => r.tags.includes(tag))
      );
    }

    // Filter by severity
    if (params.severity) {
      const severities = Array.isArray(params.severity) ? params.severity : [params.severity];
      filtered = filtered.filter(r => severities.includes(r.severity));
    }

    // Apply limit
    if (params.limit && params.limit > 0) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  /**
   * Validate a snippet against project rules
   */
  async validateSnippet(params: {
    projectId: string;
    area?: RuleArea;
    snippet: string;
    path?: string;
  }): Promise<RuleViolation[]> {
    const rules = await this.getRules({
      projectId: params.projectId,
      area: params.area,
    });

    const violations: RuleViolation[] = [];

    for (const rule of rules) {
      // Check if rule applies to this file path
      if (params.path && rule.appliesTo) {
        const matches = rule.appliesTo.some(pattern =>
          this.matchesPattern(params.path!, pattern)
        );
        if (!matches) continue;
      }

      // Simple pattern matching for MVP
      if (rule.pattern) {
        try {
          const regex = new RegExp(rule.pattern, 'gim');
          if (regex.test(params.snippet)) {
            violations.push({
              ruleId: rule.id,
              message: `Violation: ${rule.title}. ${rule.description}`,
              severity: rule.severity,
            });
          }
        } catch (error) {
          console.warn(`Invalid regex pattern in rule ${rule.id}:`, error);
        }
      }

      // Simple SQL casing check for demo
      if (rule.area === 'sql' && rule.id.includes('format') && rule.id.includes('001')) {
        const hasLowerKeywords = /\b(select|from|where|join|and|or|order|group|having)\b/.test(params.snippet);
        if (hasLowerKeywords) {
          const suggested = params.snippet.replace(
            /\b(select|from|where|join|and|or|order|group|having|by|on|as|in|not|null|is|like|between|case|when|then|else|end|insert|update|delete|create|alter|drop|table|index|view|procedure|function|trigger|database|schema)\b/gi,
            match => match.toUpperCase()
          );

          violations.push({
            ruleId: rule.id,
            message: `SQL keywords must be UPPER-CASE. ${rule.description}`,
            severity: rule.severity,
            suggestedSnippet: suggested,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Generate a task-oriented summary of relevant rules
   */
  async summarizeRulesForTask(params: {
    projectId: string;
    taskDescription: string;
    areasHint?: RuleArea[];
  }): Promise<{ summary: string; rulesReferenced: string[] }> {
    // Extract potential areas from task description
    const areas = params.areasHint || this.inferAreasFromTask(params.taskDescription);

    const rules = await this.getRules({
      projectId: params.projectId,
      area: areas.length > 0 ? areas : undefined,
    });

    if (rules.length === 0) {
      return {
        summary: `No specific rules found for project "${params.projectId}" in areas: ${areas.join(', ')}`,
        rulesReferenced: [],
      };
    }

    // Group rules by area
    const rulesByArea = new Map<string, Rule[]>();
    for (const rule of rules) {
      if (!rulesByArea.has(rule.area)) {
        rulesByArea.set(rule.area, []);
      }
      rulesByArea.get(rule.area)!.push(rule);
    }

    // Build summary
    let summary = `For the "${params.projectId}" project, when working on: "${params.taskDescription}"\n\n`;
    summary += `Relevant rules:\n\n`;

    for (const [area, areaRules] of rulesByArea.entries()) {
      summary += `**${area.toUpperCase()} Rules:**\n`;
      for (const rule of areaRules.slice(0, 5)) { // Top 5 per area
        summary += `- [${rule.severity}] ${rule.title}: ${rule.description}\n`;
      }
      summary += `\n`;
    }

    const rulesReferenced = rules.map(r => r.id);

    return { summary, rulesReferenced };
  }

  /**
   * Reload rules for a project (clear cache)
   */
  async reloadRules(projectId: string): Promise<{ status: string; message: string }> {
    this.ruleCache.delete(projectId);
    const rules = await this.loadProjectRules(projectId);

    return {
      status: 'ok',
      message: `Reloaded ${rules.length} rules for project "${projectId}"`,
    };
  }

  /**
   * Simple pattern matching (supports wildcards)
   */
  private matchesPattern(path: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    return new RegExp(`^${regexPattern}$`, 'i').test(path);
  }

  /**
   * Infer areas from task description (simple keyword matching)
   */
  private inferAreasFromTask(task: string): RuleArea[] {
    const lower = task.toLowerCase();
    const areas: RuleArea[] = [];

    if (lower.includes('sql') || lower.includes('stored procedure') || lower.includes('query')) {
      areas.push('sql');
    }
    if (lower.includes('api') || lower.includes('endpoint') || lower.includes('rest')) {
      areas.push('api');
    }
    if (lower.includes('security') || lower.includes('auth') || lower.includes('permission')) {
      areas.push('security');
    }
    if (lower.includes('test') || lower.includes('testing')) {
      areas.push('testing');
    }
    if (lower.includes('c#') || lower.includes('csharp') || lower.includes('.net')) {
      areas.push('csharp');
    }
    if (lower.includes('typescript') || lower.includes('ts')) {
      areas.push('typescript');
    }
    if (lower.includes('javascript') || lower.includes('js')) {
      areas.push('javascript');
    }

    return areas;
  }
}
