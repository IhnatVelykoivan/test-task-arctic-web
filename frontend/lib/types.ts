export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'IN_PROGRESS'
  | 'WON'
  | 'LOST';

export const LEAD_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'WON',
  'LOST',
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  IN_PROGRESS: 'In progress',
  WON: 'Won',
  LOST: 'Lost',
};

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: LeadStatus;
  value: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  leadId: string;
  text: string;
  createdAt: string;
}

export interface PaginatedLeads {
  items: Lead[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type SortField = 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface LeadsQuery {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  q?: string;
  sort?: SortField;
  order?: SortOrder;
}

export interface CreateLeadInput {
  name: string;
  email?: string;
  company?: string;
  status?: LeadStatus;
  value?: number;
  notes?: string;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;
