/**
 * Configuration loader for RulesetMCP
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { RulesetConfig, LoadedConfig } from './model/config.js';

const CONFIG_FILENAMES = [
  'rulesetmcp.config.json',
  'rulesetmcp.config.yaml',
  '.rulesetmcp.json',
];

/**
 * Load configuration from a specific path or search common locations
 */
export async function loadConfig(configPath?: string): Promise<LoadedConfig> {
  let actualPath: string;

  if (configPath) {
    actualPath = resolve(configPath);
    if (!existsSync(actualPath)) {
      throw new Error(`Config file not found: ${actualPath}`);
    }
  } else {
    // Search common locations
    const cwd = process.cwd();
    const searchPaths = [
      ...CONFIG_FILENAMES.map(name => resolve(cwd, name)),
      ...CONFIG_FILENAMES.map(name => resolve(cwd, '.config', name)),
    ];

    actualPath = searchPaths.find(p => existsSync(p)) || '';

    if (!actualPath) {
      throw new Error(
        `No config file found. Searched: ${searchPaths.join(', ')}\n` +
        `Create a rulesetmcp.config.json in your project root.`
      );
    }
  }

  const content = await readFile(actualPath, 'utf-8');
  const config = JSON.parse(content) as RulesetConfig;

  // Validate config
  validateConfig(config);

  // Resolve relative paths
  const basePath = config.basePath || dirname(actualPath);
  const resolvedConfig: RulesetConfig = {
    ...config,
    basePath,
    projects: config.projects.map(project => ({
      ...project,
      paths: project.paths.map(p => resolve(basePath, p)),
      rulesPaths: project.rulesPaths.map(p => resolve(basePath, p)),
    })),
  };

  return {
    config: resolvedConfig,
    configPath: actualPath,
  };
}

function validateConfig(config: RulesetConfig): void {
  if (!config.projects || !Array.isArray(config.projects)) {
    throw new Error('Config must have a "projects" array');
  }

  if (config.projects.length === 0) {
    throw new Error('Config must have at least one project');
  }

  for (const project of config.projects) {
    if (!project.id) {
      throw new Error('Each project must have an "id"');
    }
    if (!project.name) {
      throw new Error(`Project "${project.id}" must have a "name"`);
    }
    if (!project.paths || project.paths.length === 0) {
      throw new Error(`Project "${project.id}" must have at least one path`);
    }
    if (!project.rulesPaths) {
      project.rulesPaths = ['rules/', 'docs/rules/'];
    }
  }
}

/**
 * Get project by ID from config
 */
export function getProject(config: RulesetConfig, projectId: string) {
  const project = config.projects.find(p => p.id === projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  return project;
}
