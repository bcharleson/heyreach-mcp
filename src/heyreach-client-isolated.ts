/**
 * HeyReach Client - Isolated Version
 * Uses process isolation to work around MCP SDK HTTP request issues
 */

import { executeIsolatedHttpRequest } from './http-isolation-wrapper.js';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Campaign, 
  MessageTemplate, 
  Lead, 
  CampaignMetrics,
  CreateCampaignParams,
  SendMessageParams,
  SocialActionParams,
  SocialAction
} from './types.js';

export interface HeyReachClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export class HeyReachClientIsolated {
  private apiKey: string;
  private baseURL: string;
  private timeout: number;

  constructor(config: HeyReachClientConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.heyreach.io/api/public';
    this.timeout = config.timeout || 30000;
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any
  ): Promise<T> {
    const response = await executeIsolatedHttpRequest({
      url: `${this.baseURL}${endpoint}`,
      method,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data,
      timeout: this.timeout
    });

    if (!response.success) {
      throw new Error(response.error || 'HTTP request failed');
    }

    return response.data;
  }

  /**
   * Check if the API key is valid
   */
  async checkApiKey(): Promise<ApiResponse<boolean>> {
    try {
      await this.makeRequest('/auth/CheckApiKey');
      return {
        success: true,
        data: true,
        message: 'API key is valid'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<PaginatedResponse<Campaign>> {
    try {
      const response = await this.makeRequest<any>('/campaign/GetAll', 'POST', {});
      return {
        success: true,
        data: response?.items || [],
        pagination: {
          page: 1,
          limit: response?.items?.length || 0,
          total: response?.totalCount || 0,
          hasMore: false
        },
        message: 'Campaigns retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get campaign details
   */
  async getCampaignDetails(campaignId: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.makeRequest<Campaign>(`/campaign/GetById?campaignId=${campaignId}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(params: CreateCampaignParams): Promise<ApiResponse<Campaign>> {
    // Note: The /campaign/Create endpoint does not exist in the HeyReach API
    // This is a known limitation documented in API_ENDPOINT_STATUS.md
    return {
      success: false,
      error: 'Campaign creation endpoint is not available in the HeyReach API. Campaigns must be created through the HeyReach web interface.',
    };
  }

  /**
   * Get leads in a campaign
   */
  async getCampaignLeads(campaignId: string, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Lead>> {
    // Note: The /campaign/GetLeads endpoint does not exist in the HeyReach API
    // This is a known limitation documented in API_ENDPOINT_STATUS.md
    return {
      success: false,
      error: 'Campaign leads endpoint is not available in the HeyReach API. Lead information must be accessed through the HeyReach web interface or individual lead lookup.',
      data: []
    };
  }

  /**
   * Send message to lead
   */
  async sendMessage(params: SendMessageParams): Promise<ApiResponse<{ messageId: string }>> {
    // Note: The /message/Send endpoint does not exist in the HeyReach API
    // This is a known limitation documented in API_ENDPOINT_STATUS.md
    return {
      success: false,
      error: 'Direct message sending endpoint is not available in the HeyReach API. Messages must be sent through the HeyReach web interface or campaign automation.',
    };
  }

  /**
   * Perform social action
   */
  async performSocialAction(params: SocialActionParams): Promise<ApiResponse<SocialAction>> {
    // Note: The /social/Action endpoint does not exist in the HeyReach API
    // This is a known limitation documented in API_ENDPOINT_STATUS.md
    return {
      success: false,
      error: 'Social action endpoint is not available in the HeyReach API. Social actions must be configured through campaign automation in the HeyReach web interface.',
    };
  }

  /**
   * Get message templates
   */
  async getMessageTemplates(): Promise<PaginatedResponse<MessageTemplate>> {
    // Note: The /templates/GetAll endpoint does not exist in the HeyReach API
    // This is a known limitation documented in API_ENDPOINT_STATUS.md
    return {
      success: false,
      error: 'Message templates endpoint is not available in the HeyReach API. Templates must be managed through the HeyReach web interface.',
      data: []
    };
  }

  /**
   * Get campaign metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<ApiResponse<CampaignMetrics>> {
    // Note: The /analytics/campaign/{id} endpoint does not exist in the HeyReach API
    // This is a known limitation documented in API_ENDPOINT_STATUS.md
    // Use getOverallStats() for general analytics data instead
    return {
      success: false,
      error: 'Campaign-specific metrics endpoint is not available in the HeyReach API. Use the overall stats endpoint for general analytics data.',
    };
  }

  /**
   * Toggle campaign status (pause/resume)
   */
  async toggleCampaignStatus(campaignId: string, action: 'pause' | 'resume'): Promise<ApiResponse<Campaign>> {
    try {
      const endpoint = action === 'pause' ? '/campaign/Pause' : '/campaign/Resume';
      const response = await this.makeRequest<Campaign>(`${endpoint}?campaignId=${campaignId}`, 'POST');
      return {
        success: true,
        data: response,
        message: `Campaign ${action}d successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get overall stats
   */
  async getOverallStats(): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest<any>('/stats/GetOverallStats', 'POST', {});
      return {
        success: true,
        data: response,
        message: 'Overall stats retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
