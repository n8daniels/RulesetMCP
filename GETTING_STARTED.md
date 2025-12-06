# Getting Started with RulesetMCP

## What is RulesetMCP?

RulesetMCP is like a "rulebook" for AI assistants working on your codebase. Instead of explaining your coding standards, SQL conventions, or security requirements every session, you define them once in files, and RulesetMCP makes them queryable and enforceable.

Think of it as **"Weight-On-Wheels" for AI** - once enabled, AI agents are grounded in your project's rules and can't ignore them.

## Quick Start (5 minutes)

### 1. Install RulesetMCP

```bash
npm install -g rulesetmcp
```

Or from source:
```bash
git clone https://github.com/n8daniels/RulesetMCP.git
cd RulesetMCP
npm install
npm run build
```

### 2. Create Your First Rule File

In your project (e.g., `./rules/RULES.md`):

```markdown
# My Project - Rules

## [security-001] No hardcoded secrets

**Area:** security
**Severity:** blocker
**Tags:** security, secrets

**Description:**
Never commit API keys, passwords, or credentials to version control.

**Good Example:**
```javascript
const apiKey = process.env.API_KEY;
```

**Bad Example:**
```javascript
const apiKey = 'sk_live_12345';  // NEVER DO THIS
```
```

### 3. Create Config File

Create `rulesetmcp.config.json` in your workspace:

```json
{
  "projects": [
    {
      "id": "my-project",
      "name": "My Project",
      "paths": ["/path/to/my/project"],
      "rulesPaths": ["rules/", "docs/rules/"]
    }
  ],
  "defaultProjectId": "my-project"
}
```

### 4. Test It

```bash
# Start the MCP server (for testing)
node dist/index.js --config rulesetmcp.config.json
```

### 5. Connect to Claude Code

Add to your `.claude/settings.json`:

```json
{
  "mcp": {
    "rulesetmcp": {
      "command": "node",
      "args": [
        "/mnt/c/Users/n8dan/Desktop/Apps/RulesetMCP/dist/index.js",
        "--config",
        "/mnt/c/Users/n8dan/Desktop/Apps/RulesetMCP/rulesetmcp.config.json"
      ]
    }
  }
}
```

## Using RulesetMCP with AI

Once configured, AI assistants can:

### Discover Available Projects
```
AI: What projects have rules defined?
Tool: list_projects
Result: my-api, my-frontend, my-backend
```

### Query Rules Before Coding
```
You: "Refactor this SQL stored procedure"
AI: [Calls get_rules for project="my-api", area="sql"]
AI: "Based on your SQL rules, I'll ensure:
     - UPPER-CASE keywords
     - Proper RLS policies
     - Transaction patterns

     Here's the refactored code..."
```

### Validate Code Against Rules
```
You: "Is this code following our standards?"
AI: [Calls validate_snippet with your code]
AI: "Found 2 violations:
     1. [security-001] Hardcoded API key detected
     2. [sql-format-001] Keywords should be UPPER-CASE

     Here's the corrected version..."
```

### Get Task-Oriented Guidance
```
You: "I need to add user authentication"
AI: [Calls summarize_rules_for_task]
AI: "For authentication in your project:
     - Use your configured auth provider
     - Enable proper access controls
     - Never store passwords in plain text
     ..."
```

## Rule File Formats

### Markdown (RULES.md)

Best for human-readable documentation:

```markdown
## [rule-id] Rule Title

**Area:** security
**Severity:** blocker
**Tags:** tag1, tag2

**Description:** What this rule requires

**Rationale:** Why it matters

**Good Example:**
```
good code
```

**Bad Example:**
```
bad code
```
```

### YAML (rules/*.yaml)

Best for machine-readable, structured rules:

```yaml
- id: security-001
  area: security
  title: No hardcoded secrets
  description: Use environment variables
  severity: blocker
  tags: [security, secrets]
  examples:
    good: |
      const key = process.env.API_KEY;
    bad: |
      const key = 'abc123';
  appliesTo:
    - "*.js"
    - "*.ts"
```

