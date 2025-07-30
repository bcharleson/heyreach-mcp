# Changelog

All notable changes to the HeyReach MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-07-30

### 🚀 Major Features Added

#### Dual Transport Architecture
- **HTTP Streaming Transport**: Added support for HTTP streaming transport alongside existing stdio transport
- **URL-based API Authentication**: Implemented `/mcp/{API_KEY}` endpoint pattern for remote access
- **Session Management**: Proper session handling with automatic cleanup for HTTP transport
- **Backward Compatibility**: Stdio transport remains unchanged for existing users

#### Cloud Deployment Support
- **Docker Support**: Multi-stage Docker builds with security best practices
- **Vercel Configuration**: Ready-to-deploy Vercel configuration with proper routing
- **Railway Configuration**: Complete Railway deployment setup with auto-scaling
- **Health Monitoring**: Built-in health check endpoints for production monitoring

#### Production Features
- **CORS Support**: Configurable CORS headers for browser-based clients
- **DNS Rebinding Protection**: Security protection against DNS rebinding attacks
- **Graceful Shutdown**: Proper cleanup of resources on server shutdown
- **Concurrent Sessions**: Support for multiple simultaneous HTTP sessions

### 🔧 Technical Improvements

#### MCP SDK Update
- **Latest SDK**: Updated to MCP TypeScript SDK v1.17.0
- **Protocol Compliance**: Full compatibility with latest MCP protocol specifications
- **No Breaking Changes**: Existing stdio usage remains unchanged

#### Architecture Enhancements
- **Dual Entry Points**: Separate binaries for stdio (`heyreach-mcp-server`) and HTTP (`heyreach-mcp-http`)
- **Environment Configuration**: Comprehensive environment variable support
- **Error Handling**: Enhanced error handling for both transport modes
- **Logging**: Improved logging for debugging and monitoring

### 📦 New Files Added

#### Core Implementation
- `src/http-server.ts` - HTTP streaming transport implementation
- `src/http-index.ts` - HTTP-only entry point for cloud deployment

#### Deployment Configuration
- `vercel.json` - Vercel deployment configuration
- `railway.toml` - Railway deployment configuration
- `Dockerfile` - Multi-stage Docker build configuration
- `docker-compose.yml` - Docker Compose setup with nginx
- `nginx.conf` - Production nginx configuration

#### Scripts and Automation
- `scripts/deploy-vercel.sh` - Automated Vercel deployment
- `scripts/deploy-railway.sh` - Automated Railway deployment
- `scripts/deploy-docker.sh` - Automated Docker deployment

#### Documentation
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `HEYREACH_DEPLOYMENT_GUIDE.md` - Specific guide for HeyReach team
- `.env.example` - Environment variable examples

### 🔄 Changed

#### Package Configuration
- **Version**: Bumped to 2.0.0
- **Description**: Updated to reflect dual transport support
- **Scripts**: Added `dev:http`, `start:http` for HTTP mode
- **Binary**: Added `heyreach-mcp-http` binary

#### Dependencies
- **MCP SDK**: Updated from ^1.12.0 to ^1.17.0
- **Express**: Added ^4.21.2 for HTTP server
- **CORS**: Added ^2.8.5 for cross-origin support
- **Type Definitions**: Added @types/express and @types/cors

### 🌐 n8n Integration

#### Enhanced Compatibility
- **Stdio Support**: Existing n8n MCP node compatibility maintained
- **HTTP Support**: New HTTP Request node integration for cloud deployments
- **Workflow Examples**: Updated documentation with HTTP transport examples

### 🔒 Security Enhancements

#### Production Security
- **DNS Rebinding Protection**: Enabled by default with configurable allowed hosts
- **CORS Configuration**: Proper CORS headers for secure browser access
- **SSL/TLS Ready**: HTTPS-ready configuration for production deployment
- **Security Headers**: Added security headers in nginx configuration

### 📊 Monitoring and Observability

#### Health Checks
- **Health Endpoint**: `/health` endpoint for monitoring
- **Session Tracking**: Session count in health responses
- **Error Logging**: Comprehensive error logging for debugging

### 🚀 Deployment Options

#### Cloud Platforms
- **Vercel**: One-click deployment with proper routing
- **Railway**: Auto-scaling deployment with health checks
- **Docker**: Production-ready containerization

#### Integration Patterns
- **Reverse Proxy**: nginx configuration for production deployment
- **Load Balancing**: Support for multiple instances
- **Environment Variables**: Comprehensive configuration options

### 📈 Performance Improvements

#### Efficiency
- **Concurrent Sessions**: Multiple simultaneous connections supported
- **Resource Cleanup**: Proper cleanup of sessions and resources
- **Optimized Builds**: Multi-stage Docker builds for smaller images

### 🔧 Developer Experience

#### Development Tools
- **Hot Reload**: Development mode with automatic restart
- **Type Safety**: Full TypeScript support with latest types
- **Error Messages**: Improved error messages and debugging

