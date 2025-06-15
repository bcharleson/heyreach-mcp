import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { HeyReachClient } from './heyreach-client.js';
import { HeyReachConfig } from './types.js';
import {
  handleHeyReachError,
  validateRequiredParams,
  validateToolDependencies,
  validateParameterTypes,
  createSuccessResponse,
  createErrorResponse
} from './error-handler.js';

export class HeyReachMcpServer {
  private server: McpServer;
  private heyReachClient: HeyReachClient;

  constructor(config: HeyReachConfig) {
    this.server = new McpServer({
      name: 'heyreach-mcp-server',
      version: '1.2.0', // Production v1 with critical endpoints and bulletproof tooling
    }, {
      capabilities: {
        tools: {}
        // TODO: Add logging capability when MCP SDK supports it properly
      }
    });

    this.heyReachClient = new HeyReachClient(config);
    this.setupTools();
  }

  private setupTools() {
    // Only setup working tools - based on API validation results
    this.setupCoreTools();
    this.setupCriticalTools(); // NEW: LinkedIn accounts, campaign creation, etc.
    this.setupConversationTools();
    this.setupAnalyticsTools();
    this.setupListTools();
  }



  private setupCoreTools() {
    // API Key validation - TESTED AND WORKING ✅
    this.server.tool(
      'check-api-key',
      {},
      async () => {
        try {
          const result = await this.heyReachClient.checkApiKey();
          return createSuccessResponse(
            { valid: result.data, status: 'API key is working correctly' },
            'API key validation completed'
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Get all campaigns - TESTED AND WORKING ✅
    this.server.tool(
      'get-all-campaigns',
      {
        offset: z.number().optional().default(0).describe('Number of records to skip (for pagination)'),
        limit: z.number().optional().default(50).describe('Maximum number of campaigns to return (1-100)')
      },
      async ({ offset, limit }) => {
        try {
          validateParameterTypes({ offset, limit }, { offset: 'number', limit: 'number' }, 'get-all-campaigns');

          const result = await this.heyReachClient.getAllCampaigns(offset, limit);
          return createSuccessResponse(
            {
              campaigns: result.data,
              pagination: result.pagination,
              total: result.pagination?.total || 0
            },
            `Retrieved ${result.data?.length || 0} campaigns`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Get ACTIVE campaigns for lead addition - PRODUCTION-READY PATTERN ✅
    this.server.tool(
      'get-active-campaigns',
      {
        offset: z.number().optional().default(0).describe('Number of records to skip (for pagination)'),
        limit: z.number().optional().default(50).describe('Maximum number of campaigns to return (1-100)')
      },
      async ({ offset, limit }) => {
        try {
          validateParameterTypes({ offset, limit }, { offset: 'number', limit: 'number' }, 'get-active-campaigns');

          // Get all campaigns first
          const result = await this.heyReachClient.getAllCampaigns(offset, limit);

          // Filter for ACTIVE campaigns only
          const activeCampaigns = (result.data || []).filter(campaign =>
            campaign.status && ['ACTIVE', 'IN_PROGRESS'].includes(campaign.status)
          );

          // Add validation status for each campaign
          const campaignsWithValidation = activeCampaigns.map(campaign => ({
            ...campaign,
            readyForLeads: !!(campaign.campaignAccountIds && campaign.campaignAccountIds.length > 0),
            linkedInSendersCount: campaign.campaignAccountIds?.length || 0,
            validationStatus: (campaign.campaignAccountIds && campaign.campaignAccountIds.length > 0)
              ? 'READY'
              : 'NEEDS_LINKEDIN_SENDERS'
          }));

          const readyCampaigns = campaignsWithValidation.filter(c => c.readyForLeads);

          return createSuccessResponse(
            {
              activeCampaigns: campaignsWithValidation,
              readyForLeads: readyCampaigns,
              summary: {
                totalActive: activeCampaigns.length,
                readyForLeads: readyCampaigns.length,
                needsLinkedInSenders: activeCampaigns.length - readyCampaigns.length
              },
              pagination: result.pagination
            },
            `Found ${activeCampaigns.length} ACTIVE campaigns, ${readyCampaigns.length} ready for adding leads`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Get campaign details - FIXED ENDPOINT ✅
    this.server.tool(
      'get-campaign-details',
      {
        campaignId: z.number().describe('**PREREQUISITE**: Use get-all-campaigns or get-active-campaigns first to get valid campaign IDs. The ID of the campaign to retrieve details for')
      },
      async ({ campaignId }) => {
        try {
          validateRequiredParams({ campaignId }, ['campaignId'], 'get-campaign-details');
          validateParameterTypes({ campaignId }, { campaignId: 'number' }, 'get-campaign-details');

          const result = await this.heyReachClient.getCampaignDetails(campaignId);
          return createSuccessResponse(result.data, 'Campaign details retrieved successfully');
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Toggle campaign status (pause/resume) - TESTED AND WORKING ✅
    this.server.tool(
      'toggle-campaign-status',
      {
        campaignId: z.number().describe('**PREREQUISITE**: Use get-all-campaigns or get-active-campaigns first to get valid campaign IDs. The ID of the campaign to pause or resume'),
        action: z.enum(['pause', 'resume']).describe('Action to perform: "pause" to pause the campaign, "resume" to resume it')
      },
      async ({ campaignId, action }) => {
        try {
          validateRequiredParams({ campaignId, action }, ['campaignId', 'action'], 'toggle-campaign-status');
          validateParameterTypes({ campaignId }, { campaignId: 'number' }, 'toggle-campaign-status');

          const result = await this.heyReachClient.toggleCampaignStatus(campaignId, action);
          return createSuccessResponse(
            result.data,
            `Campaign ${action}d successfully`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );
  }

  private setupCriticalTools() {
    // Get LinkedIn accounts - CRITICAL FOR CAMPAIGN CREATION ✅
    this.server.tool(
      'get-linkedin-accounts',
      {
        offset: z.number().optional().default(0).describe('Number of records to skip (for pagination)'),
        limit: z.number().optional().default(50).describe('Maximum number of LinkedIn accounts to return (1-100)')
      },
      async ({ offset, limit }) => {
        try {
          validateParameterTypes({ offset, limit }, { offset: 'number', limit: 'number' }, 'get-linkedin-accounts');

          const result = await this.heyReachClient.getLinkedInAccounts(offset, limit);
          return createSuccessResponse(
            {
              accounts: result.data,
              pagination: result.pagination,
              total: result.pagination?.total || 0
            },
            `Retrieved ${result.data?.length || 0} LinkedIn accounts`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Create campaign - CRITICAL FOR AUTOMATION ✅
    this.server.tool(
      'create-campaign',
      {
        name: z.string().describe('Name for the new campaign'),
        listId: z.number().describe('**PREREQUISITE**: Use create-empty-list to create a list first. The ID of the lead list to use for this campaign'),
        linkedInAccountIds: z.array(z.number()).describe('**PREREQUISITE**: Use get-linkedin-accounts to get valid account IDs. Array of LinkedIn account IDs to assign to this campaign'),
        sequence: z.object({
          steps: z.array(z.object({
            type: z.enum(['CONNECTION_REQUEST', 'MESSAGE', 'INMAIL', 'VIEW_PROFILE']).describe('Type of action to perform'),
            delay: z.number().describe('Number of days to wait before this step'),
            message: z.string().optional().describe('Message content (supports {{firstName}}, {{lastName}}, {{companyName}} variables)'),
            noteText: z.string().optional().describe('Note text for connection requests')
          }))
        }).describe('Campaign sequence with steps to execute'),
        settings: z.object({
          stopOnReply: z.boolean().optional().default(true).describe('Stop campaign when lead replies'),
          stopOnAutoReply: z.boolean().optional().default(true).describe('Stop campaign on auto-reply detection'),
          excludeInOtherCampaigns: z.boolean().optional().default(false).describe('Exclude leads already in other campaigns'),
          excludeHasOtherAccConversations: z.boolean().optional().default(false).describe('Exclude leads with existing conversations')
        }).optional().describe('Campaign settings and exclusion rules')
      },
      async ({ name, listId, linkedInAccountIds, sequence, settings }) => {
        try {
          validateRequiredParams({ name, listId, linkedInAccountIds, sequence }, ['name', 'listId', 'linkedInAccountIds', 'sequence'], 'create-campaign');
          validateParameterTypes({ listId }, { listId: 'number' }, 'create-campaign');

          if (!Array.isArray(linkedInAccountIds) || linkedInAccountIds.length === 0) {
            throw new Error('linkedInAccountIds must be a non-empty array. Use get-linkedin-accounts to get valid account IDs.');
          }

          if (!sequence.steps || !Array.isArray(sequence.steps) || sequence.steps.length === 0) {
            throw new Error('sequence.steps must be a non-empty array of campaign steps');
          }

          const result = await this.heyReachClient.createCampaign(name, listId, linkedInAccountIds, sequence, settings);
          return createSuccessResponse(
            result.data,
            `Campaign "${name}" created successfully with ${sequence.steps.length} steps`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Pause campaign - SEPARATE FROM TOGGLE ✅
    this.server.tool(
      'pause-campaign',
      {
        campaignId: z.number().describe('**PREREQUISITE**: Use get-all-campaigns or get-active-campaigns to get valid campaign IDs. The ID of the campaign to pause')
      },
      async ({ campaignId }) => {
        try {
          validateRequiredParams({ campaignId }, ['campaignId'], 'pause-campaign');
          validateParameterTypes({ campaignId }, { campaignId: 'number' }, 'pause-campaign');

          const result = await this.heyReachClient.pauseCampaign(campaignId);
          return createSuccessResponse(
            result.data,
            'Campaign paused successfully'
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Resume campaign - SEPARATE FROM TOGGLE ✅
    this.server.tool(
      'resume-campaign',
      {
        campaignId: z.number().describe('**PREREQUISITE**: Use get-all-campaigns to get valid campaign IDs. The ID of the campaign to resume')
      },
      async ({ campaignId }) => {
        try {
          validateRequiredParams({ campaignId }, ['campaignId'], 'resume-campaign');
          validateParameterTypes({ campaignId }, { campaignId: 'number' }, 'resume-campaign');

          const result = await this.heyReachClient.resumeCampaign(campaignId);
          return createSuccessResponse(
            result.data,
            'Campaign resumed successfully'
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Remove lead from campaign - NEW FUNCTIONALITY ✅
    this.server.tool(
      'remove-lead-from-campaign',
      {
        campaignId: z.number().describe('**PREREQUISITE**: Use get-all-campaigns to get valid campaign IDs. The ID of the campaign to remove lead from'),
        leadId: z.string().describe('The LinkedIn ID or profile URL of the lead to remove')
      },
      async ({ campaignId, leadId }) => {
        try {
          validateRequiredParams({ campaignId, leadId }, ['campaignId', 'leadId'], 'remove-lead-from-campaign');
          validateParameterTypes({ campaignId }, { campaignId: 'number' }, 'remove-lead-from-campaign');

          const result = await this.heyReachClient.removeLeadFromCampaign(campaignId, leadId);
          return createSuccessResponse(
            result.data,
            'Lead removed from campaign successfully'
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );
  }

  private setupConversationTools() {
    // Get conversations - NEW WORKING ENDPOINT ✅
    this.server.tool(
      'get-conversations',
      {
        linkedInAccountIds: z.array(z.number()).optional().describe('Filter by LinkedIn account IDs (leave empty for all accounts)'),
        campaignIds: z.array(z.number()).optional().describe('Filter by campaign IDs (leave empty for all campaigns)'),
        searchString: z.string().optional().describe('Search for specific text in conversations'),
        leadLinkedInId: z.string().optional().describe('Filter by specific lead LinkedIn ID'),
        leadProfileUrl: z.string().optional().describe('Filter by specific lead profile URL'),
        seen: z.boolean().optional().describe('Filter by read/unread status'),
        offset: z.number().optional().default(0).describe('Number of records to skip (for pagination)'),
        limit: z.number().optional().default(50).describe('Maximum number of conversations to return (1-100)')
      },
      async ({ linkedInAccountIds, campaignIds, searchString, leadLinkedInId, leadProfileUrl, seen, offset, limit }) => {
        try {
          const filters = {
            linkedInAccountIds: linkedInAccountIds || [],
            campaignIds: campaignIds || [],
            searchString,
            leadLinkedInId,
            leadProfileUrl,
            seen
          };

          const result = await this.heyReachClient.getConversations(filters, offset, limit);
          return createSuccessResponse(
            {
              conversations: result.data,
              pagination: result.pagination,
              total: result.pagination?.total || 0
            },
            `Retrieved ${result.data?.length || 0} conversations`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Get lead details - NEW WORKING ENDPOINT ✅
    this.server.tool(
      'get-lead-details',
      {
        profileUrl: z.string().describe('LinkedIn profile URL of the lead (e.g., "https://www.linkedin.com/in/username")')
      },
      async ({ profileUrl }) => {
        try {
          validateRequiredParams({ profileUrl }, ['profileUrl'], 'get-lead-details');

          const result = await this.heyReachClient.getLeadDetails(profileUrl);
          return createSuccessResponse(result.data, 'Lead details retrieved successfully');
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );
  }

  private setupAnalyticsTools() {
    // Get overall stats - NEW WORKING ENDPOINT ✅
    this.server.tool(
      'get-overall-stats',
      {
        accountIds: z.array(z.number()).optional().describe('Filter by LinkedIn account IDs (leave empty for all accounts)'),
        campaignIds: z.array(z.number()).optional().describe('Filter by campaign IDs (leave empty for all campaigns)'),
        startDate: z.string().optional().describe('Start date in ISO format (e.g., "2024-01-01T00:00:00.000Z")'),
        endDate: z.string().optional().describe('End date in ISO format (e.g., "2024-12-31T23:59:59.999Z")')
      },
      async ({ accountIds, campaignIds, startDate, endDate }) => {
        try {
          const result = await this.heyReachClient.getOverallStats(
            accountIds || [],
            campaignIds || [],
            startDate,
            endDate
          );
          return createSuccessResponse(
            result.data,
            'Overall statistics retrieved successfully'
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Get campaign analytics - DETAILED PERFORMANCE METRICS ✅
    this.server.tool(
      'get-campaign-analytics',
      {
        campaignId: z.number().describe('**PREREQUISITE**: Use get-all-campaigns to get valid campaign IDs. The ID of the campaign to get analytics for'),
        startDate: z.string().optional().describe('Start date in ISO format (e.g., "2024-01-01T00:00:00.000Z")'),
        endDate: z.string().optional().describe('End date in ISO format (e.g., "2024-12-31T23:59:59.999Z")')
      },
      async ({ campaignId, startDate, endDate }) => {
        try {
          validateRequiredParams({ campaignId }, ['campaignId'], 'get-campaign-analytics');
          validateParameterTypes({ campaignId }, { campaignId: 'number' }, 'get-campaign-analytics');

          const result = await this.heyReachClient.getCampaignAnalytics(campaignId, startDate, endDate);
          return createSuccessResponse(
            result.data,
            'Campaign analytics retrieved successfully'
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );
  }

  private setupListTools() {
    // Get all lists - NEW WORKING ENDPOINT ✅
    this.server.tool(
      'get-all-lists',
      {
        offset: z.number().optional().default(0).describe('Number of records to skip (for pagination)'),
        limit: z.number().optional().default(50).describe('Maximum number of lists to return (1-100)')
      },
      async ({ offset, limit }) => {
        try {
          validateParameterTypes({ offset, limit }, { offset: 'number', limit: 'number' }, 'get-all-lists');

          const result = await this.heyReachClient.getAllLists(offset, limit);
          return createSuccessResponse(
            {
              lists: result.data,
              pagination: result.pagination,
              total: result.pagination?.total || 0
            },
            `Retrieved ${result.data?.length || 0} lists`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Create empty list - NEW WORKING ENDPOINT ✅
    this.server.tool(
      'create-empty-list',
      {
        name: z.string().describe('Name for the new list'),
        type: z.enum(['USER_LIST', 'COMPANY_LIST']).optional().default('USER_LIST').describe('Type of list to create')
      },
      async ({ name, type }) => {
        try {
          validateRequiredParams({ name }, ['name'], 'create-empty-list');

          const result = await this.heyReachClient.createEmptyList(name, type);
          return createSuccessResponse(
            result.data,
            `List "${name}" created successfully`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Get my network for sender - NEW WORKING ENDPOINT ✅
    this.server.tool(
      'get-my-network-for-sender',
      {
        senderId: z.number().describe('**PREREQUISITE**: Use get-linkedin-accounts to get valid sender IDs. The ID of the LinkedIn sender account'),
        pageNumber: z.number().optional().default(0).describe('Page number for pagination (0-based)'),
        pageSize: z.number().optional().default(50).describe('Number of profiles per page (1-100)')
      },
      async ({ senderId, pageNumber, pageSize }) => {
        try {
          validateRequiredParams({ senderId }, ['senderId'], 'get-my-network-for-sender');
          validateParameterTypes({ senderId, pageNumber, pageSize }, { senderId: 'number', pageNumber: 'number', pageSize: 'number' }, 'get-my-network-for-sender');

          const result = await this.heyReachClient.getMyNetworkForSender(senderId, pageNumber, pageSize);
          return createSuccessResponse(
            {
              profiles: result.data,
              pagination: result.pagination,
              total: result.pagination?.total || 0
            },
            `Retrieved ${result.data?.length || 0} network profiles`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );

    // Add leads to campaign - PRODUCTION-READY WITH COMPREHENSIVE VALIDATION ✅
    this.server.tool(
      'add-leads-to-campaign',
      {
        campaignId: z.number().describe('**PREREQUISITE**: Use get-active-campaigns to find campaigns ready for leads. Campaign ID must be ACTIVE status with LinkedIn senders assigned.'),
        leads: z.array(z.object({
          linkedInAccountId: z.number().optional().nullable().describe('LinkedIn account ID to assign lead to (optional - auto-assigns if null)'),
          lead: z.object({
            // REQUIRED FIELD
            profileUrl: z.string().describe('🔴 REQUIRED: LinkedIn profile URL (e.g., "https://www.linkedin.com/in/username")'),

            // RECOMMENDED OPTIONAL FIELDS
            firstName: z.string().optional().describe('✅ RECOMMENDED: Lead first name for personalization'),
            lastName: z.string().optional().describe('✅ RECOMMENDED: Lead last name for personalization'),
            companyName: z.string().optional().describe('✅ RECOMMENDED: Lead company name for professional context'),
            position: z.string().optional().describe('✅ RECOMMENDED: Lead job position for targeting'),
            emailAddress: z.string().optional().describe('✅ RECOMMENDED: Lead email for multi-channel outreach'),

            // ADDITIONAL OPTIONAL FIELDS
            location: z.string().optional().describe('Lead location for geographic targeting'),
            summary: z.string().optional().describe('Lead LinkedIn headline/summary'),
            about: z.string().optional().describe('Lead about section content'),

            // CUSTOM PERSONALIZATION FIELDS
            customUserFields: z.array(z.object({
              name: z.string().describe('Custom field name (alphanumeric + underscore only). Common examples: "N1Name" (normalized first name), "Message" (personalized content)'),
              value: z.string().describe('Custom field value for dynamic personalization in sequences')
            })).optional().describe('🎯 PERSONALIZATION VARIABLES: Custom fields for dynamic message insertion. Examples: N1Name="Brandon" (normalized), Message="Loved your recent post about AI"')
          })
        })).describe('Array of leads to add to campaign. Each lead MUST have a profileUrl. Use custom fields for personalization.')
      },
      async ({ campaignId, leads }) => {
        try {
          validateRequiredParams({ campaignId, leads }, ['campaignId', 'leads'], 'add-leads-to-campaign');
          validateParameterTypes({ campaignId }, { campaignId: 'number' }, 'add-leads-to-campaign');

          if (!Array.isArray(leads) || leads.length === 0) {
            throw new Error('leads parameter must be a non-empty array');
          }

          // STEP 1: Validate campaign exists and get details
          let campaignDetails;
          try {
            const campaignResult = await this.heyReachClient.getCampaignDetails(campaignId);
            campaignDetails = campaignResult.data;

            if (!campaignDetails) {
              throw new Error(`Campaign ${campaignId} not found or returned empty data.`);
            }
          } catch (error) {
            throw new Error(`Campaign ${campaignId} not found. Use get-active-campaigns to find valid campaign IDs.`);
          }

          // STEP 2: Validate campaign status (CRITICAL REQUIREMENT)
          if (!campaignDetails.status || !['ACTIVE', 'IN_PROGRESS'].includes(campaignDetails.status)) {
            throw new Error(`Campaign must be ACTIVE to add leads. Current status: ${campaignDetails.status || 'UNKNOWN'}. Please activate the campaign in HeyReach first.`);
          }

          // STEP 3: Validate campaign has LinkedIn senders assigned
          if (!campaignDetails.campaignAccountIds || campaignDetails.campaignAccountIds.length === 0) {
            throw new Error(`Campaign ${campaignId} has no LinkedIn sender accounts assigned. Please assign LinkedIn accounts to the campaign in HeyReach before adding leads.`);
          }

          // STEP 4: Validate each lead has required profileUrl
          for (let i = 0; i < leads.length; i++) {
            if (!leads[i].lead?.profileUrl) {
              throw new Error(`Lead at index ${i} is missing required profileUrl`);
            }

            // Validate profileUrl format
            const profileUrl = leads[i].lead.profileUrl;
            if (!profileUrl.includes('linkedin.com/in/')) {
              throw new Error(`Lead at index ${i} has invalid LinkedIn profile URL format. Expected format: "https://www.linkedin.com/in/username"`);
            }
          }

          // STEP 5: All validations passed - proceed with API call
          const result = await this.heyReachClient.addLeadsToCampaign(campaignId, leads);

          return createSuccessResponse(
            {
              addedCount: result.data?.addedCount,
              campaignId,
              campaignName: campaignDetails.name,
              campaignStatus: campaignDetails.status,
              leadsProcessed: leads.length,
              linkedInSenders: campaignDetails.campaignAccountIds?.length || 0
            },
            `✅ Successfully added ${result.data?.addedCount || leads.length} leads to ACTIVE campaign "${campaignDetails.name}" (ID: ${campaignId})`
          );
        } catch (error) {
          return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    );
  }

  getServer(): McpServer {
    return this.server;
  }
}
