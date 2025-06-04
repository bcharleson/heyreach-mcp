# HeyReach MCP Server

A comprehensive Model Context Protocol (MCP) server that provides seamless integration with the HeyReach API for LinkedIn automation and outreach management.

## Features

This MCP server provides tools for:

### 🎯 Campaign Management
- **get-all-campaigns**: List all your HeyReach campaigns
- **get-campaign-details**: Get detailed information about a specific campaign
- **create-campaign**: Create new outreach campaigns
- **toggle-campaign-status**: Pause or resume campaigns

### 👥 Lead Management
- **add-leads-to-campaign**: Add leads to existing campaigns
- **get-campaign-leads**: Retrieve leads from a campaign with pagination
- **update-lead-status**: Update the status of specific leads

### 💬 Messaging
- **send-message**: Send direct messages to leads
- **get-message-templates**: Retrieve available message templates

### 🔗 Social Actions
- **perform-social-action**: Perform LinkedIn actions (like, follow, view profiles)

### 📊 Analytics
- **get-campaign-metrics**: Get detailed campaign performance metrics
- **check-api-key**: Verify your API key is valid

## Installation

### Via NPX (Recommended)
```bash
npx heyreach-mcp-server --api-key=YOUR_HEYREACH_API_KEY
```

### Via NPM Global Install
```bash
npm install -g heyreach-mcp-server
heyreach-mcp-server --api-key=YOUR_HEYREACH_API_KEY
```

### From Source
```bash
git clone https://github.com/yourusername/heyreach-mcp-server.git
cd heyreach-mcp-server
npm install
npm run build
npm start -- --api-key=YOUR_HEYREACH_API_KEY
```

## Configuration

### Command Line Arguments

- `--api-key=YOUR_API_KEY` (required): Your HeyReach API key
- `--base-url=CUSTOM_URL` (optional): Custom base URL for the HeyReach API

### Example Usage
```bash
heyreach-mcp-server --api-key=hr_1234567890abcdef --base-url=https://api.heyreach.io/api/public
```

## MCP Client Configuration

### Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "heyreach": {
      "command": "npx",
      "args": [
        "heyreach-mcp-server",
        "--api-key=YOUR_HEYREACH_API_KEY"
      ]
    }
  }
}
```

### Other MCP Clients

For other MCP-compatible clients, use the following configuration:

```json
{
  "command": "heyreach-mcp-server",
  "args": ["--api-key=YOUR_HEYREACH_API_KEY"],
  "transport": "stdio"
}
```

## API Key Setup

1. Log in to your HeyReach account
2. Navigate to Settings > API Keys
3. Generate a new API key
4. Copy the API key and use it in the configuration

⚠️ **Security Note**: Never commit your API key to version control. Always pass it as a command-line argument or environment variable.

## Available Tools

### Campaign Management

#### get-all-campaigns
Lists all campaigns in your HeyReach account.

**Parameters**: None

**Example Response**:
```json
[
  {
    "id": "camp_123",
    "name": "Q1 Outreach Campaign",
    "status": "active",
    "leadCount": 150,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### create-campaign
Creates a new outreach campaign.

**Parameters**:
- `name` (string, required): Campaign name
- `description` (string, optional): Campaign description
- `dailyLimit` (number, optional): Daily action limit
- `delayBetweenActions` (number, optional): Delay between actions in minutes

#### toggle-campaign-status
Pause or resume a campaign.

**Parameters**:
- `campaignId` (string, required): Campaign ID
- `action` (enum, required): "pause" or "resume"

### Lead Management

#### add-leads-to-campaign
Add leads to an existing campaign.

**Parameters**:
- `campaignId` (string, required): Target campaign ID
- `leads` (array, required): Array of lead objects with:
  - `firstName` (string, optional)
  - `lastName` (string, optional)
  - `email` (string, optional)
  - `linkedinUrl` (string, optional)
  - `company` (string, optional)
  - `position` (string, optional)

#### get-campaign-leads
Retrieve leads from a campaign with pagination.

**Parameters**:
- `campaignId` (string, required): Campaign ID
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 50): Results per page

### Messaging

#### send-message
Send a direct message to a lead.

**Parameters**:
- `leadId` (string, required): Target lead ID
- `message` (string, required): Message content
- `templateId` (string, optional): Message template ID

### Social Actions

#### perform-social-action
Perform LinkedIn social actions.

**Parameters**:
- `action` (enum, required): "like", "follow", or "view"
- `targetUrl` (string, required): LinkedIn URL target
- `leadId` (string, optional): Associated lead ID

### Analytics

#### get-campaign-metrics
Get detailed campaign performance metrics.

**Parameters**:
- `campaignId` (string, required): Campaign ID

**Example Response**:
```json
{
  "campaignId": "camp_123",
  "totalLeads": 150,
  "contacted": 120,
  "replied": 25,
  "connected": 45,
  "responseRate": 20.8,
  "connectionRate": 37.5
}
```

## Error Handling

The server provides detailed error messages for common issues:

- **Invalid API Key**: Check your API key and ensure it's active
- **Rate Limiting**: HeyReach API has rate limits; the server will indicate when limits are exceeded
- **Invalid Parameters**: Detailed validation errors for incorrect tool parameters
- **Network Issues**: Connection and timeout error handling

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
git clone https://github.com/yourusername/heyreach-mcp-server.git
cd heyreach-mcp-server
npm install
```

### Development Commands
```bash
npm run dev          # Start in development mode
npm run build        # Build for production
npm run start        # Start production build
```

### Testing
```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector heyreach-mcp-server --api-key=YOUR_API_KEY
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/heyreach-mcp-server/issues)
- **Documentation**: [HeyReach API Docs](https://documenter.getpostman.com/view/23808049/2sA2xb5F75)
- **MCP Specification**: [Model Context Protocol](https://spec.modelcontextprotocol.io/)

## Changelog

### v1.0.0
- Initial release
- Full HeyReach API integration
- Campaign, lead, messaging, and analytics tools
- Social action automation
- Comprehensive error handling
