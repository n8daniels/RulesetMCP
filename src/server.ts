/**
 * MCP Server implementation for RulesetMCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { RulesetConfig } from './model/config.js';
import { RuleService } from './services/ruleService.js';
import { ProjectInfo } from './model/project.js';

export class RulesetMCPServer {
  private server: Server;
  private ruleService: RuleService;
  private config: RulesetConfig;

  constructor(config: RulesetConfig) {
    this.config = config;
    this.ruleService = new RuleService(config);

    this.server = new Server(
      {
        name: 'rulesetmcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_projects':
            return await this.handleListProjects();

          case 'get_rules':
            return await this.handleGetRules(args as any);

          case 'validate_snippet':
            return await this.handleValidateSnippet(args as any);

          case 'summarize_rules_for_task':
            return await this.handleSummarizeRulesForTask(args as any);

          case 'reload_rules':
            return await this.handleReloadRules(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'list_projects',
        description: 'List all available projects and their rule sets',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_rules',
        description: 'Get rules for a project with optional filtering by area, tags, or severity',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project identifier',
            },
            area: {
              type: 'string',
              description: 'Filter by area (e.g., "sql", "security", "api")',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags',
            },
            severity: {
              type: 'string',
              enum: ['info', 'warn', 'error', 'blocker'],
              description: 'Filter by severity',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of rules to return',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'validate_snippet',
        description: 'Validate a code/SQL snippet against project rules and get violation details with suggested fixes',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project identifier',
            },
            area: {
              type: 'string',
              description: 'Area/domain of the snippet (e.g., "sql", "csharp")',
            },
            snippet: {
              type: 'string',
              description: 'The code/SQL snippet to validate',
            },
            path: {
              type: 'string',
              description: 'Optional file path (helps determine which rules apply)',
            },
          },
          required: ['projectId', 'snippet'],
        },
      },
      {
        name: 'summarize_rules_for_task',
        description: 'Get a task-oriented summary of relevant rules before starting work on a specific task',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project identifier',
            },
            taskDescription: {
              type: 'string',
              description: 'Description of the task to be performed',
            },
            areasHint: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional hint about which areas are relevant',
            },
          },
          required: ['projectId', 'taskDescription'],
        },
      },
      {
        name: 'reload_rules',
        description: 'Hot-reload rules for a project after editing rule files on disk',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project identifier',
            },
          },
          required: ['projectId'],
        },
      },
    ];
  }

  private async handleListProjects() {
    const projects: ProjectInfo[] = this.config.projects.map(p => ({
      id: p.id,
      name: p.name,
      path: p.paths[0], // Primary path
      description: p.description,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ projects }, null, 2),
        },
      ],
    };
  }

  private async handleGetRules(args: {
    projectId: string;
    area?: string;
    tags?: string[];
    severity?: string;
    limit?: number;
  }) {
    const rules = await this.ruleService.getRules(args as any);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ rules }, null, 2),
        },
      ],
    };
  }

  private async handleValidateSnippet(args: {
    projectId: string;
    area?: string;
    snippet: string;
    path?: string;
  }) {
    const violations = await this.ruleService.validateSnippet(args as any);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ violations }, null, 2),
        },
      ],
    };
  }

  private async handleSummarizeRulesForTask(args: {
    projectId: string;
    taskDescription: string;
    areasHint?: string[];
  }) {
    const result = await this.ruleService.summarizeRulesForTask(args as any);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleReloadRules(args: { projectId: string }) {
    const result = await this.ruleService.reloadRules(args.projectId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('RulesetMCP server running on stdio');
  }
}
