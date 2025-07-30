# 🔧 n8n Agent Workflow Fix for HeyReach MCP Server

## 🎯 **Problem Identified**

**Issue**: Tool execution fails in n8n Agent workflows with error "Received tool input did not match expected schema"

**Root Cause**: n8n AI agent workflow is configured to always pass parameters to ALL tools, but some tools like `check-api-key` expect NO parameters (empty schema `{}`).

**Error Details**:
- Tool discovery: ✅ Working (18/18 tools discovered)
- Tool execution: ❌ Failing (schema validation error)

## ✅ **Solution: Improved n8n Workflow Configuration**

### **Fixed MCP Client Tool Node Configuration**

Replace your current MCP Client Tool node configuration with this improved version:

```json
{
  "parameters": {
    "operation": "executeTool",
    "toolName": "={{ $fromAI(\"tool\", \"the selected tool to use\") }}",
    "toolParameters": "={{ $fromAI('tool') === 'check-api-key' ? {} : $fromAI('Tool_Parameters', `Based on the selected tool, provide the required parameters as a JSON object. If the tool requires no parameters, return an empty object {}`, 'json') }}"
  },
  "type": "n8n-nodes-mcp.mcpClientTool"
}
```

### **Key Changes Explained**

1. **Conditional Parameter Passing**: 
   - `check-api-key` tool gets empty object `{}`
   - Other tools get AI-generated parameters

2. **Improved AI Prompt**: 
   - Clear instruction to return empty object for parameter-less tools
   - Better guidance for parameter generation

3. **Schema Validation Fix**: 
   - Prevents passing parameters to tools that don't expect them
   - Maintains compatibility with tools that do need parameters

## 🔧 **Alternative: Advanced Workflow Configuration**

For more robust handling of multiple parameter-less tools:

```json
{
  "parameters": {
    "operation": "executeTool",
    "toolName": "={{ $fromAI(\"tool\", \"the selected tool to use\") }}",
    "toolParameters": "={{ ['check-api-key', 'get-overall-stats'].includes($fromAI('tool')) ? {} : $fromAI('Tool_Parameters', `Provide the required parameters for the selected tool as a JSON object. Return empty object {} if no parameters needed.`, 'json') }}"
  },
  "type": "n8n-nodes-mcp.mcpClientTool"
}
```

## 📋 **Complete n8n Workflow Setup**

### **1. MCP Client Credentials (No Changes)**
```json
{
  "command": "npx",
  "args": [
    "heyreach-mcp-server@1.2.1",
    "--api-key=YOUR_HEYREACH_API_KEY"
  ],
  "transport": "stdio"
}
```

### **2. AI Agent Node Configuration**
```json
{
  "parameters": {
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
      {
        "role": "system",
        "content": "You are a LinkedIn automation assistant with access to HeyReach MCP tools. When users ask to check API or validate authentication, use the 'check-api-key' tool which requires NO parameters. For other operations, use appropriate tools with required parameters."
      }
    ],
    "tools": {
      "toolCalling": "auto"
    }
  }
}
```

### **3. Fixed MCP Client Tool Node**
```json
{
  "parameters": {
    "operation": "executeTool",
    "toolName": "={{ $fromAI(\"tool\", \"the selected tool to use\") }}",
    "toolParameters": "={{ $fromAI('tool') === 'check-api-key' ? {} : $fromAI('Tool_Parameters', `Based on the selected tool, provide the required parameters as a JSON object. If the tool requires no parameters, return an empty object {}`, 'json') }}"
  },
  "type": "n8n-nodes-mcp.mcpClientTool"
}
```

## 🧪 **Testing the Fix**

### **Test Cases**

1. **Parameter-less Tool Test**:
   - User: "check my API"
   - Expected: `check-api-key` tool executes with `{}` parameters
   - Result: Should return API validation status

2. **Parameter Tool Test**:
   - User: "get my campaigns"
   - Expected: `get-all-campaigns` tool executes with proper parameters
   - Result: Should return campaign list

3. **Complex Parameter Tool Test**:
   - User: "get LinkedIn accounts"
   - Expected: `get-linkedin-accounts` tool executes with limit parameter
   - Result: Should return LinkedIn account list

## 📊 **Tools by Parameter Requirements**

### **No Parameters Required** (Use `{}`)
- ✅ `check-api-key` - API validation
- ✅ `get-overall-stats` - Account statistics

### **Optional Parameters** (Can use `{}` or specific params)
- ✅ `get-all-campaigns` - Campaign listing
- ✅ `get-active-campaigns` - Active campaign filtering
- ✅ `get-linkedin-accounts` - LinkedIn account listing
- ✅ `get-all-lists` - Lead list management
- ✅ `get-conversations` - Message management

### **Required Parameters** (Must provide specific params)
- ✅ `get-campaign-details` - Needs `campaignId`
- ✅ `add-leads-to-campaign` - Needs `campaignId` and `leads`
- ✅ `create-campaign` - Needs campaign configuration
- ✅ `pause-campaign` - Needs `campaignId`
- ✅ `resume-campaign` - Needs `campaignId`

## 🎯 **Expected Results After Fix**

### **Before Fix**
- Tool Discovery: ✅ 18/18 tools
- Tool Execution: ❌ Schema validation errors

### **After Fix**
- Tool Discovery: ✅ 18/18 tools  
- Tool Execution: ✅ All tools working
- Parameter-less tools: ✅ Execute with `{}`
- Parameter tools: ✅ Execute with AI-generated params

## 🚀 **Implementation Steps**

1. **Update MCP Client Tool Node** with the fixed configuration above
2. **Test with "check my API"** command to verify parameter-less tool execution
3. **Test with "get my campaigns"** to verify parameter tool execution
4. **Verify all 18 tools** are discoverable and executable

## ✅ **Backward Compatibility**

- ✅ **Claude Desktop**: No changes needed, continues working perfectly
- ✅ **Other MCP Clients**: No impact, STDIO transport unchanged
- ✅ **Existing n8n Workflows**: Can be updated with new configuration

---

**This fix resolves the n8n Agent tool execution issue while maintaining full compatibility with Claude Desktop and other MCP clients.**