## Rule Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Unique identifier (e.g., "sql-001") |
| `area` | ✅ | Domain (sql, security, api, etc.) |
| `title` | ✅ | Short title |
| `description` | ✅ | What the rule requires |
| `severity` | ✅ | info, warn, error, blocker |
| `tags` | ✅ | Array of tags for filtering |
| `rationale` | ❌ | Why the rule exists |
| `examples` | ❌ | Good/bad code examples |
| `pattern` | ❌ | Regex for matching |
| `appliesTo` | ❌ | File patterns (e.g., "*.sql") |

## Severity Levels

- **info**: Suggestions, best practices
- **warn**: Should fix, not critical
- **error**: Must fix before merging
- **blocker**: Critical, blocks all work

## Common Use Cases

### SQL Standards
```yaml
- id: sql-format-001
  area: sql
  title: SQL keyword casing
  severity: warn
  description: Keywords UPPER, identifiers lower
```

### Security Rules
```yaml
- id: security-rls-001
  area: security
  title: Enable RLS on customer tables
  severity: blocker
  description: All customer data tables must have RLS
```

### API Conventions
```yaml
- id: api-rest-001
  area: api
  title: RESTful URL patterns
  severity: warn
  description: Use /api/v1/{plural-resource}
```

### Testing Requirements
```yaml
- id: testing-coverage-001
  area: testing
  title: Critical workflows need E2E tests
  severity: error
  description: All revenue-critical flows must have Playwright tests
```

## Advanced Configuration

### Multiple Projects

```json
{
  "projects": [
    {
      "id": "frontend",
      "name": "Frontend App",
      "paths": ["/path/to/frontend"],
      "rulesPaths": ["rules/"]
    },
    {
      "id": "backend",
      "name": "Backend API",
      "paths": ["/path/to/backend"],
      "rulesPaths": ["docs/rules/", "rules/"]
    }
  ],
  "defaultProjectId": "frontend"
}
```

### Logging

```json
{
  "projects": [...],
  "logging": {
    "level": "debug",
    "file": "/path/to/rulesetmcp.log"
  }
}
```

## Tips & Best Practices

### 1. Start Small
Begin with 5-10 high-impact rules:
- Critical security rules (blocker)
- Code formatting standards (warn)
- Architecture patterns (error)

### 2. Use Clear IDs
```
✅ sql-format-001
✅ security-rls-001
✅ api-rest-naming-001

❌ rule1
❌ important-rule
```

### 3. Include Rationale
Explain **why** rules exist:
```yaml
rationale: "RLS prevents customers from accessing each other's data, critical for GDPR compliance"
```

### 4. Provide Examples
Code examples make rules actionable:
```yaml
examples:
  good: "SELECT * FROM users WHERE id = auth.uid();"
  bad: "SELECT * FROM users;  -- Exposes all data!"
```

### 5. Version Control Rules
Commit rules to Git alongside code:
```bash
git add rules/RULES.md
git commit -m "Add RLS security rule"
```

### 6. Hot Reload After Edits
```
You: "I just updated the SQL rules"
AI: [Calls reload_rules]
AI: "Reloaded 12 rules for my-project"
```

## Troubleshooting

### MCP Server Won't Start
```bash
# Check config is valid JSON
cat rulesetmcp.config.json | json_pp

# Check paths exist
ls /path/to/project/rules
```

### Rules Not Loading
```bash
# Check file names match patterns
# ✅ RULES.md, rules.md, *.rules.yaml
# ❌ my-rules.md, standards.txt
```

### AI Not Using Rules
Ensure MCP server is configured in your AI client and running.

## Next Steps

1. ✅ Create rules for your most critical standards
2. ✅ Configure RulesetMCP in Claude Code
3. ✅ Test with a simple query
4. ✅ Expand rule coverage over time
5. ✅ Share rules with your team via Git

## Need Help?

- [GitHub Issues](https://github.com/n8daniels/RulesetMCP/issues)
- [Full Documentation](README.md)
- [MCP Community Discord](https://discord.gg/anthropic)
