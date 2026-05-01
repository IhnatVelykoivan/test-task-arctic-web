import Link from 'next/link';
import { CreateLeadForm } from '@/components/CreateLeadForm';
import { DeleteLeadButton } from '@/components/DeleteLeadButton';
import { LeadsFilters } from '@/components/LeadsFilters';
import { Pagination } from '@/components/Pagination';
import { StatusBadge } from '@/components/StatusBadge';
import { api, ApiError } from '@/lib/api';
import {
  LEAD_STATUSES,
  type LeadStatus,
  type LeadsQuery,
  type SortField,
  type SortOrder,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseQuery(
  raw: Record<string, string | string[] | undefined>,
): LeadsQuery {
  const page = Number(asString(raw.page));
  const limit = Number(asString(raw.limit));
  const statusRaw = asString(raw.status);
  const sortRaw = asString(raw.sort);
  const orderRaw = asString(raw.order);

  const status =
    statusRaw && (LEAD_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as LeadStatus)
      : undefined;

  const sort: SortField | undefined =
    sortRaw === 'updatedAt' || sortRaw === 'createdAt' ? sortRaw : undefined;
  const order: SortOrder | undefined =
    orderRaw === 'asc' || orderRaw === 'desc' ? orderRaw : undefined;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
    status,
    q: asString(raw.q),
    sort,
    order,
  };
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const query = parseQuery(raw);

  let data: Awaited<ReturnType<typeof api.listLeads>> | null = null;
  let errorMessage: string | null = null;
  try {
    data = await api.listLeads(query);
  } catch (err) {
    errorMessage =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load leads';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-slate-600">
            Search, filter, and manage your leads.
          </p>
        </div>
        <CreateLeadForm />
      </div>

      <LeadsFilters />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {errorMessage}
        </div>
      )}

      {!errorMessage && data && data.items.length === 0 && (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No leads match the current filters.
        </div>
      )}

      {!errorMessage && data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>Name</Th>
                <Th>Company</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th className="text-right">Value</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.items.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {lead.company ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {lead.email ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {lead.value === null ? '—' : formatCurrency(lead.value)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteLeadButton id={lead.id} name={lead.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!errorMessage && data && data.meta.totalPages > 1 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
        />
      )}
    </div>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(v);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
