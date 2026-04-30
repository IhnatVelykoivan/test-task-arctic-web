'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Props {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: Props) {
  const params = useSearchParams();

  function pageHref(p: number): string {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(p));
    return `/leads?${next.toString()}`;
  }

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={pageHref(prev)}
          aria-disabled={page <= 1}
          className={`btn-secondary ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
        >
          ← Prev
        </Link>
        <Link
          href={pageHref(next)}
          aria-disabled={page >= totalPages}
          className={`btn-secondary ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
