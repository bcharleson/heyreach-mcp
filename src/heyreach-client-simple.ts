/**
 * HeyReach Client - Simple HTTP Version
 * Uses Node.js built-in HTTPS module instead of axios
 */

import { makeSimpleHttpRequest } from './simple-http-client.js';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Campaign
} from './types.js';

export interface HeyReachClientSimpleConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export class HeyReachClientSimple {
  private apiKey: string;
  private baseURL: string;
  private timeout: number;

  constructor(config: HeyReachClientSimpleConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.heyreach.io/api/public';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Check if the API key is valid
   */
  async checkApiKey(): Promise<ApiResponse<boolean>> {
    try {
      const response = await makeSimpleHttpRequest({
        url: `${this.baseURL}/auth/CheckApiKey`,
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: this.timeout
      });

      if (response.success) {
        return {
          success: true,
          data: true,
          message: `API key is valid (Status: ${response.status})`
        };
      } else {
        return {
          success: false,
          error: response.error || `HTTP ${response.status}`
        };
      }
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
      const response = await makeSimpleHttpRequest({
        url: `${this.baseURL}/campaign/GetAll`,
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: {},
        timeout: this.timeout
      });

      if (response.success) {
        const data = response.data || {};
        return {
          success: true,
          data: data.items || [],
          pagination: {
            page: 1,
            limit: data.items?.length || 0,
            total: data.totalCount || 0,
            hasMore: false
          },
          message: 'Campaigns retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error || `HTTP ${response.status}`,
          data: []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  /**
   * Get campaign details
   */
  async getCampaignDetails(campaignId: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await makeSimpleHttpRequest({
        url: `${this.baseURL}/campaign/GetById?campaignId=${campaignId}`,
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: this.timeout
      });

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Toggle campaign status (pause/resume)
   */
  async toggleCampaignStatus(campaignId: string, action: 'pause' | 'resume'): Promise<ApiResponse<Campaign>> {
    try {
      const endpoint = action === 'pause' ? '/campaign/Pause' : '/campaign/Resume';
      const response = await makeSimpleHttpRequest({
        url: `${this.baseURL}${endpoint}?campaignId=${campaignId}`,
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: this.timeout
      });

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: `Campaign ${action}d successfully`
        };
      } else {
        return {
          success: false,
          error: response.error || `HTTP ${response.status}`
        };
      }
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
      const response = await makeSimpleHttpRequest({
        url: `${this.baseURL}/stats/GetOverallStats`,
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: {},
        timeout: this.timeout
      });

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Overall stats retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.error || `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
