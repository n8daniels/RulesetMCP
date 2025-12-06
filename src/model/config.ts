/**
 * Configuration model for RulesetMCP
 */

import { Project } from './project.js';

export interface RulesetConfig {
  /** List of projects to monitor */
  projects: Project[];

  /** Default project ID to use if not specified */
  defaultProjectId?: string;

  /** Base path for resolving relative paths */
  basePath?: string;

  /** Logging configuration */
  logging?: {
    level?: "debug" | "info" | "warn" | "error";
    file?: string;
  };
}

export interface LoadedConfig {
  config: RulesetConfig;
  configPath: string;
}
