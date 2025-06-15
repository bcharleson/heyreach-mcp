/**
 * Type definitions for HeyReach API integration
 */

export interface HeyReachConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface Campaign {
  id: number;
  name: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED' | 'CANCELED' | 'FAILED' | 'STARTING';
  creationTime: string;
  linkedInUserListName?: string;
  linkedInUserListId?: number;
  campaignAccountIds: number[];
  progressStats?: {
    totalUsers: number;
    totalUsersInProgress: number;
    totalUsersPending: number;
    totalUsersFinished: number;
    totalUsersFailed: number;
  };
  excludeInOtherCampaigns?: boolean;
  excludeHasOtherAccConversations?: boolean;
  excludeContactedFromSenderInOtherCampaign?: boolean;
  excludeListId?: number;
}

export interface Lead {
  linkedin_id: string;
  profileUrl: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  headline?: string;
  imageUrl?: string;
  location?: string;
  summary?: string;
  companyName?: string;
  companyUrl?: string;
  position?: string;
  industry?: string;
  about?: string;
  username?: string;
  emailAddress?: string;
  enrichedEmailAddress?: string;
  connections?: number;
  followers?: number;
  experiences?: string;
  education?: string;
  emailEnrichments?: string[];
}

export interface Conversation {
  id: string;
  read: boolean;
  groupChat: boolean;
  blockedByMe: boolean;
  blockedByParticipant: boolean;
  lastMessageAt: string;
  lastMessageText: string;
  lastMessageType: 'TEXT' | 'IMAGE' | 'FILE';
  lastMessageSender: 'ME' | 'THEM';
  totalMessages: number;
  campaignId: number;
  linkedInAccountId: number;
  correspondentProfile: Lead;
}

export interface OverallStats {
  byDayStats: Record<string, DayStats>;
  overallStats: DayStats;
}

export interface DayStats {
  profileViews: number;
  postLikes: number;
  follows: number;
  messagesSent: number;
  totalMessageStarted: number;
  totalMessageReplies: number;
  inmailMessagesSent: number;
  totalInmailStarted: number;
  totalInmailReplies: number;
  connectionsSent: number;
  connectionsAccepted: number;
  messageReplyRate: number;
  inMailReplyRate: number;
  connectionAcceptanceRate: number;
}

export interface LeadList {
  id: number;
  name: string;
  totalItemsCount?: number;
  count?: number;
  listType: 'USER_LIST' | 'COMPANY_LIST';
  creationTime: string;
  campaignIds?: number[];
  isDeleted?: boolean;
  campaigns?: any;
  search?: any;
  status?: string;
}

export interface MyNetworkProfile {
  linkedin_id: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  headline: string;
  imageUrl: string;
  location: string;
  companyName: string;
  companyUrl: string;
  position: string;
  about: string;
  connections: number;
  followers: number;
  emailAddress: string;
}

export interface LinkedInAccount {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profileUrl: string;
  imageUrl?: string;
  warmupStatus: 'ACTIVE' | 'PAUSED' | 'WARMING_UP' | 'INACTIVE';
  dailyLimit: number;
  isActive: boolean;
  connectionCount?: number;
  lastActivity?: string;
}

export interface CampaignSequenceStep {
  type: 'CONNECTION_REQUEST' | 'MESSAGE' | 'INMAIL' | 'VIEW_PROFILE';
  delay: number; // days to wait
  message?: string; // supports {{variables}}
  noteText?: string; // for connection requests
}

export interface CampaignSequence {
  steps: CampaignSequenceStep[];
}

export interface CampaignSettings {
  stopOnReply?: boolean;
  stopOnAutoReply?: boolean;
  excludeInOtherCampaigns?: boolean;
  excludeHasOtherAccConversations?: boolean;
}

export interface CampaignAnalytics {
  campaignId: number;
  campaignName: string;
  totalLeads: number;
  profileViews: number;
  connectionsSent: number;
  connectionsAccepted: number;
  messagesSent: number;
  messagesReplied: number;
  connectionAcceptanceRate: number;
  messageReplyRate: number;
  startDate: string;
  endDate: string;
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

// Tool parameter schemas - Updated for working endpoints only
export interface ConversationFilters {
  linkedInAccountIds?: number[];
  campaignIds?: number[];
  searchString?: string;
  leadLinkedInId?: string;
  leadProfileUrl?: string;
  seen?: boolean;
}
