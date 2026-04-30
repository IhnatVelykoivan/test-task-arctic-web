import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommentsSection } from '@/components/CommentsSection';
import { EditLeadForm } from '@/components/EditLeadForm';
import { StatusBadge } from '@/components/StatusBadge';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const lead = await api.getLead(id);

    return (
      <div className="space-y-8">
        <div>
          <Link
            href="/leads"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to leads
          </Link>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">{lead.name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Created {new Date(lead.createdAt).toLocaleString()} · Updated{' '}
            {new Date(lead.updatedAt).toLocaleString()}
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Edit lead</h2>
          <EditLeadForm lead={lead} />
        </section>

        <CommentsSection leadId={lead.id} />
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load lead';
    return (
      <div
        role="alert"
        className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
      >
        {message}
      </div>
    );
  }
}
