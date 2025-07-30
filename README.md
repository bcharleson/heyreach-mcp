# HeyReach MCP Server v2.0.0

A **modern** Model Context Protocol (MCP) server with **dual transport support** for HeyReach LinkedIn automation. Supports both local (stdio) and remote (HTTP streaming) connections for maximum flexibility.

## 🚀 What's New in v2.0.0

### 🌐 Dual Transport Architecture
- **Stdio Transport**: For local MCP clients (Claude Desktop, Cursor, Windsurf)
- **HTTP Streaming Transport**: For remote access and cloud deployment (n8n, web clients)
- **URL-based API Authentication**: `https://your-domain.com/mcp/{API_KEY}`

### ☁️ Cloud Deployment Ready
- **Docker Support**: Multi-stage builds with security best practices
- **Vercel & Railway**: Ready-to-deploy configurations
- **Health Monitoring**: Built-in health check endpoints
- **Session Management**: Proper session handling for HTTP transport

### 🔒 Production Features
- **Latest MCP SDK**: Updated to v1.17.0 with latest protocol support
- **Security**: DNS rebinding protection, CORS support, secure headers
- **Backward Compatibility**: Existing stdio usage unchanged
- **Concurrent Sessions**: Support for multiple simultaneous connections

## 🚀 One-Click Cloud Deployment

Deploy your HeyReach MCP Server to the cloud instantly with automatic DNS rebinding protection configuration:

### 🚂 Railway (Recommended for n8n)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new)

**Perfect for n8n integration** - Deploy from GitHub with automatic environment configuration.

> **Instructions**: Click the button → Connect GitHub → Select `bcharleson/heyreach-mcp` repository → Deploy

### ▲ Vercel (Fastest Deployment)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp&env=ALLOWED_HOSTS&envDescription=Your%20custom%20domain%20for%20DNS%20rebinding%20protection&envLink=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp%2Fblob%2Fmain%2Fdeploy%2FDEPLOYMENT_GUIDE.md)

**Global edge deployment** - Instant HTTPS and custom domain support.

> 📋 **Post-deployment**: Follow the [Deployment Guide](deploy/DEPLOYMENT_GUIDE.md) to configure custom domains and test n8n integration.

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

## Installation & Usage

### 📱 Local Usage (Stdio Transport)

#### Via NPX (Recommended)
```bash
npx heyreach-mcp-server --api-key=YOUR_HEYREACH_API_KEY
```

#### Via NPM Global Install
```bash
npm install -g heyreach-mcp-server
heyreach-mcp-server --api-key=YOUR_HEYREACH_API_KEY
```

### 🌐 Remote Usage (HTTP Streaming Transport)

#### Start HTTP Server
```bash
# Via NPX
npx heyreach-mcp-http

# Via NPM Global Install
npm install -g heyreach-mcp-server
heyreach-mcp-http

# Or with custom port
heyreach-mcp-server --http --port=3001
```

#### Usage with Remote Clients
```bash
# Health Check
curl https://your-domain.com/health

# MCP Endpoint with URL path authentication
POST https://your-domain.com/mcp/{API_KEY}
Headers:
  Content-Type: application/json
  Accept: application/json, text/event-stream

# MCP Endpoint with header authentication (NEW!)
POST https://your-domain.com/mcp
Headers:
  Content-Type: application/json
  Accept: application/json, text/event-stream
  X-API-Key: YOUR_API_KEY
  # OR
  Authorization: Bearer YOUR_API_KEY
```

### ☁️ Cloud Deployment

#### Vercel (Recommended)
```bash
git clone https://github.com/bcharleson/heyreach-mcp-server.git
cd heyreach-mcp-server
npm install
npm run build
vercel --prod
```

#### Railway
```bash
npm install -g @railway/cli
railway up
```

#### Docker
```bash
docker build -t heyreach-mcp-server .
docker run -p 3000:3000 heyreach-mcp-server
```

### From Source
```bash
git clone https://github.com/bcharleson/heyreach-mcp-server.git
cd heyreach-mcp-server
npm install
npm run build

# Stdio mode
npm start -- --api-key=YOUR_HEYREACH_API_KEY

# HTTP mode
npm run start:http
```

## Configuration

### Stdio Transport (Local)

#### Command Line Arguments
- `--api-key=YOUR_API_KEY` (required): Your HeyReach API key
- `--base-url=CUSTOM_URL` (optional): Custom base URL for the HeyReach API

#### Example Usage
```bash
heyreach-mcp-server --api-key=hr_1234567890abcdef --base-url=https://api.heyreach.io/api/public
```

