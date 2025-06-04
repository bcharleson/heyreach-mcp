/**
 * Type definitions for HeyReach API integration
 */

export interface HeyReachConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  createdAt: string;
  updatedAt: string;
  description?: string;
  leadCount?: number;
}

export interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  linkedinUrl?: string;
  company?: string;
  position?: string;
  status: 'pending' | 'contacted' | 'replied' | 'connected' | 'not_interested' | 'bounced';
  campaignId?: string;
  addedAt: string;
  lastActivity?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: 'connection_request' | 'follow_up' | 'direct_message';
  variables?: string[];
}

export interface CampaignMetrics {
  campaignId: string;
  totalLeads: number;
  contacted: number;
  replied: number;
  connected: number;
  responseRate: number;
  connectionRate: number;
}

export interface SocialAction {
  id: string;
  type: 'like' | 'follow' | 'view' | 'message';
  targetUrl: string;
  status: 'pending' | 'completed' | 'failed';
  executedAt?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Tool parameter schemas
export interface AddLeadsToCampaignParams {
  campaignId: string;
  leads: Array<{
    firstName?: string;
    lastName?: string;
    email?: string;
    linkedinUrl?: string;
    company?: string;
    position?: string;
  }>;
}

export interface SendMessageParams {
  leadId: string;
  message: string;
  templateId?: string;
}

export interface SocialActionParams {
  action: 'like' | 'follow' | 'view';
  targetUrl: string;
  leadId?: string;
}

export interface CreateCampaignParams {
  name: string;
  description?: string;
  messageTemplates?: string[];
  settings?: {
    dailyLimit?: number;
    delayBetweenActions?: number;
    workingHours?: {
      start: string;
      end: string;
    };
  };
}
