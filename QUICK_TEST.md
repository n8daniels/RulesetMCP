# Quick Test Guide

## Test RulesetMCP Right Now (5 minutes)

### 1. Verify Build

```bash
cd /mnt/c/Users/n8dan/Desktop/Apps/RulesetMCP
ls dist/  # Should see compiled .js files
```

### 2. Test Locally (Without MCP Client)

```bash
# Start the server (it will wait for MCP requests on stdin)
node dist/index.js --config rulesetmcp.config.json
```

**Expected output:**
```
Loading configuration...
Loaded config from: /mnt/c/Users/n8dan/Desktop/Apps/RulesetMCP/rulesetmcp.config.json
Monitoring 3 project(s)
RulesetMCP server running on stdio
```

Press `Ctrl+C` to stop.

### 3. Configure in Claude Code

Add to `.claude/settings.json` (or `.claude/settings.local.json`):

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

### 4. Restart Claude Code

```bash
# Exit Claude Code and restart
# Or reload if there's a reload command
```

### 5. Test Queries

In a new Claude Code session, try:

**Query 1: List Projects**
```
You: "What projects do I have rules for?"
AI: [Should call list_projects tool]
AI: "You have rules defined for:
     - ServicePRO (Roofing CRM)
     - Glasir
     - RulesetMCP"
```

**Query 2: Get SQL Rules**
```
You: "What are my SQL rules for ServicePRO?"
AI: [Should call get_rules with projectId="servicepro", area="sql"]
AI: "Currently no SQL rules defined. Would you like me to help create some?"
```

**Query 3: Get Security Rules**
```
You: "What security rules do I have for ServicePRO?"
AI: [Should call get_rules with projectId="servicepro", area="security"]
AI: "You have 2 critical security rules:
     1. [crm-supabase-001] Always use Row Level Security (blocker)
     2. [crm-auth-001] Use Supabase Auth SSR (blocker)"
```

**Query 4: Validate Code**
```
You: "Check this against my rules:
     const apiKey = 'sk_live_12345';"

AI: [Should call validate_snippet]
AI: "Violation found:
     [security-001] No hardcoded secrets (blocker)

     Suggested fix:
     const apiKey = process.env.API_KEY;"
```

**Query 5: Task Summary**
```
You: "I need to refactor a stored procedure in ServicePRO"

AI: [Should call summarize_rules_for_task]
AI: "For ServicePRO, when working with SQL:
     - Ensure RLS is enabled
     - Use proper transaction patterns
     ..."
```

### 6. Add More Rules

Edit `/mnt/c/Users/n8dan/Desktop/Apps/CRMTool/rules/RULES.md`:

```markdown
## [crm-sql-001] SQL formatting standards

**Area:** sql
**Severity:** warn
**Tags:** sql, style, formatting

**Description:**
All SQL must use UPPER-CASE keywords and lower_case identifiers.

**Good Example:**
```sql
SELECT customer_id FROM customers WHERE created_at >= @start_date;
```

**Bad Example:**
```sql
select CustomerID from Customers where CreatedAt >= @StartDate;
```
```

Save, then in Claude Code:

```
You: "Reload rules for ServicePRO"
AI: [Calls reload_rules]
AI: "Reloaded 6 rules for ServicePRO"
```

### 7. Test Validation

```
You: "Is this SQL correct for ServicePRO?
     select CustomerID from Customers where Status = 'active'"

AI: [Calls validate_snippet]
AI: "Violation found:
     [crm-sql-001] SQL keywords should be UPPER-CASE

     Corrected:
     SELECT customer_id FROM customers WHERE status = 'active'"
```

---

## Troubleshooting

### MCP Server Not Starting
```bash
# Check config is valid
cat rulesetmcp.config.json | jq .

# Check paths exist
ls /mnt/c/Users/n8dan/Desktop/Apps/CRMTool/rules/
```

### Claude Code Not Seeing Tools
1. Check `.claude/settings.json` has correct paths
2. Restart Claude Code completely
3. Check for MCP errors in Claude Code logs

### Rules Not Loading
```bash
# Check file name is correct
ls /mnt/c/Users/n8dan/Desktop/Apps/CRMTool/rules/RULES.md

# Check format is valid (## [id] Title)
head -20 /mnt/c/Users/n8dan/Desktop/Apps/CRMTool/rules/RULES.md
```

---

## Success Indicators

✅ MCP server starts without errors
✅ Claude Code can call `list_projects`
✅ Rules load from ServicePRO
✅ `get_rules` returns defined rules
✅ `validate_snippet` detects violations
✅ `summarize_rules_for_task` provides context

---

## Next Steps After Testing

1. ✅ Add more rules for ServicePRO (SQL, security, testing)
2. ✅ Create rules for Glasir project
3. ✅ Configure Saga to sync RULES.md files
4. ✅ Share on GitHub
5. ✅ Announce to MCP community

---

**You're ready to test! Start with step 1 above.** 🚀
