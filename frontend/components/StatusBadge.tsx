import { LEAD_STATUS_LABELS, type LeadStatus } from '@/lib/types';

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'bg-slate-100 text-slate-700 ring-slate-200',
  CONTACTED: 'bg-blue-50 text-blue-700 ring-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-200',
  WON: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  LOST: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
