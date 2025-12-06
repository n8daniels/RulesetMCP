/**
 * Rules scanner - discovers and loads rules from files
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';
import { existsSync } from 'fs';
import { Rule } from '../model/rule.js';
import { Project } from '../model/project.js';
import { parseMarkdownRules } from './parsers/markdownParser.js';
import { parseYamlRules } from './parsers/yamlParser.js';

const RULE_FILE_PATTERNS = [
  'RULES.md',
  'rules.md',
  '*.rules.md',
  '*.ruleset.yaml',
  '*.rules.yaml',
];

export interface ScanResult {
  rules: Rule[];
  filesScanned: number;
  errors: string[];
}

/**
 * Scan a project for rule files and parse them
 */
export async function scanProjectRules(project: Project): Promise<ScanResult> {
  const rules: Rule[] = [];
  const errors: string[] = [];
  let filesScanned = 0;

  // Scan each rules path
  for (const rulesPath of project.rulesPaths) {
    if (!existsSync(rulesPath)) {
      console.warn(`Rules path does not exist: ${rulesPath}`);
      continue;
    }

    const files = await findRuleFiles(rulesPath);

    for (const file of files) {
      filesScanned++;
      try {
        const fileRules = await parseRuleFile(file, project.id);
        rules.push(...fileRules);
      } catch (error) {
        const errorMsg = `Error parsing ${file}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
  }

  return { rules, filesScanned, errors };
}

/**
 * Find all rule files in a directory (recursive)
 */
async function findRuleFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recurse into subdirectories
        const subFiles = await findRuleFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Check if file matches rule patterns
        if (isRuleFile(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

/**
 * Check if a filename matches rule file patterns
 */
function isRuleFile(filename: string): boolean {
  const lower = filename.toLowerCase();

  // Check for exact matches
  if (lower === 'rules.md' || lower === 'rules.yaml' || lower === 'rules.json') {
    return true;
  }

  // Check for pattern matches
  if (lower.includes('.rules.') || lower.includes('.ruleset.')) {
    return true;
  }

  return false;
}

/**
 * Parse a single rule file based on its extension
 */
async function parseRuleFile(filePath: string, projectId: string): Promise<Rule[]> {
  const ext = extname(filePath).toLowerCase();
  const content = await readFile(filePath, 'utf-8');

  let rules: Rule[] = [];

  if (ext === '.md') {
    rules = parseMarkdownRules(content, projectId);
  } else if (ext === '.yaml' || ext === '.yml') {
    rules = parseYamlRules(content, projectId);
  } else if (ext === '.json') {
    // Simple JSON array of rules
    const parsed = JSON.parse(content);
    rules = Array.isArray(parsed) ? parsed : [parsed];
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  // Add source file to each rule
  for (const rule of rules) {
    rule.source = filePath;
    rule.project = projectId;
  }

  return rules;
}
