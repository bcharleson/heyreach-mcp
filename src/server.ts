import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { HeyReachClient } from './heyreach-client.js';
import { HeyReachConfig } from './types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module and read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

export class HeyReachMcpServer {
  private server: McpServer;
  private heyReachClient: HeyReachClient;

  constructor(config: HeyReachConfig) {
    this.server = new McpServer({
      name: 'heyreach-mcp-server',
      version: packageJson.version,
    });

    this.heyReachClient = new HeyReachClient(config);
    this.setupTools();
  }

  private setupTools() {
    // Campaign Management Tools
    this.setupCampaignTools();
    
    // Lead Management Tools
    this.setupLeadTools();
    
    // Messaging Tools
    this.setupMessagingTools();
    
    // Social Action Tools
    this.setupSocialTools();
    
    // Analytics Tools
    this.setupAnalyticsTools();
  }

  private setupCampaignTools() {
    // Get all campaigns
    this.server.tool(
      'get-all-campaigns',
      {
        description: 'Retrieve all campaigns from your HeyReach account.'
      },
      async () => {
        const result = await this.heyReachClient.getAllCampaigns();

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      }
    );

    // Get campaign details
    this.server.tool(
      'get-campaign-details',
      {
        description: 'Get detailed information about a specific campaign.',
        campaignId: z.string().describe('Campaign ID to retrieve details for. Use get-all-campaigns to find valid IDs.')
      },
      async ({ campaignId }) => {
        const result = await this.heyReachClient.getCampaignDetails(campaignId);

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      }
    );

    // Create campaign
    this.server.tool(
      'create-campaign',
      {
        name: z.string().describe(`The name of the new campaign to create.

**Prerequisites:**
- Valid HeyReach API key must be configured
- API key must have campaign creation permissions
- No other API calls required before using this tool

**API Endpoint:** POST /campaign/Create
**Request Payload Structure:**
\`\`\`json
{
  "name": "Q1 LinkedIn Outreach",
  "description": "Quarterly outreach campaign targeting tech executives",
  "settings": {
    "dailyLimit": 50,
    "delayBetweenActions": 30,
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    }
  },
  "messageTemplates": ["template_123", "template_456"]
}
\`\`\`

**Parameter Details:**
- name (string, required): Campaign name (1-100 characters)
  - Example: "Q1 LinkedIn Outreach", "Tech Executive Campaign"
  - Must be unique within your account`),
        description: z.string().optional().describe(`Optional description of the campaign's purpose and target audience.

- description (string, optional): Detailed campaign description (max 500 characters)
  - Example: "Targeting CTOs and VPs of Engineering at Series B+ startups"
  - Used for internal organization and reporting`),
        dailyLimit: z.number().optional().describe(`Maximum number of actions (messages, connection requests) to perform per day.

- dailyLimit (number, optional): Daily action limit (1-200, default: 50)
  - Example: 25 for conservative approach, 100 for aggressive outreach
  - Helps maintain LinkedIn compliance and avoid account restrictions`),
        delayBetweenActions: z.number().optional().describe(`Time delay between individual actions in minutes to appear more human-like.

- delayBetweenActions (number, optional): Delay in minutes (5-120, default: 30)
  - Example: 15 for faster campaigns, 60 for more natural pacing
  - Reduces risk of LinkedIn detection and account limitations`)
      },
      async ({ name, description, dailyLimit, delayBetweenActions }) => {
        const params = {
          name,
          description,
          settings: {
            dailyLimit,
            delayBetweenActions
          }
        };

        const result = await this.heyReachClient.createCampaign(params);

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: `Campaign created successfully: ${JSON.stringify(result.data, null, 2)}`
          }]
        };
      }
    );

    // Pause/Resume campaign
    this.server.tool(
      'toggle-campaign-status',
      {
        campaignId: z.string().describe(`The unique identifier of the campaign to pause or resume.

**Prerequisites:**
- Valid HeyReach API key must be configured
- Campaign must exist in your HeyReach account
- Recommended: Use 'get-all-campaigns' or 'get-campaign-details' to verify campaign exists and current status

**API Endpoint:** POST /campaign/{action}
**Request Payload:**
\`\`\`json
{
  "campaignId": "camp_123456"
}
\`\`\`

**Parameter Details:**
- campaignId (string, required): The unique campaign identifier
  - Format: Alphanumeric string, typically prefixed with "camp_"
  - Example: "camp_123456", "campaign_abc789"
  - Must be an existing campaign in your account`),
        action: z.enum(['pause', 'resume']).describe(`The action to perform on the campaign.

**Parameter Details:**
- action (enum, required): Must be either "pause" or "resume"
  - "pause": Stops all automated actions for this campaign
    - Use when: Temporarily stopping outreach, reviewing campaign performance, or making adjustments
    - Effect: No new messages or connection requests will be sent
  - "resume": Restarts automated actions for a paused campaign
    - Use when: Ready to continue outreach after pausing
    - Effect: Campaign will resume sending messages according to its schedule and settings

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "camp_123456",
    "name": "Q1 LinkedIn Outreach",
    "status": "paused",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
\`\`\`

**Common Error Scenarios:**
- 404 Not Found: Campaign ID does not exist
- 400 Bad Request: Invalid action or campaign already in requested state
- 403 Forbidden: API key lacks campaign management permissions

**Usage Example:**
Input: { "campaignId": "camp_123456", "action": "pause" }
Use this to control campaign execution without deleting the campaign or its data.`)
      },
      async ({ campaignId, action }) => {
        const result = await this.heyReachClient.toggleCampaignStatus(campaignId, action);

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: `Campaign ${action}d successfully: ${JSON.stringify(result.data, null, 2)}`
          }]
        };
      }
    );
  }

  private setupLeadTools() {
    // Add leads to campaign
    this.server.tool(
      'add-leads-to-campaign',
      {
        campaignId: z.string().describe(`The unique identifier of the campaign to add leads to.

**Prerequisites:**
- Valid HeyReach API key must be configured
- Campaign must exist and be accessible with your API key
- Recommended: Use 'get-all-campaigns' to verify campaign exists before adding leads

**API Endpoint:** POST /campaign/AddLeadsToListV2
**Request Payload Structure:**
\`\`\`json
{
  "campaignId": "camp_123456",
  "leads": [
    {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@techcorp.com",
      "linkedinUrl": "https://linkedin.com/in/johnsmith",
      "company": "TechCorp Inc",
      "position": "VP of Engineering"
    }
  ]
}
\`\`\`

**Parameter Details:**
- campaignId (string, required): The target campaign identifier
  - Format: Alphanumeric string, typically prefixed with "camp_"
  - Example: "camp_123456", "campaign_abc789"
  - Must be an existing, active campaign`),
        leads: z.array(z.object({
          firstName: z.string().optional().describe(`First name of the lead contact.

- firstName (string, optional): Lead's first name (1-50 characters)
  - Example: "John", "Sarah", "Michael"
  - Used for message personalization and contact identification`),
          lastName: z.string().optional().describe(`Last name of the lead contact.

- lastName (string, optional): Lead's last name (1-50 characters)
  - Example: "Smith", "Johnson", "Williams"
  - Combined with firstName for full name display and personalization`),
          email: z.string().optional().describe(`Email address of the lead for contact and tracking.

- email (string, optional): Valid email address format
  - Example: "john.smith@techcorp.com", "sarah.j@startup.io"
  - Used for email outreach and lead identification
  - Must be valid email format if provided`),
          linkedinUrl: z.string().optional().describe(`LinkedIn profile URL for social outreach and verification.

- linkedinUrl (string, optional): Full LinkedIn profile URL
  - Example: "https://linkedin.com/in/johnsmith", "https://www.linkedin.com/in/sarah-johnson-123456"
  - Used for LinkedIn connection requests and profile verification
  - Must be valid LinkedIn URL format if provided`),
          company: z.string().optional().describe(`Company name where the lead currently works.

- company (string, optional): Current employer name (1-100 characters)
  - Example: "TechCorp Inc", "Startup Solutions LLC", "Global Enterprises"
  - Used for targeting and message personalization`),
          position: z.string().optional().describe(`Job title or position of the lead at their company.

- position (string, optional): Current job title (1-100 characters)
  - Example: "VP of Engineering", "Senior Software Developer", "Chief Technology Officer"
  - Used for targeting and message personalization`)
        })).describe(`Array of lead objects to add to the campaign.

**Lead Array Details:**
- Minimum 1 lead, maximum 1000 leads per request
- At least one field (firstName, lastName, email, linkedinUrl, company, or position) must be provided per lead
- LinkedIn URL is highly recommended for LinkedIn-based campaigns
- Duplicate leads (same email or LinkedIn URL) will be automatically filtered

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": {
    "addedCount": 5
  },
  "message": "Successfully added 5 leads to campaign"
}
\`\`\`

**Common Error Scenarios:**
- 404 Not Found: Campaign ID does not exist
- 400 Bad Request: Invalid lead data format or empty leads array
- 403 Forbidden: API key lacks campaign modification permissions
- 422 Unprocessable Entity: Duplicate leads or invalid email/LinkedIn URL formats

**Usage Example:**
Input: {
  "campaignId": "camp_123456",
  "leads": [
    {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@techcorp.com",
      "linkedinUrl": "https://linkedin.com/in/johnsmith",
      "company": "TechCorp",
      "position": "CTO"
    }
  ]
}`)
      },
      async ({ campaignId, leads }) => {
        const result = await this.heyReachClient.addLeadsToCampaign({ campaignId, leads });

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: `Successfully added ${result.data?.addedCount} leads to campaign ${campaignId}`
          }]
        };
      }
    );

    // Get campaign leads
    this.server.tool(
      'get-campaign-leads',
      {
        campaignId: z.string().describe(`The unique identifier of the campaign to retrieve leads from.

**Prerequisites:**
- Valid HeyReach API key must be configured
- Campaign must exist and be accessible with your API key
- Recommended: Use 'get-all-campaigns' to verify campaign exists before retrieving leads

**API Endpoint:** POST /campaign/GetLeads
**Request Payload:**
\`\`\`json
{
  "campaignId": "camp_123456",
  "page": 1,
  "limit": 50
}
\`\`\`

**Parameter Details:**
- campaignId (string, required): The campaign identifier to retrieve leads from
  - Format: Alphanumeric string, typically prefixed with "camp_"
  - Example: "camp_123456", "campaign_abc789"
  - Must be an existing campaign with leads`),
        page: z.number().optional().default(1).describe(`Page number for pagination to navigate through large lead lists.

**Parameter Details:**
- page (number, optional, default: 1): Page number for pagination (minimum: 1)
  - Example: 1 for first page, 2 for second page, etc.
  - Used to navigate through large lead lists
  - Each page contains up to 'limit' number of leads`),
        limit: z.number().optional().default(50).describe(`Number of leads to return per page.

**Parameter Details:**
- limit (number, optional, default: 50): Number of leads per page (1-100)
  - Example: 25 for smaller pages, 100 for maximum per page
  - Larger limits reduce API calls but increase response size
  - Maximum allowed: 100 leads per request

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "lead_123456",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@techcorp.com",
      "linkedinUrl": "https://linkedin.com/in/johnsmith",
      "company": "TechCorp Inc",
      "position": "VP of Engineering",
      "status": "pending",
      "campaignId": "camp_123456",
      "addedAt": "2024-01-15T10:00:00Z",
      "lastActivity": "2024-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "hasMore": true
  }
}
\`\`\`

**Lead Status Values:**
- "pending": Lead added but no actions taken yet
- "contacted": Initial message or connection request sent
- "replied": Lead has responded to outreach
- "connected": LinkedIn connection established
- "not_interested": Lead indicated no interest
- "bounced": Email bounced or LinkedIn request rejected

**Common Error Scenarios:**
- 404 Not Found: Campaign ID does not exist
- 400 Bad Request: Invalid page number or limit value
- 403 Forbidden: API key lacks campaign read permissions

**Usage Example:**
Input: { "campaignId": "camp_123456", "page": 1, "limit": 25 }
Use this to review leads in a campaign, monitor their status, and track outreach progress.`)
      },
      async ({ campaignId, page, limit }) => {
        const result = await this.heyReachClient.getCampaignLeads(campaignId, page, limit);

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              leads: result.data,
              pagination: result.pagination
            }, null, 2)
          }]
        };
      }
    );

    // Update lead status
    this.server.tool(
      'update-lead-status',
      {
        leadId: z.string().describe(`The unique identifier of the lead to update status for.

**Prerequisites:**
- Valid HeyReach API key must be configured
- Lead must exist in your HeyReach account
- Recommended: Use 'get-campaign-leads' to obtain valid lead IDs and current status

**API Endpoint:** POST /lead/UpdateStatus
**Request Payload:**
\`\`\`json
{
  "leadId": "lead_123456",
  "status": "contacted"
}
\`\`\`

**Parameter Details:**
- leadId (string, required): The unique lead identifier
  - Format: Alphanumeric string, typically prefixed with "lead_"
  - Example: "lead_123456", "lead_abc789"
  - Must be an existing lead in your campaigns`),
        status: z.enum(['pending', 'contacted', 'replied', 'connected', 'not_interested', 'bounced'])
          .describe(`The new status to assign to the lead.

**Status Options and Usage:**
- "pending": Lead added but no actions taken yet
  - Use when: Resetting a lead back to initial state
  - Next actions: Ready for automated outreach to begin

- "contacted": Initial message or connection request sent
  - Use when: First outreach attempt has been made
  - Next actions: Wait for response or schedule follow-up

- "replied": Lead has responded to outreach
  - Use when: Lead has sent a message back
  - Next actions: Continue conversation or schedule meeting

- "connected": LinkedIn connection established
  - Use when: LinkedIn connection request was accepted
  - Next actions: Send follow-up message or direct outreach

- "not_interested": Lead indicated no interest
  - Use when: Lead explicitly declined or showed no interest
  - Next actions: Remove from active outreach, add to exclusion list

- "bounced": Email bounced or LinkedIn request rejected
  - Use when: Technical delivery failure occurred
  - Next actions: Verify contact information or try alternative channels

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "lead_123456",
    "firstName": "John",
    "lastName": "Smith",
    "status": "contacted",
    "lastActivity": "2024-01-20T15:30:00Z",
    "campaignId": "camp_123456"
  }
}
\`\`\`

**Common Error Scenarios:**
- 404 Not Found: Lead ID does not exist
- 400 Bad Request: Invalid status value
- 403 Forbidden: API key lacks lead modification permissions
- 422 Unprocessable Entity: Status transition not allowed (e.g., bounced to replied)

**Usage Example:**
Input: { "leadId": "lead_123456", "status": "contacted" }
Use this to manually update lead status or correct automated status tracking.`)
      },
      async ({ leadId, status }) => {
        const result = await this.heyReachClient.updateLeadStatus(leadId, status);

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: `Lead status updated successfully: ${JSON.stringify(result.data, null, 2)}`
          }]
        };
      }
    );
  }

  private setupMessagingTools() {
    // Send message
    this.server.tool(
      'send-message',
      {
        leadId: z.string().describe(`The unique identifier of the lead to send a message to.

**Prerequisites:**
- Valid HeyReach API key must be configured
- Lead must exist in your HeyReach account
- Lead must have a valid LinkedIn URL or email address
- Recommended: Use 'get-campaign-leads' to obtain valid lead IDs and verify contact information

**API Endpoint:** POST /message/Send
**Request Payload:**
\`\`\`json
{
  "leadId": "lead_123456",
  "message": "Hi John, I noticed your work at TechCorp and would love to connect...",
  "templateId": "template_789"
}
\`\`\`

**Parameter Details:**
- leadId (string, required): The unique lead identifier
  - Format: Alphanumeric string, typically prefixed with "lead_"
  - Example: "lead_123456", "lead_abc789"
  - Must be an existing lead with valid contact information`),
        message: z.string().describe(`The message content to send to the lead.

**Parameter Details:**
- message (string, required): The message text to send (1-2000 characters)
  - Example: "Hi John, I noticed your work at TechCorp and would love to connect to discuss our mutual interests in AI technology."
  - Should be personalized and relevant to the lead
  - Avoid spam-like language or overly promotional content
  - Can include variables that will be replaced with lead information

**Message Best Practices:**
- Keep messages concise and personalized
- Reference the lead's company, position, or recent activity
- Include a clear call-to-action
- Avoid excessive links or promotional language
- Respect LinkedIn's messaging guidelines`),
        templateId: z.string().optional().describe(`Optional template ID to use for message formatting and variable replacement.

**Parameter Details:**
- templateId (string, optional): The unique template identifier
  - Format: Alphanumeric string, typically prefixed with "template_"
  - Example: "template_123", "template_connection_request"
  - Use 'get-message-templates' to obtain valid template IDs

**Template Usage:**
- Templates provide pre-written message structures with variables
- Variables like {{firstName}}, {{company}}, {{position}} are automatically replaced
- Helps maintain consistent messaging across campaigns
- If templateId is provided, the 'message' parameter may be ignored in favor of template content

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": {
    "messageId": "msg_123456"
  },
  "message": "Message sent successfully"
}
\`\`\`

**Common Error Scenarios:**
- 404 Not Found: Lead ID does not exist
- 400 Bad Request: Invalid message content or missing contact information
- 403 Forbidden: API key lacks messaging permissions
- 422 Unprocessable Entity: Lead has no valid contact method (LinkedIn/email)
- 429 Too Many Requests: Daily messaging limit exceeded

**Usage Example:**
Input: {
  "leadId": "lead_123456",
  "message": "Hi John, I saw your recent post about AI in healthcare. Would love to connect!",
  "templateId": "template_connection_request"
}`)
      },
      async ({ leadId, message, templateId }) => {
        const result = await this.heyReachClient.sendMessage({ leadId, message, templateId });

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: `Message sent successfully. Message ID: ${result.data?.messageId}`
          }]
        };
      }
    );

    // Get message templates
    this.server.tool(
      'get-message-templates',
      {
        description: `Retrieve all available message templates from your HeyReach account.

**Prerequisites:**
- Valid HeyReach API key must be configured
- No other API calls required before using this tool

**API Endpoint:** GET /templates/GetAll
**Request Payload:** None

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "template_123456",
      "name": "Connection Request - Tech Executives",
      "content": "Hi {{firstName}}, I noticed your work at {{company}} and would love to connect to discuss {{industry}} trends.",
      "type": "connection_request",
      "variables": ["firstName", "company", "industry"]
    },
    {
      "id": "template_789012",
      "name": "Follow-up Message",
      "content": "Thanks for connecting, {{firstName}}! I'd love to learn more about your role as {{position}} at {{company}}.",
      "type": "follow_up",
      "variables": ["firstName", "position", "company"]
    }
  ]
}
\`\`\`

**Template Types:**
- "connection_request": Initial LinkedIn connection request messages
- "follow_up": Follow-up messages after connection acceptance
- "direct_message": Direct messages for existing connections

**Template Variables:**
Common variables that can be used in templates:
- {{firstName}}: Lead's first name
- {{lastName}}: Lead's last name
- {{company}}: Lead's company name
- {{position}}: Lead's job title
- {{industry}}: Lead's industry (if available)
- {{customField}}: Any custom field defined for the lead

**Common Error Scenarios:**
- 401 Unauthorized: Invalid or expired API key
- 403 Forbidden: API key lacks template read permissions
- 500 Internal Server Error: HeyReach service temporarily unavailable

**Usage Example:**
This tool requires no parameters and returns all message templates available in your account.
Use the returned template IDs with the 'send-message' tool for consistent messaging.`
      },
      async () => {
        const result = await this.heyReachClient.getMessageTemplates();

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      }
    );
  }

  private setupSocialTools() {
    // Perform social action
    this.server.tool(
      'perform-social-action',
      {
        action: z.enum(['like', 'follow', 'view']).describe(`The type of social action to perform on LinkedIn.

**Prerequisites:**
- Valid HeyReach API key must be configured
- LinkedIn account must be connected to HeyReach
- Target URL must be accessible and valid
- Recommended: Verify lead exists if associating action with a lead

**API Endpoint:** POST /social/Action
**Request Payload:**
\`\`\`json
{
  "action": "like",
  "targetUrl": "https://linkedin.com/posts/johnsmith_ai-technology-innovation-activity-1234567890",
  "leadId": "lead_123456"
}
\`\`\`

**Action Types and Usage:**
- "like": Like a LinkedIn post or update
  - Use when: Engaging with lead's content to build rapport
  - Target: LinkedIn post URLs, company updates, or shared content
  - Effect: Increases visibility and shows interest in lead's content

- "follow": Follow a LinkedIn profile or company page
  - Use when: Building long-term relationship with lead or their company
  - Target: LinkedIn profile URLs or company page URLs
  - Effect: Establishes ongoing connection and content visibility

- "view": View a LinkedIn profile
  - Use when: Researching lead or showing interest without direct engagement
  - Target: LinkedIn profile URLs
  - Effect: Appears in "Who viewed your profile" notifications`),
        targetUrl: z.string().describe(`The LinkedIn URL to perform the action on.

**Parameter Details:**
- targetUrl (string, required): Valid LinkedIn URL (posts, profiles, company pages)
  - Post URL example: "https://linkedin.com/posts/johnsmith_ai-technology-innovation-activity-1234567890"
  - Profile URL example: "https://linkedin.com/in/johnsmith"
  - Company URL example: "https://linkedin.com/company/techcorp"
  - Must be a publicly accessible LinkedIn URL
  - URL must match the action type (e.g., post URLs for likes, profile URLs for follows/views)

**URL Validation:**
- Must start with "https://linkedin.com/" or "https://www.linkedin.com/"
- Must be a valid, active LinkedIn page
- Private profiles or restricted content may cause action failures`),
        leadId: z.string().optional().describe(`Optional lead ID to associate this social action with for tracking and campaign management.

**Parameter Details:**
- leadId (string, optional): The unique lead identifier
  - Format: Alphanumeric string, typically prefixed with "lead_"
  - Example: "lead_123456", "lead_abc789"
  - Use 'get-campaign-leads' to obtain valid lead IDs

**Association Benefits:**
- Links social actions to specific leads for tracking
- Enables campaign performance analysis
- Helps maintain engagement history per lead
- Useful for automated follow-up sequences

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "action_123456",
    "type": "like",
    "targetUrl": "https://linkedin.com/posts/johnsmith_ai-technology-innovation-activity-1234567890",
    "status": "pending",
    "leadId": "lead_123456",
    "scheduledAt": "2024-01-20T16:00:00Z"
  }
}
\`\`\`

**Action Status Values:**
- "pending": Action queued for execution
- "completed": Action successfully performed
- "failed": Action failed due to error or restriction

**Common Error Scenarios:**
- 400 Bad Request: Invalid URL format or unsupported action type
- 403 Forbidden: LinkedIn account not connected or insufficient permissions
- 404 Not Found: Target URL does not exist or is no longer accessible
- 429 Too Many Requests: Daily social action limit exceeded
- 422 Unprocessable Entity: Action not allowed (e.g., already liked, already following)

**Usage Example:**
Input: {
  "action": "like",
  "targetUrl": "https://linkedin.com/posts/johnsmith_ai-technology-innovation-activity-1234567890",
  "leadId": "lead_123456"
}`)
      },
      async ({ action, targetUrl, leadId }) => {
        const result = await this.heyReachClient.performSocialAction({ action, targetUrl, leadId });

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: `Social action (${action}) queued successfully: ${JSON.stringify(result.data, null, 2)}`
          }]
        };
      }
    );
  }

  private setupAnalyticsTools() {
    // Get campaign metrics
    this.server.tool(
      'get-campaign-metrics',
      {
        campaignId: z.string().describe(`The unique identifier of the campaign to retrieve performance metrics for.

**Prerequisites:**
- Valid HeyReach API key must be configured
- Campaign must exist and be accessible with your API key
- Recommended: Use 'get-all-campaigns' to verify campaign exists and has been running

**API Endpoint:** GET /analytics/campaign/{campaignId}
**Request Payload:** None (campaign ID passed in URL path)

**Parameter Details:**
- campaignId (string, required): The unique campaign identifier
  - Format: Alphanumeric string, typically prefixed with "camp_"
  - Example: "camp_123456", "campaign_abc789"
  - Must be an existing campaign with some activity for meaningful metrics

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": {
    "campaignId": "camp_123456",
    "totalLeads": 150,
    "contacted": 120,
    "replied": 25,
    "connected": 45,
    "responseRate": 20.8,
    "connectionRate": 37.5,
    "metrics": {
      "messagesPerDay": 15.5,
      "averageResponseTime": "2.3 days",
      "topPerformingTemplate": "template_123",
      "conversionFunnel": {
        "leads": 150,
        "contacted": 120,
        "replied": 25,
        "meetings": 8,
        "deals": 2
      }
    },
    "timeRange": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
\`\`\`

**Metric Definitions:**
- totalLeads: Total number of leads in the campaign
- contacted: Number of leads that have been reached out to
- replied: Number of leads that responded to outreach
- connected: Number of LinkedIn connections established
- responseRate: Percentage of contacted leads who replied (replied/contacted * 100)
- connectionRate: Percentage of contacted leads who connected (connected/contacted * 100)

**Performance Indicators:**
- Response Rate > 15%: Good performance
- Response Rate 10-15%: Average performance
- Response Rate < 10%: Needs optimization
- Connection Rate > 30%: Excellent LinkedIn engagement
- Connection Rate 20-30%: Good LinkedIn engagement
- Connection Rate < 20%: Consider improving connection requests

**Common Error Scenarios:**
- 404 Not Found: Campaign ID does not exist
- 403 Forbidden: API key lacks analytics read permissions
- 400 Bad Request: Invalid campaign ID format
- 204 No Content: Campaign exists but has no activity data yet

**Usage Example:**
Input: { "campaignId": "camp_123456" }
Use this to monitor campaign performance, identify optimization opportunities, and report on outreach effectiveness.`)
      },
      async ({ campaignId }) => {
        const result = await this.heyReachClient.getCampaignMetrics(campaignId);

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      }
    );

    // Check API key
    this.server.tool(
      'check-api-key',
      {
        description: `Verify that your HeyReach API key is valid and has proper permissions.

**Prerequisites:**
- HeyReach API key must be configured in the MCP server
- No other API calls required before using this tool

**API Endpoint:** GET /auth/CheckApiKey
**Request Payload:** None

**Response Structure:**
\`\`\`json
{
  "success": true,
  "data": true,
  "message": "API key is valid (Status: 200)"
}
\`\`\`

**Validation Results:**
- Valid API Key: Returns success: true, data: true
- Invalid API Key: Returns success: false with error message
- Expired API Key: Returns 401 Unauthorized error
- Malformed API Key: Returns 400 Bad Request error

**API Key Requirements:**
- Must be a valid HeyReach API key from your account settings
- Format: Base64-encoded string (typically 40+ characters)
- Example format: "QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M="
- Must have appropriate permissions for intended operations

**Permission Levels:**
- Read-only: Can view campaigns, leads, and metrics
- Campaign Management: Can create, modify, and control campaigns
- Lead Management: Can add, update, and manage leads
- Messaging: Can send messages and access templates
- Social Actions: Can perform LinkedIn actions
- Full Access: All permissions enabled

**Common Error Scenarios:**
- 401 Unauthorized: API key is invalid, expired, or revoked
- 403 Forbidden: API key is valid but lacks required permissions
- 400 Bad Request: API key format is incorrect
- 500 Internal Server Error: HeyReach authentication service unavailable

**Troubleshooting:**
- If invalid: Generate a new API key in HeyReach account settings
- If forbidden: Check API key permissions in HeyReach dashboard
- If service unavailable: Retry after a few minutes

**Usage Example:**
This tool requires no parameters and validates the currently configured API key.
Use this as a first step to ensure your HeyReach integration is properly configured before using other tools.`
      },
      async () => {
        const result = await this.heyReachClient.checkApiKey();

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: 'text',
            text: `API Key is ${result.data ? 'valid' : 'invalid'}`
          }]
        };
      }
    );
  }

  getServer(): McpServer {
    return this.server;
  }
}
