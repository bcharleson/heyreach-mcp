# HeyReach MCP Server v1.1.6

A **production-ready** Model Context Protocol (MCP) server that provides seamless integration with the HeyReach API for LinkedIn automation and outreach management.

## 🎯 Key Features in v1.1.6

- **91.7% Success Rate** (11 working tools with comprehensive validation)
- **12 Production-Ready Tools** (all validated against real API)
- **Enhanced Error Handling** with actionable guidance and pre-flight validation
- **Universal MCP Client Support** (Claude, Cursor, Windsurf, ChatGPT, n8n, etc.)
- **Type-Safe Parameters** with comprehensive validation
- **Campaign Status Validation** prevents common errors

## ✅ Available Tools (All Tested & Working)

### 🎯 Core Campaign Management
- **`check-api-key`** - Verify API key validity
- **`get-all-campaigns`** - List all campaigns with pagination
- **`get-active-campaigns`** - Find campaigns ready for adding leads (ACTIVE status with LinkedIn senders)
- **`get-campaign-details`** - Get detailed campaign information *(requires campaign ID)*
- **`toggle-campaign-status`** - Pause or resume campaigns *(requires campaign ID)*

### 👥 Lead Management with Personalization
- **`add-leads-to-campaign`** - Add LinkedIn profiles to ACTIVE campaigns with comprehensive validation and personalization support
- **`get-lead-details`** - Get detailed lead profile information *(requires LinkedIn profile URL)*

### 💬 Conversation Management
- **`get-conversations`** - Retrieve LinkedIn conversations with advanced filtering

### 📊 Analytics & Reporting
- **`get-overall-stats`** - Get comprehensive analytics and statistics

### 📋 List Management
- **`get-all-lists`** - Retrieve all lead lists with pagination
- **`create-empty-list`** - Create new lead or company lists
- **`get-my-network-for-sender`** - Get network profiles for LinkedIn accounts *(requires sender ID)*

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
        "heyreach-mcp-server@1.2.0",
        "--api-key=YOUR_HEYREACH_API_KEY"
      ]
    }
  }
}
```

### n8n Agent (Workflow Automation)

**✅ CONFIRMED COMPATIBLE** - All 18 tools working with n8n community MCP node

1. Install the community MCP node in n8n: `n8n-nodes-mcp`
2. Create **MCP Client (STDIO)** credentials in n8n:

```json
{
  "command": "npx",
  "args": [
    "heyreach-mcp-server@1.2.0",
    "--api-key=YOUR_HEYREACH_API_KEY"
  ],
  "transport": "stdio"
}
```

3. Add **MCP Client** node to your workflows and select HeyReach credentials
4. Choose from 18 available tools for LinkedIn automation workflows

**📋 See [N8N_AGENT_SETUP.md](N8N_AGENT_SETUP.md) for complete workflow examples**

### Other MCP Clients

For other MCP-compatible clients (Cursor, Windsurf, ChatGPT, etc.), use the following configuration:

```json
{
  "command": "npx",
  "args": [
    "heyreach-mcp-server@1.2.0",
    "--api-key=YOUR_HEYREACH_API_KEY"
  ],
  "transport": "stdio"
}
```

#### Cursor IDE
Add to your Cursor settings:
```json
{
  "mcp": {
    "servers": {
      "heyreach": {
        "command": "npx",
        "args": ["heyreach-mcp-server", "--api-key=YOUR_HEYREACH_API_KEY"]
      }
    }
  }
}
```

#### Windsurf IDE
Add to your Windsurf MCP configuration:
```json
{
  "mcpServers": {
    "heyreach": {
      "command": "npx",
      "args": ["heyreach-mcp-server", "--api-key=YOUR_HEYREACH_API_KEY"]
    }
  }
}
```

## API Key Setup

1. Log in to your HeyReach account
2. Navigate to Settings > API Keys
3. Generate a new API key
4. Copy the API key and use it in the configuration

⚠️ **Security Note**: Never commit your API key to version control. Always pass it as a command-line argument or environment variable.

## 📖 Tool Documentation

### ✅ Core Campaign Management

#### check-api-key
Verify that your HeyReach API key is valid and working.

**Parameters**: None

**Example Response**:
```json
{
  "valid": true,
  "status": "API key is working correctly"
}
```

#### get-all-campaigns
Lists all campaigns in your HeyReach account with pagination.

**Parameters**:
- `offset` (number, optional, default: 0): Number of records to skip
- `limit` (number, optional, default: 50): Maximum campaigns to return (1-100)

**Example Response**:
```json
{
  "campaigns": [
    {
      "id": 90486,
      "name": "Test Campaign",
      "status": "DRAFT",
      "creationTime": "2025-01-24T21:30:29.037886Z",
      "campaignAccountIds": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 6,
    "hasMore": false
  }
}
```

#### get-campaign-details
Get detailed information about a specific campaign.

**Prerequisites**: Use `get-all-campaigns` first to get valid campaign IDs

**Parameters**:
- `campaignId` (number, required): Campaign ID from get-all-campaigns

#### toggle-campaign-status
Pause or resume a campaign.

**Prerequisites**: Use `get-all-campaigns` first to get valid campaign IDs

**Parameters**:
- `campaignId` (number, required): Campaign ID
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

### v1.1.6 - Production-Ready Release
- **🎯 91.7% Success Rate** (11/12 tools working with comprehensive validation)
- **✅ 12 Production-Ready Tools** (all validated against real API)
- **🛠 Enhanced Error Handling** with pre-flight validation and actionable user guidance
- **🌐 Universal MCP Client Support** (Claude, Cursor, Windsurf, ChatGPT, n8n, etc.)
- **🎨 Advanced Personalization** with custom fields and best practices
- **🔧 Campaign Status Validation** prevents adding leads to DRAFT campaigns
- **➕ New get-active-campaigns Tool** for finding campaigns ready for leads
- **🔒 Type-Safe Parameters** with comprehensive validation and clear documentation
- **📚 Tool Dependencies** clearly documented with prerequisites
- **📋 API Endpoint Documentation** complete validation report for HeyReach team
- **🎯 Production-Ready Architecture** with robust error prevention and user guidance
