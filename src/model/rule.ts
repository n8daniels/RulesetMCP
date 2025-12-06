/**
 * Core rule model for RulesetMCP
 */

export type RuleSeverity = "info" | "warn" | "error" | "blocker";

export type RuleArea =
  | "sql"
  | "csharp"
  | "javascript"
  | "typescript"
  | "python"
  | "testing"
  | "security"
  | "api"
  | "architecture"
  | "migration"
  | "process"
  | "pm"
  | "general"
  | string; // Allow custom areas

export interface RuleExample {
  good?: string;
  bad?: string;
}

export interface Rule {
  /** Unique identifier for the rule (e.g., "sql-format-001") */
  id: string;

  /** Project this rule belongs to */
  project: string;

  /** Area/domain this rule applies to */
  area: RuleArea;

  /** Short title for the rule */
  title: string;

  /** Detailed description of what the rule requires */
  description: string;

  /** Why this rule exists (optional) */
  rationale?: string;

  /** Severity level */
  severity: RuleSeverity;

  /** Tags for categorization and filtering */
  tags: string[];

  /** Code examples (optional) */
  examples?: RuleExample;

  /** Optional regex or pattern hint for matching */
  pattern?: string;

  /** File patterns this rule applies to (optional) */
  appliesTo?: string[];

  /** Source file where this rule was defined */
  source?: string;
}

export interface RuleViolation {
  /** The rule that was violated */
  ruleId: string;

  /** Human-readable message about the violation */
  message: string;

  /** Severity of the violation */
  severity: RuleSeverity;

  /** Suggested fix (optional) */
  suggestedSnippet?: string;

  /** Line number in the original snippet (if applicable) */
  line?: number;
}
