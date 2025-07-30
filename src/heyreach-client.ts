import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  HeyReachConfig,
  Campaign,
  Lead,
  MessageTemplate,
  CampaignMetrics,
  SocialAction,
  ApiResponse,
  PaginatedResponse,
  AddLeadsToCampaignParams,
  SendMessageParams,
  SocialActionParams,
  CreateCampaignParams
} from './types.js';

export class HeyReachClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: HeyReachConfig) {
    this.apiKey = config.apiKey;

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.heyreach.io/api/public',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new Error(`HeyReach API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          throw new Error('HeyReach API Error: No response received');
        } else {
          throw new Error(`HeyReach API Error: ${error.message}`);
        }
      }
    );
  }

  /**
   * Verify API key is valid
   */
  async checkApiKey(): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.client.get('/auth/CheckApiKey');
      // If we get a 200 response, the API key is valid
      return {
        success: true,
        data: response.status === 200,
        message: `API key is valid (Status: ${response.status})`
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
      const response = await this.client.post('/campaign/GetAll', {});
      return {
        success: true,
        data: response.data?.items || [],
        pagination: {
          page: 1,
          limit: response.data?.items?.length || 0,
          total: response.data?.totalCount || 0,
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
      const response = await this.client.get(`/campaign/GetById?campaignId=${campaignId}`);
      return {
        success: true,
        data: response.data,
        message: 'Campaign details retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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
   * Add leads to campaign
   */
  async addLeadsToCampaign(params: AddLeadsToCampaignParams): Promise<ApiResponse<{ addedCount: number }>> {
    try {
      const response = await this.client.post('/campaign/AddLeadsToListV2', {
        campaignId: params.campaignId,
        leads: params.leads
      });
      return {
        success: true,
        data: { addedCount: response.data?.addedCount || params.leads.length },
        message: `Successfully added ${response.data?.addedCount || params.leads.length} leads to campaign`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
   * Update lead status
   */
  async updateLeadStatus(leadId: string, status: Lead['status']): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.client.post('/lead/UpdateStatus', {
        leadId,
        status
      });
      return {
        success: true,
        data: response.data,
        message: 'Lead status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
   * Pause or resume campaign
   */
  async toggleCampaignStatus(campaignId: string, action: 'pause' | 'resume'): Promise<ApiResponse<Campaign>> {
    try {
      const endpoint = action === 'pause' ? '/campaign/Pause' : '/campaign/Resume';
      const response = await this.client.post(`${endpoint}?campaignId=${campaignId}`);
      return {
        success: true,
        data: response.data,
        message: `Campaign ${action}d successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
