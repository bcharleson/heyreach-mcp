# Model Context Protocol (MCP) Reference

**Protocol Version**: 2025-03-26 (Current)  
**Source**: https://modelcontextprotocol.io/llms-full.txt  
**Last Updated**: June 14, 2025  

## Protocol Overview

The Model Context Protocol (MCP) provides a standardized way for AI applications to connect to external data sources and tools. It enables secure, controlled access to local and remote resources through a client-server architecture.

## Core Concepts

### 1. Tools
Functions that clients can invoke to perform actions or retrieve data.

**Implementation Pattern**:
```typescript
server.tool(
  'tool-name',
  {
    // Zod schema for parameters (NO description field here)
    param1: z.string().describe('Parameter description'),
    param2: z.number().optional().default(0)
  },
  async ({ param1, param2 }) => {
    // Tool implementation
    return { content: [{ type: 'text', text: 'Result' }] };
  }
);
```

### 2. Resources
Static or dynamic content that can be read by clients.

**Use Cases**: Documentation, configuration files, data exports
**Not Implemented**: In HeyReach MCP (not needed for our use case)

### 3. Prompts
Reusable prompt templates with parameters.

**Use Cases**: Common LinkedIn outreach templates
**Not Implemented**: In HeyReach MCP (could be added for outreach templates)

### 4. Sampling
Allows servers to request LLM completions from clients.

**Use Cases**: AI-generated content, dynamic responses
**Not Implemented**: In HeyReach MCP (future enhancement)

## MCP Client Support Matrix

### Tier 1 Clients (Full Support)
- **Claude Desktop**: ✅ Tools, Resources, Prompts
- **Claude.ai**: ✅ Tools, Resources, Prompts (remote servers)
- **VS Code GitHub Copilot**: ✅ Full support with discovery
- **Continue**: ✅ Tools, Prompts, Resources

### Tier 2 Clients (Tools Only)
- **Cursor**: ✅ Tools support
- **Windsurf Editor**: ✅ Tools with AI Flow
- **Cline**: ✅ Tools and Resources
- **BoltAI**: ✅ Tools support

### Configuration Examples

#### Claude Desktop
```json
{
  "mcpServers": {
    "heyreach": {
      "command": "npx",
      "args": ["heyreach-mcp-server@1.1.7", "--api-key=YOUR_API_KEY"]
    }
  }
}
```

#### VS Code GitHub Copilot
```json
{
  "github.copilot.chat.experimental.mcp": {
    "heyreach": {
      "command": "npx",
      "args": ["heyreach-mcp-server@1.1.7", "--api-key=YOUR_API_KEY"]
    }
  }
}
```

## Protocol Messages

### Initialization
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "tools": {}
    },
    "clientInfo": {
      "name": "claude-desktop",
      "version": "1.0.0"
    }
  }
}
```

### Tool Call
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "add-leads-to-campaign",
    "arguments": {
      "campaignId": 123,
      "leads": [...]
    }
  }
}
```

### Tool Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Successfully added 5 leads to campaign"
      }
    ]
  }
}
```

## Error Handling

### Standard Error Codes
- `-32602`: Invalid params (validation errors)
- `-32603`: Internal error (server errors)
- `-32601`: Method not found
- `-32600`: Invalid request

### Error Response Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid params: campaignId is required"
  }
}
```

## Advanced Features

### Logging (Should Implement)
```typescript
// Declare logging capability
{
  "capabilities": {
    "logging": {}
  }
}

// Send log messages
{
  "jsonrpc": "2.0",
  "method": "notifications/message",
  "params": {
    "level": "info",
    "logger": "heyreach-client",
    "data": {
      "operation": "add-leads",
      "campaignId": 123,
      "count": 5
    }
  }
}
```

### Pagination (Should Implement)
```typescript
// Request with cursor
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-all-campaigns",
    "arguments": {
      "cursor": "eyJwYWdlIjogMn0="
    }
  }
}

// Response with next cursor
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [...],
    "nextCursor": "eyJwYWdlIjogM30="
  }
}
```

## Security Best Practices

### 1. Input Validation
- Use Zod schemas for all parameters
- Validate required fields
- Sanitize user inputs
- Check parameter formats (URLs, IDs, etc.)

### 2. API Key Security
- Never log full API keys
- Use masking: `key.substring(0, 10) + '...'`
- Validate key format before requests
- Handle auth errors gracefully

### 3. Rate Limiting
- Implement request throttling
- Add retry logic for timeouts
- Respect external API limits
- Use exponential backoff

### 4. Error Information
- Don't expose internal details
- Provide actionable error messages
- Log detailed errors server-side
- Return user-friendly messages

## Performance Optimization

### 1. Connection Management
- Use connection pooling
- Implement proper timeouts
- Handle network failures gracefully
- Cache frequently accessed data

### 2. Memory Management
- Clean up resources after use
- Avoid memory leaks
- Use streaming for large data
- Implement garbage collection

### 3. API Efficiency
- Batch requests when possible
- Cache campaign details
- Minimize unnecessary calls
- Use appropriate timeouts

## Testing Strategies

### 1. Unit Testing
- Test each tool individually
- Mock external API calls
- Validate error handling
- Check parameter validation

### 2. Integration Testing
- Test with real API keys
- Verify end-to-end workflows
- Test error scenarios
- Validate client compatibility

### 3. Performance Testing
- Measure response times
- Test with large datasets
- Verify timeout handling
- Check memory usage

## Deployment Considerations

### 1. NPM Package
- Use semantic versioning
- Include necessary files only
- Provide clear documentation
- Handle dependencies properly

### 2. CLI Distribution
- Cross-platform compatibility
- Proper argument handling
- Clear error messages
- Help documentation

### 3. Client Configuration
- Provide clear setup instructions
- Include troubleshooting guides
- Document common issues
- Offer multiple installation methods

---

**Key Takeaways for HeyReach MCP**:
1. Focus on tools (our primary use case)
2. Implement comprehensive error handling
3. Add logging for production debugging
4. Consider pagination for large result sets
5. Maintain compatibility with major MCP clients
