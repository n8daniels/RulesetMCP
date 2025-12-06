/**
 * YAML rule parser
 *
 * Parses rules from YAML files
 */

import { Rule } from '../../model/rule.js';

/**
 * Simple YAML parser for rule files
 * For now, we'll use a basic JSON-like structure
 * In production, use a proper YAML library like 'yaml' or 'js-yaml'
 */
export function parseYamlRules(content: string, projectId: string): Rule[] {
  // For MVP, we'll require users to use JSON format in .yaml files
  // or we can add the 'yaml' package as a dependency

  try {
    // Try parsing as JSON first (works for simple YAML)
    const parsed = JSON.parse(content);
    const rules = Array.isArray(parsed) ? parsed : [parsed];

    // Ensure each rule has required fields
    return rules.map((rule: any) => ({
      id: rule.id || 'unknown',
      project: projectId,
      area: rule.area || 'general',
      title: rule.title || '',
      description: rule.description || '',
      severity: rule.severity || 'info',
      tags: rule.tags || [],
      rationale: rule.rationale,
      pattern: rule.pattern,
      appliesTo: rule.appliesTo,
      examples: rule.examples,
    }));
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// TODO: Add proper YAML parsing with 'yaml' package
// import YAML from 'yaml';
// export function parseYamlRules(content: string, projectId: string): Rule[] {
//   const parsed = YAML.parse(content);
//   ...
// }
