# HeyReach MCP Server Examples

This document provides practical examples of using the HeyReach MCP Server with various AI clients.

## Table of Contents

- [Claude Desktop Examples](#claude-desktop-examples)
- [Common Workflows](#common-workflows)
- [Tool Usage Examples](#tool-usage-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Claude Desktop Examples

### Basic Configuration

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "heyreach": {
      "command": "npx",
      "args": [
        "heyreach-mcp-server",
        "--api-key=hr_your_api_key_here"
      ]
    }
  }
}
```

### Advanced Configuration with Custom Base URL

```json
{
  "mcpServers": {
    "heyreach": {
      "command": "npx",
      "args": [
        "heyreach-mcp-server",
        "--api-key=hr_your_api_key_here",
        "--base-url=https://api.heyreach.io/api/public"
      ]
    }
  }
}
```

## Common Workflows

### 1. Campaign Creation and Lead Management

**Prompt to Claude:**
```
I want to create a new LinkedIn outreach campaign for software engineers. Can you:
1. Create a campaign called "Software Engineer Outreach Q1 2024"
2. Add some sample leads to it
3. Show me the campaign metrics
```

**Expected Claude Actions:**
1. Uses `create-campaign` tool
2. Uses `add-leads-to-campaign` tool
3. Uses `get-campaign-metrics` tool

### 2. Lead Status Management

**Prompt to Claude:**
```
Check my campaign "Software Engineer Outreach Q1 2024" and update any leads that haven't been contacted to "contacted" status.
```

**Expected Claude Actions:**
1. Uses `get-all-campaigns` to find the campaign
2. Uses `get-campaign-leads` to list leads
3. Uses `update-lead-status` for each lead

### 3. Social Media Automation

**Prompt to Claude:**
```
I want to engage with prospects on LinkedIn. Can you:
1. Like this post: https://linkedin.com/posts/example-post
2. Follow this profile: https://linkedin.com/in/john-doe
3. View this company page: https://linkedin.com/company/example-corp
```

**Expected Claude Actions:**
1. Uses `perform-social-action` with action "like"
2. Uses `perform-social-action` with action "follow"
3. Uses `perform-social-action` with action "view"

## Tool Usage Examples

### Campaign Management

#### Create Campaign
```
Tool: create-campaign
Parameters:
- name: "Q1 2024 Tech Outreach"
- description: "Targeting software engineers and tech leads"
- dailyLimit: 50
- delayBetweenActions: 30
```

#### Get All Campaigns
```
Tool: get-all-campaigns
Parameters: (none)
```

#### Toggle Campaign Status
```
Tool: toggle-campaign-status
Parameters:
- campaignId: "camp_123456"
- action: "pause"
```

### Lead Management

#### Add Leads to Campaign
```
Tool: add-leads-to-campaign
Parameters:
- campaignId: "camp_123456"
- leads: [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "linkedinUrl": "https://linkedin.com/in/john-doe",
      "company": "Tech Corp",
      "position": "Software Engineer"
    }
  ]
```

#### Get Campaign Leads
```
Tool: get-campaign-leads
Parameters:
- campaignId: "camp_123456"
- page: 1
- limit: 25
```

#### Update Lead Status
```
Tool: update-lead-status
Parameters:
- leadId: "lead_789012"
- status: "replied"
```

### Messaging

#### Send Message
```
Tool: send-message
Parameters:
- leadId: "lead_789012"
- message: "Hi John, I saw your recent post about React development. Would love to connect!"
- templateId: "template_456" (optional)
```

#### Get Message Templates
```
Tool: get-message-templates
Parameters: (none)
```

### Social Actions

#### Like a Post
```
Tool: perform-social-action
Parameters:
- action: "like"
- targetUrl: "https://linkedin.com/posts/john-doe_react-development-123456"
- leadId: "lead_789012" (optional)
```

#### Follow a Profile
```
Tool: perform-social-action
Parameters:
- action: "follow"
- targetUrl: "https://linkedin.com/in/jane-smith"
```

### Analytics

#### Get Campaign Metrics
```
Tool: get-campaign-metrics
Parameters:
- campaignId: "camp_123456"
```

#### Check API Key
```
Tool: check-api-key
Parameters: (none)
```

## Error Handling

### Common Errors and Solutions

#### Invalid API Key
```
Error: HeyReach API Error: 401 - Invalid API key
Solution: Check your API key in the configuration
```

#### Campaign Not Found
```
Error: HeyReach API Error: 404 - Campaign not found
Solution: Verify the campaign ID exists using get-all-campaigns
```

#### Rate Limiting
```
Error: HeyReach API Error: 429 - Rate limit exceeded
Solution: Wait before making more requests, or reduce dailyLimit
```

#### Invalid Lead Data
```
Error: Validation error - LinkedIn URL format invalid
Solution: Ensure LinkedIn URLs follow the correct format
```

## Best Practices

### 1. Campaign Management
- Always check existing campaigns before creating new ones
- Use descriptive campaign names with dates
- Set appropriate daily limits to avoid rate limiting
- Monitor campaign metrics regularly

### 2. Lead Management
- Validate lead data before adding to campaigns
- Use consistent naming conventions for companies and positions
- Update lead statuses promptly to maintain accurate tracking
- Use pagination when retrieving large lead lists

### 3. Messaging
- Use message templates for consistency
- Personalize messages when possible
- Track message performance through campaign metrics
- Respect LinkedIn's messaging guidelines

### 4. Social Actions
- Verify URLs before performing actions
- Space out social actions to appear natural
- Associate actions with leads when possible for tracking
- Monitor for any platform restrictions

### 5. Error Handling
- Always check API responses for errors
- Implement retry logic for temporary failures
- Log errors for debugging purposes
- Validate input parameters before making API calls

### 6. Security
- Never hardcode API keys in scripts
- Use environment variables or secure configuration
- Regularly rotate API keys
- Monitor API usage for unusual activity

## Advanced Use Cases

### Bulk Lead Import
```
Prompt: "I have a CSV file with 100 leads. Can you help me add them to my campaign in batches of 10?"
```

### Campaign Performance Analysis
```
Prompt: "Analyze the performance of all my active campaigns and suggest which ones to pause or optimize."
```

### Automated Follow-up Sequences
```
Prompt: "Set up an automated follow-up sequence for leads who haven't replied after 3 days."
```

### Social Media Engagement Strategy
```
Prompt: "Create a social media engagement strategy for my top 20 prospects, including liking their recent posts and following their profiles."
```

## Troubleshooting

### Server Won't Start
1. Check Node.js version (requires 18+)
2. Verify API key format
3. Check network connectivity
4. Review error logs

### Tools Not Appearing in Claude
1. Restart Claude Desktop
2. Check MCP configuration syntax
3. Verify server is running
4. Check Claude Desktop logs

### API Errors
1. Verify API key is valid
2. Check HeyReach account status
3. Review rate limits
4. Validate request parameters

For more help, check the GitHub issues or create a new issue with your specific problem.
