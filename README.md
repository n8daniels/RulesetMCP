# RulesetMCP

> **Weight-On-Wheels for AI**: Keep every agent grounded in your project's rules.

RulesetMCP is a Model Context Protocol (MCP) server that gives AI agents a project-aware rulebook. Instead of explaining your coding standards, SQL conventions, or process guidelines every time you open a new AI session, you define them once in version-controlled files. RulesetMCP reads those files and exposes tools for listing, summarizing, and applying rules to specific tasks and snippets.

## The Problem

Right now you probably:
- ✋ Repeat the same context to AI every session ("Use UPPER-CASE for SQL keywords")
- 📝 Maintain scattered documentation that AI can't easily query
- 🔄 Re-explain architecture decisions across different AI tools
- ⚠️ Hope the AI remembers your project's conventions

## The Solution

**RulesetMCP acts like a "Weight-On-Wheels" switch for AI assistants**: once your rules are loaded, every action is grounded in them. This keeps your rewrites, refactors, and new features aligned with the architecture and process decisions you've already made.

## Hosted deployment

A hosted deployment is available on [Fronteir AI](https://fronteir.ai/mcp/n8daniels-rulesetmcp).

## Features

- 🔍 **Project discovery** via `list_projects`
- 📋 **Structured rules** from Markdown and YAML
- 🎯 **Contextual queries** with `get_rules` (filter by area, tags, severity)
- 📊 **Task-oriented summaries** with `summarize_rules_for_task`
- ✅ **Snippet validation** with `validate_snippet`
- 🔄 **Hot-reload** rules with `reload_rules`
- 🌐 **Universal compatibility** via MCP protocol (works with Claude Code, Claude Desktop, and any MCP-compatible client)

## Quick Start

### 1. Install

```bash
npm install -g rulesetmcp
```

Or clone and build locally:

```bash
git clone https://github.com/n8daniels/RulesetMCP.git
cd RulesetMCP
npm install
npm run build
```

### 2. Create Config

Create `rulesetmcp.config.json` in your workspace:

```json
{
  "projects": [
    {
      "id": "my-api",
      "name": "My API Project",
      "paths": ["/path/to/my-api"],
      "rulesPaths": ["rules/", "docs/rules/"]
    }
  ],
  "defaultProjectId": "my-api"
}
```

### 3. Add Rules

Create `rules/RULES.md` in your project:

```markdown
# My API - Coding Standards

## [api-naming-001] RESTful endpoint naming

**Area:** api
**Severity:** warn
**Tags:** api, rest, naming

**Description:**
All REST endpoints must use plural nouns and follow `/api/v1/{resource}` pattern.

**Good Example:**
```
GET /api/v1/users
POST /api/v1/orders
```

**Bad Example:**
```
GET /api/getUser
POST /api/create-order
```
```

### 4. Configure Your MCP Client

**Claude Desktop (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "rulesetmcp": {
      "command": "rulesetmcp",
      "args": ["--config", "/path/to/rulesetmcp.config.json"]
    }
  }
}
```

**Claude Code (`.claude/settings.json`):**

```json
{
  "mcp": {
    "rulesetmcp": {
      "command": "rulesetmcp",
      "args": ["--config", "/path/to/rulesetmcp.config.json"]
    }
  }
}
```

### 5. Use It!

Now when you work with AI:

```
You: "Refactor this SQL stored procedure to pull more data from the users table"

AI: [Calls get_rules for project="my-api", area="sql"]
AI: "Based on your project's SQL rules, I'll ensure:
     - All keywords are UPPER-CASE
     - Identifiers use lower_case
     - Proper indexing hints are included

     Here's the refactored procedure..."
```

## Rule Formats

RulesetMCP supports multiple formats:

### Markdown (RULES.md)

```markdown
## [rule-id] Rule Title

**Area:** sql
**Severity:** error
**Tags:** formatting, style

**Description:** What the rule requires

**Rationale:** Why this matters

**Good Example:**
```sql
SELECT * FROM users;
```

**Bad Example:**
```sql
select * from Users;
```
```

### YAML (rules/*.yaml)

```yaml
- id: sql-format-001
  project: my-api
  area: sql
  title: SQL casing convention
  description: All SQL must use UPPER-CASE keywords and lower_case identifiers
  severity: warn
  tags: [sql, style, formatting]
  examples:
    good: |
      SELECT u.user_id FROM users u;
    bad: |
      select UserID from Users;
  appliesTo:
    - "*.sql"
    - "procedures/*"
```

## MCP Tools

### `list_projects`
Discover available projects and their rule sets.

### `get_rules`
Query rules by project, area, tags, or severity.

### `validate_snippet`
Validate code/SQL/config against project rules and get fix suggestions.

### `summarize_rules_for_task`
Get a task-oriented summary of relevant rules before starting work.

### `reload_rules`
Hot-reload rules after editing files on disk.

## Philosophy

RulesetMCP embodies the **"Weight-On-Wheels"** principle: just like an aircraft can't ignore physics once grounded, AI agents shouldn't ignore your project's rules once RulesetMCP is enabled.

**This is not just documentation** - it's:
- ✅ Machine-readable and queryable
- ✅ Version-controlled with your code
- ✅ Enforceable via validation tools
- ✅ Universal across all MCP-compatible AI tools

## Examples

See the `examples/` directory for complete sample projects:

- `nodejs-api/` - REST API with TypeScript standards
- `python-django/` - Django project with security rules
- `dotnet-webapi/` - .NET API with architecture patterns

## Use Cases

### SQL Standardization
```yaml
- id: sql-format-001
  area: sql
  title: SQL keyword casing
  description: All SQL keywords UPPER-CASE, identifiers lower_case
  severity: warn
```

### Security Guardrails
```yaml
- id: security-001
  area: security
  title: No hardcoded secrets
  description: Use environment variables or secure vaults
  severity: blocker
```

### Architecture Patterns
```yaml
- id: arch-http-001
  area: architecture
  title: Use HttpClientFactory
  description: Never instantiate HttpClient directly
  severity: error
```

### Migration Rules
```yaml
- id: migration-001
  area: migration
  title: Preserve backward compatibility
  description: When refactoring API endpoints, maintain old routes with redirects
  severity: blocker
```

## Roadmap

- [x] Phase 1: Core MCP server with basic tools
- [x] Phase 2: Multi-format rule loading (Markdown, YAML)
- [ ] Phase 3: Advanced validation with pattern matching
- [ ] Phase 4: LLM-assisted rule violation detection
- [ ] Phase 5: VSCode extension for inline hints
- [ ] Phase 6: Pre-commit hooks and CI/CD integration
- [ ] Community rule packs (OWASP, Google Style Guide, etc.)

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Building From Source

```bash
npm install
npm run build
npm start
```

## License

MIT License - see [LICENSE](LICENSE)

## Support

- **Issues**: https://github.com/n8daniels/RulesetMCP/issues
- **Discussions**: https://github.com/n8daniels/RulesetMCP/discussions
- **MCP Community**: https://discord.gg/anthropic

---

**Built with ❤️ for developers tired of repeating themselves to AI**

*"Stop explaining. Start enforcing."*
