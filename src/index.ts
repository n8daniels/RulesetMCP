#!/usr/bin/env node

/**
 * RulesetMCP - Weight-On-Wheels for AI
 * Entry point for the MCP server
 */

import { loadConfig } from './config.js';
import { RulesetMCPServer } from './server.js';

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let configPath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--config' || args[i] === '-c') {
        configPath = args[i + 1];
        i++;
      } else if (args[i] === '--help' || args[i] === '-h') {
        printHelp();
        process.exit(0);
      } else if (args[i] === '--version' || args[i] === '-v') {
        console.log('rulesetmcp v0.1.0');
        process.exit(0);
      }
    }

    // Load configuration
    console.error('Loading configuration...');
    const { config, configPath: loadedPath } = await loadConfig(configPath);
    console.error(`Loaded config from: ${loadedPath}`);
    console.error(`Monitoring ${config.projects.length} project(s)`);

    // Start MCP server
    const server = new RulesetMCPServer(config);
    await server.run();
  } catch (error) {
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
RulesetMCP - Weight-On-Wheels for AI

Usage:
  rulesetmcp [options]

Options:
  --config, -c <path>    Path to config file (default: search for rulesetmcp.config.json)
  --help, -h             Show this help message
  --version, -v          Show version

Config File:
  Create a rulesetmcp.config.json in your project root:

  {
    "projects": [
      {
        "id": "my-project",
        "name": "My Project",
        "paths": ["/path/to/project"],
        "rulesPaths": ["rules/", "docs/rules/"]
      }
    ]
  }

Examples:
  rulesetmcp
  rulesetmcp --config /path/to/config.json

Documentation:
  https://github.com/n8daniels/RulesetMCP
`);
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
