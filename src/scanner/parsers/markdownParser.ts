/**
 * Markdown rule parser
 *
 * Parses rules from markdown files in the format:
 *
 * ## [rule-id] Rule Title
 * **Area:** sql
 * **Severity:** warn
 * **Tags:** tag1, tag2
 * **Description:** ...
 * **Rationale:** ...
 * **Good Example:**
 * ```
 * code
 * ```
 * **Bad Example:**
 * ```
 * code
 * ```
 */

import { Rule, RuleSeverity, RuleArea } from '../../model/rule.js';

export function parseMarkdownRules(content: string, projectId: string): Rule[] {
  const rules: Rule[] = [];

  // Split by ## headers (rule sections)
  const sections = content.split(/^##\s+/m).filter(s => s.trim());

  for (const section of sections) {
    try {
      const rule = parseRuleSection(section, projectId);
      if (rule) {
        rules.push(rule);
      }
    } catch (error) {
      console.warn(`Failed to parse rule section:`, error);
    }
  }

  return rules;
}

function parseRuleSection(section: string, projectId: string): Rule | null {
  const lines = section.split('\n');

  // First line should be [rule-id] Title
  const firstLine = lines[0].trim();
  const titleMatch = firstLine.match(/^\[([^\]]+)\]\s+(.+)$/);

  if (!titleMatch) {
    // Not a properly formatted rule
    return null;
  }

  const [, id, title] = titleMatch;

  // Extract fields
  const area = extractField(section, 'Area') as RuleArea || 'general';
  const severity = extractField(section, 'Severity') as RuleSeverity || 'info';
  const tagsStr = extractField(section, 'Tags') || '';
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  const description = extractField(section, 'Description') || '';
  const rationale = extractField(section, 'Rationale');
  const pattern = extractField(section, 'Pattern');
  const appliesTo = extractListField(section, 'Applies To');

  // Extract examples
  const goodExample = extractCodeBlock(section, 'Good Example');
  const badExample = extractCodeBlock(section, 'Bad Example');

  const rule: Rule = {
    id,
    project: projectId,
    area,
    title,
    description,
    severity,
    tags,
  };

  if (rationale) rule.rationale = rationale;
  if (pattern) rule.pattern = pattern;
  if (appliesTo && appliesTo.length > 0) rule.appliesTo = appliesTo;

  if (goodExample || badExample) {
    rule.examples = {};
    if (goodExample) rule.examples.good = goodExample;
    if (badExample) rule.examples.bad = badExample;
  }

  return rule;
}

function extractField(section: string, fieldName: string): string | undefined {
  const regex = new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+?)(?=\\n\\*\\*|\\n\\n|$)`, 'is');
  const match = section.match(regex);
  return match ? match[1].trim() : undefined;
}

function extractListField(section: string, fieldName: string): string[] | undefined {
  const value = extractField(section, fieldName);
  if (!value) return undefined;

  // Could be comma-separated or line-separated
  if (value.includes('\n')) {
    return value.split('\n')
      .map(line => line.trim().replace(/^[-*]\s*/, ''))
      .filter(Boolean);
  } else {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
}

function extractCodeBlock(section: string, label: string): string | undefined {
  const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*\`\`\`[^\\n]*\\n([\\s\\S]*?)\`\`\``, 'i');
  const match = section.match(regex);
  return match ? match[1].trim() : undefined;
}
