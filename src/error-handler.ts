/**
 * Enhanced Error Handler for HeyReach MCP Server
 * Based on Instantly MCP learnings - provides actionable error messages with guidance
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export interface HeyReachApiError {
  status?: number;
  message?: string;
  data?: any;
}

/**
 * Centralized error handler that provides actionable guidance to users
 */
export const handleHeyReachError = (error: any, toolName: string): never => {
  const apiError = error.response || error;
  const status = apiError?.status;
  const message = apiError?.data?.message || apiError?.message || 'Unknown error';

  // API Key Issues
  if (status === 401 || message.includes('unauthorized') || message.includes('invalid api key')) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${toolName} failed: Invalid API key. Use check-api-key tool to verify your API key is working.`
    );
  }

  // Rate Limiting
  if (status === 429) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${toolName} failed: Rate limit exceeded. HeyReach allows 300 requests per minute. Please wait before retrying.`
    );
  }

  // Bad Request - Parameter Issues
  if (status === 400) {
    if (toolName === 'add-leads-to-campaign') {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${toolName} failed: ${message}. Common issues: 1) Campaign must be ACTIVE (not DRAFT), 2) Campaign must have LinkedIn senders assigned, 3) Use get-all-campaigns to verify campaign status and accounts.`
      );
    }
    throw new McpError(
      ErrorCode.InvalidParams,
      `${toolName} failed: Invalid parameters. ${message}. Check parameter names and formats. Use get-all-campaigns to get valid campaign IDs.`
    );
  }

  // Not Found - Resource Issues
  if (status === 404) {
    if (toolName.includes('campaign')) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${toolName} failed: Campaign not found. Use get-all-campaigns to get valid campaign IDs.`
      );
    }
    throw new McpError(
      ErrorCode.InvalidParams,
      `${toolName} failed: Resource not found. ${message}`
    );
  }

  // Method Not Allowed
  if (status === 405) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${toolName} failed: Method not allowed. This endpoint may not exist or require different HTTP method.`
    );
  }

  // Network/Timeout Issues
  if (message.includes('timeout') || message.includes('ECONNRESET') || message.includes('Network Error')) {
    throw new McpError(
      ErrorCode.InternalError,
      `${toolName} failed: Network timeout. HeyReach API may be slow. Please retry in a few moments.`
    );
  }

  // Server Errors
  if (status >= 500) {
    throw new McpError(
      ErrorCode.InternalError,
      `${toolName} failed: HeyReach server error (${status}). Please try again later.`
    );
  }

  // Generic fallback with guidance
  throw new McpError(
    ErrorCode.InternalError,
    `${toolName} failed: ${message}. If this persists, use check-api-key to verify your API key.`
  );
};

/**
 * Validates required parameters and provides helpful error messages
 */
export const validateRequiredParams = (params: any, required: string[], toolName: string): void => {
  for (const param of required) {
    if (params[param] === undefined || params[param] === null || params[param] === '') {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${toolName} requires parameter '${param}'. ${getParameterGuidance(param, toolName)}`
      );
    }
  }
};

/**
 * Provides specific guidance for common parameters
 */
const getParameterGuidance = (param: string, toolName: string): string => {
  switch (param) {
    case 'campaignId':
      return 'Use get-all-campaigns to get valid campaign IDs.';
    case 'profileUrl':
      return 'Provide a LinkedIn profile URL like "https://www.linkedin.com/in/username".';
    case 'listId':
      return 'Use get-all-lists to get valid list IDs.';
    case 'offset':
      return 'Use 0 for the first page.';
    case 'limit':
      return 'Use a number between 1 and 100.';
    default:
      return 'Check the parameter format and try again.';
  }
};

/**
 * Tool dependency mapping - defines which tools should be called first
 */
export const TOOL_DEPENDENCIES: Record<string, string[]> = {
  'get-campaign-details': ['get-all-campaigns'],
  'toggle-campaign-status': ['get-all-campaigns'],
  'add-leads-to-campaign': ['get-all-campaigns'],
  'get-campaign-leads': ['get-all-campaigns'],
  'add-leads-to-list': ['get-all-lists'],
  'get-campaigns-for-lead': [],
  'get-my-network-for-sender': ['get-linkedin-accounts'],
};

/**
 * Validates tool dependencies and provides guidance
 */
export const validateToolDependencies = (toolName: string): string | null => {
  const dependencies = TOOL_DEPENDENCIES[toolName];
  if (dependencies && dependencies.length > 0) {
    return `**PREREQUISITE**: Call ${dependencies.join(' or ')} first to get required IDs.`;
  }
  return null;
};

/**
 * Validates parameter types and formats
 */
export const validateParameterTypes = (params: any, schema: Record<string, string>, toolName: string): void => {
  for (const [param, expectedType] of Object.entries(schema)) {
    if (params[param] !== undefined) {
      const actualType = typeof params[param];
      
      if (expectedType === 'number' && actualType !== 'number') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `${toolName}: Parameter '${param}' must be a number, got ${actualType}.`
        );
      }
      
      if (expectedType === 'string' && actualType !== 'string') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `${toolName}: Parameter '${param}' must be a string, got ${actualType}.`
        );
      }
      
      if (expectedType === 'array' && !Array.isArray(params[param])) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `${toolName}: Parameter '${param}' must be an array, got ${actualType}.`
        );
      }
    }
  }
};

/**
 * Success response wrapper with consistent format
 */
export const createSuccessResponse = (data: any, message?: string) => {
  return {
    content: [{
      type: 'text' as const,
      text: message ? `${message}\n\n${JSON.stringify(data, null, 2)}` : JSON.stringify(data, null, 2)
    }]
  };
};

/**
 * Error response wrapper with consistent format
 */
export const createErrorResponse = (error: string) => {
  return {
    content: [{
      type: 'text' as const,
      text: `Error: ${error}`
    }],
    isError: true
  };
};
