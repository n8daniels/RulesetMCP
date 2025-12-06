# Contributing to RulesetMCP

Thank you for your interest in contributing to RulesetMCP!

## Ways to Contribute

1. **Report Bugs** - Open GitHub issues
2. **Suggest Features** - Propose new tools or capabilities
3. **Improve Documentation** - Fix typos, add examples
4. **Share Rule Packs** - Contribute community rule sets
5. **Write Code** - Submit pull requests

## Development Setup

```bash
git clone https://github.com/n8daniels/RulesetMCP.git
cd RulesetMCP
npm install
npm run build
```

## Testing Your Changes

```bash
# Build
npm run build

# Run locally
node dist/index.js --config rulesetmcp.config.json
```

## Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments for public APIs
- Run `npm run build` before committing

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Build and test (`npm run build`)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Community Rule Packs

Want to contribute rule packs? Create a PR adding:

```
community-rules/
├── owasp-security/
│   └── RULES.md
├── google-style-guide/
│   └── RULES.md
└── your-rule-pack/
    └── RULES.md
```

## License

By contributing, you agree your contributions will be licensed under the MIT License.
