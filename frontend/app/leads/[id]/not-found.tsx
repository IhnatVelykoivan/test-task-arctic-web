import Link from 'next/link';

export default function LeadNotFound() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold">Lead not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The lead you are looking for does not exist or has been deleted.
      </p>
      <Link
        href="/leads"
        className="btn-primary mt-4 inline-flex"
      >
        Back to leads
      </Link>
    </div>
  );
}
