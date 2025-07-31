/**
 * STDIO-specific MCP Server
 * Uses isolated HTTP client to work around MCP SDK issues
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { HeyReachClientSimple } from './heyreach-client-simple.js';

export interface HeyReachStdioServerConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export class HeyReachStdioServer {
  private server: McpServer;
  private heyReachClient: HeyReachClientSimple;

  constructor(config: HeyReachStdioServerConfig) {
    this.server = new McpServer({
      name: 'heyreach-mcp-server',
      version: '2.0.6'
    });

    this.heyReachClient = new HeyReachClientSimple({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout
    });

    this.setupTools();
  }

  private setupTools() {
    // Check API Key tool
    this.server.tool(
      'check-api-key',
      {
        description: 'Verify that the HeyReach API key is valid and working'
      },
      async () => {
        const result = await this.heyReachClient.checkApiKey();
        
        if (result.success) {
          return {
            content: [{
              type: 'text',
              text: `✅ API key is valid and working correctly`
            }]
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `❌ API key validation failed: ${result.error}`
            }],
            isError: true
          };
        }
      }
    );

    // Get All Campaigns tool
    this.server.tool(
      'get-all-campaigns',
      {
        description: 'Retrieve all campaigns from your HeyReach account'
      },
      async () => {
        const result = await this.heyReachClient.getAllCampaigns();
        
        if (result.success) {
          const campaigns = result.data || [];
          return {
            content: [{
              type: 'text',
              text: `Found ${campaigns.length} campaigns:\n\n${campaigns.map(c => 
                `• ${c.name} (ID: ${c.id}) - Status: ${c.status}`
              ).join('\n')}`
            }]
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `❌ Failed to retrieve campaigns: ${result.error}`
            }],
            isError: true
          };
        }
      }
    );

    // Get Campaign Details tool
    this.server.tool(
      'get-campaign-details',
      {
        description: 'Get detailed information about a specific campaign',
        inputSchema: z.object({
          campaignId: z.string().describe('The unique identifier of the campaign')
        })
      },
      async (args) => {
        const result = await this.heyReachClient.getCampaignDetails(args.campaignId);
        
        if (result.success && result.data) {
          const campaign = result.data;
          return {
            content: [{
              type: 'text',
              text: `Campaign Details:\n\n` +
                   `Name: ${campaign.name}\n` +
                   `ID: ${campaign.id}\n` +
                   `Status: ${campaign.status}\n` +
                   `Created: ${campaign.creationTime}\n` +
                   `Progress: ${campaign.progressStats ? JSON.stringify(campaign.progressStats, null, 2) : 'No progress data available'}`
            }]
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `❌ Failed to get campaign details: ${result.error}`
            }],
            isError: true
          };
        }
      }
    );

    // Toggle Campaign Status tool
    this.server.tool(
      'toggle-campaign-status',
      {
        description: 'Pause or resume a campaign',
        inputSchema: z.object({
          campaignId: z.string().describe('The unique identifier of the campaign'),
          action: z.enum(['pause', 'resume']).describe('Action to perform: pause or resume')
        })
      },
      async (args) => {
        const result = await this.heyReachClient.toggleCampaignStatus(args.campaignId, args.action);
        
        if (result.success) {
          return {
            content: [{
              type: 'text',
              text: `✅ Campaign ${args.action}d successfully`
            }]
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `❌ Failed to ${args.action} campaign: ${result.error}`
            }],
            isError: true
          };
        }
      }
    );

    // Get Overall Stats tool
    this.server.tool(
      'get-overall-stats',
      {
        description: 'Get overall account statistics and performance metrics'
      },
      async () => {
        const result = await this.heyReachClient.getOverallStats();
        
        if (result.success) {
          return {
            content: [{
              type: 'text',
              text: `Overall Statistics:\n\n${JSON.stringify(result.data, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `❌ Failed to retrieve overall stats: ${result.error}`
            }],
            isError: true
          };
        }
      }
    );
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('HeyReach MCP Server (STDIO Isolated) started successfully');
  }

  getServer() {
    return this.server;
  }
}