### 📋 Migration Guide

#### From v1.x to v2.0.0
- **No Breaking Changes**: Existing stdio usage works unchanged
- **New Features**: HTTP transport available as additional option
- **Configuration**: New environment variables for HTTP mode
- **Deployment**: New cloud deployment options available

### 🎯 Use Cases Enabled

#### New Capabilities
- **Remote Access**: Access HeyReach tools from cloud environments
- **n8n Cloud**: Integration with cloud-based n8n instances
- **Web Applications**: Direct integration with web applications
- **API Gateway**: Use as microservice in larger architectures

---

## [1.0.3] - 2024-01-XX

### Fixed
- **Response Parsing**: Fixed campaigns endpoint to parse `items` array instead of `campaigns`
- **API Key Validation**: Improved API key check to properly validate 200 status responses
- **Data Structure**: Updated response handling to match actual HeyReach API response format
- **Pagination**: Added proper pagination metadata for campaign responses

## [1.0.2] - 2024-01-XX

### Fixed
- **Correct Authentication**: Fixed API authentication to use only X-API-KEY header (removed Bearer token)
- **HeyReach API Compatibility**: Updated authentication method to match HeyReach API specification
- **Header Format**: Added proper Accept header for JSON responses

## [1.0.1] - 2024-01-XX

### Improved
- **Automatic Bearer Token**: Server now automatically adds "Bearer " prefix to API keys
- **Enhanced Authentication**: Both Authorization and X-API-KEY headers are sent for better compatibility
- **User Experience**: Users no longer need to manually add "Bearer " prefix to their API keys

### Fixed
- API authentication header format for better HeyReach API compatibility

## [1.0.0] - 2024-01-XX

### Added
- Initial release of HeyReach MCP Server
- Complete integration with HeyReach API
- Support for all major HeyReach operations:
  - Campaign management (create, list, get details, pause/resume)
  - Lead management (add to campaigns, update status, list leads)
  - Messaging (send messages, get templates)
  - Social actions (like, follow, view profiles)
  - Analytics (campaign metrics, API key validation)
- TypeScript implementation with full type safety
- Comprehensive error handling and validation
- Command-line interface with API key configuration
- Support for custom base URLs
- NPM package with executable binary
- Claude Desktop integration examples
- Comprehensive documentation and examples
- MIT license for open-source distribution

### Features
- **15 MCP Tools** covering all major HeyReach functionality
- **Secure API Key Handling** via command-line arguments
- **Error Handling** with detailed error messages
- **Type Safety** with TypeScript and Zod validation
- **Extensible Architecture** for easy addition of new tools
- **Cross-Platform Support** for Windows, macOS, and Linux
- **MCP Protocol Compliance** with latest specification

### Tools Included
1. `get-all-campaigns` - List all campaigns
2. `get-campaign-details` - Get specific campaign information
3. `create-campaign` - Create new outreach campaigns
4. `toggle-campaign-status` - Pause or resume campaigns
5. `add-leads-to-campaign` - Add leads to existing campaigns
6. `get-campaign-leads` - Retrieve leads with pagination
7. `update-lead-status` - Update individual lead status
8. `send-message` - Send direct messages to leads
9. `get-message-templates` - List available message templates
10. `perform-social-action` - Execute LinkedIn social actions
11. `get-campaign-metrics` - Retrieve campaign analytics
12. `check-api-key` - Validate API key

### Documentation
- Complete README with installation and usage instructions
- Claude Desktop configuration examples
- API reference for all tools
- Error handling guide
- Development setup instructions
- Contributing guidelines

### Security
- API keys passed via command-line arguments only
- No hardcoded credentials or environment variables
- Secure HTTP client with timeout and error handling
- Input validation for all tool parameters

### Compatibility
- Node.js 18+ support
- Compatible with all major MCP clients
- Tested with Claude Desktop
- Cross-platform executable

## [Unreleased]

### Planned Features
- Additional HeyReach API endpoints as they become available
- Enhanced error reporting and logging
- Performance optimizations
- Additional MCP client examples
- Integration tests with real API
- Docker container support
- Configuration file support
- Webhook support for real-time updates

---

## Release Notes

### v1.0.0 Release Notes

This is the initial release of the HeyReach MCP Server, providing comprehensive integration between the Model Context Protocol and HeyReach's LinkedIn automation platform.

**Key Highlights:**
- Complete HeyReach API coverage
- Production-ready TypeScript implementation
- Secure API key handling
- Comprehensive documentation
- Ready for NPM publication

**Getting Started:**
1. Install: `npx heyreach-mcp-server --api-key=YOUR_API_KEY`
2. Configure Claude Desktop with provided examples
3. Start automating your LinkedIn outreach through AI

**Support:**
- GitHub Issues for bug reports and feature requests
- Documentation at README.md
- Examples in the repository

**License:**
MIT License - free for commercial and personal use
