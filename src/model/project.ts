/**
 * Project configuration model
 */

export interface Project {
  /** Unique identifier for the project */
  id: string;

  /** Display name */
  name: string;

  /** File system paths for this project */
  paths: string[];

  /** GitHub URL (optional) */
  github_url?: string;

  /** Paths to search for rules files */
  rulesPaths: string[];

  /** Project description (optional) */
  description?: string;

  /** Whether this project is enabled */
  enabled?: boolean;
}

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  description?: string;
}