### HTTP Transport (Remote)

#### Command Line Arguments
- `--http` or `--http-server`: Enable HTTP streaming transport
- `--port=3000` (optional): Port number (default: 3000)

#### Example Usage
```bash
# Start HTTP server
heyreach-mcp-server --http --port=3001

# Or use dedicated HTTP binary
heyreach-mcp-http --port=3001
```

#### Environment Variables
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
ENABLE_DNS_REBINDING_PROTECTION=true
```

## MCP Client Configuration

### Claude Desktop (Stdio Transport)

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "heyreach": {
      "command": "npx",
      "args": [
        "heyreach-mcp-server@2.0.0",
        "--api-key=YOUR_HEYREACH_API_KEY"
      ]
    }
  }
}
```

### n8n Integration

#### Option 1: Stdio Transport (Local n8n)
**✅ CONFIRMED COMPATIBLE** - All tools working with n8n community MCP node

1. Install the community MCP node in n8n: `n8n-nodes-mcp`
2. Create **MCP Client (STDIO)** credentials in n8n:

```json
{
  "command": "npx",
  "args": [
    "heyreach-mcp-server@2.0.0",
    "--api-key=YOUR_HEYREACH_API_KEY"
  ],
  "transport": "stdio"
}
```

3. Add **MCP Client** node to your workflows and select HeyReach credentials
4. Choose from available tools for LinkedIn automation workflows

#### Option 2: HTTP Transport (Cloud n8n)
**🆕 NEW IN v2.0.0** - For cloud-based n8n instances

1. Deploy HeyReach MCP Server to cloud (Vercel, Railway, etc.)
2. Use **HTTP Request** node in n8n:

```json
{
  "url": "https://your-deployment.vercel.app/mcp/{{$env.HEYREACH_API_KEY}}",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
  },
  "body": {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }
}
```

#### Option 3: MCP Client with Header Authentication (EASIEST!)
**🆕 NEW IN v2.0.3** - Recommended for n8n users

1. **Deploy with one-click**: Use the [Railway](#-railway-recommended-for-n8n) or [Vercel](#-vercel-fastest-deployment) buttons above
2. **Configure custom domain**: Follow the [Deployment Guide](deploy/DEPLOYMENT_GUIDE.md)
3. Create **MCP Client (HTTP)** credentials in n8n:

**MCP Client Configuration:**
- **Endpoint**: `https://your-deployment.vercel.app/mcp`
- **Server Transport**: `HTTP Streamable`
- **Authentication**: `Header Auth`
- **Credential**: Create a new credential with:
  - **Name**: `HeyReach MCP`
  - **X-API-Key**: `YOUR_HEYREACH_API_KEY`

**Example n8n MCP Client Setup:**
```
Endpoint: https://heyreach-mcp-production.up.railway.app/mcp
Server Transport: HTTP Streamable
Authentication: Header Auth
Credential: HeyReach MCP (X-API-Key: YOUR_API_KEY)
```

This method is much easier than URL path authentication and more secure!

**📋 See [N8N_AGENT_SETUP.md](N8N_AGENT_SETUP.md) for complete workflow examples**

### Other MCP Clients

For other MCP-compatible clients (Cursor, Windsurf, ChatGPT, etc.), use the following configuration:

```json
{
  "command": "npx",
  "args": [
    "heyreach-mcp-server@2.0.0",
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

#### n8n Agent (NEW in v1.2.3)
For n8n Agent compatibility, use environment variables for secure API key handling:

**MCP Client Credentials:**
- **Command**: `npx`
- **Arguments**: `heyreach-mcp-server@1.2.3`
- **Environment**: `HEYREACH_API_KEY=YOUR_HEYREACH_API_KEY`

**Execute Tools Node:**
- **Tool Parameters**: Remove "Defined automatically by the model" and use:
```javascript
={{ $fromAI('tool') === 'check-api-key' ? {} : $fromAI('Tool_Parameters', `Based on the selected tool, provide the required parameters as a JSON object. If the tool requires no parameters, return an empty object {}`, 'json') }}
```

## API Key Setup

1. Log in to your HeyReach account
2. Navigate to Settings > API Keys
3. Generate a new API key
4. Copy the API key and use it in the configuration

⚠️ **Security Note**: Never commit your API key to version control. The server supports both:
- **Command-line arguments** (Claude Desktop): `--api-key=YOUR_API_KEY`
- **Environment variables** (n8n Agent): `HEYREACH_API_KEY=YOUR_API_KEY`

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
