import type {
  Comment,
  CreateLeadInput,
  Lead,
  LeadsQuery,
  PaginatedLeads,
  UpdateLeadInput,
} from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const body = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message = extractMessage(body) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const maybe = body as { message?: unknown };
  if (typeof maybe.message === 'string') return maybe.message;
  if (Array.isArray(maybe.message)) return maybe.message.join(', ');
  return null;
}

function buildQuery(query: LeadsQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  if (query.q && query.q.trim()) params.set('q', query.q.trim());
  if (query.sort) params.set('sort', query.sort);
  if (query.order) params.set('order', query.order);
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const api = {
  listLeads: (query: LeadsQuery = {}) =>
    request<PaginatedLeads>(`/leads${buildQuery(query)}`),

  getLead: (id: string) => request<Lead>(`/leads/${id}`),

  createLead: (input: CreateLeadInput) =>
    request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateLead: (id: string, input: UpdateLeadInput) =>
    request<Lead>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deleteLead: (id: string) =>
    request<void>(`/leads/${id}`, { method: 'DELETE' }),

  listComments: (leadId: string) =>
    request<Comment[]>(`/leads/${leadId}/comments`),

  addComment: (leadId: string, text: string) =>
    request<Comment>(`/leads/${leadId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};
