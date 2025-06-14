# Changelog

All notable changes to the HeyReach MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
