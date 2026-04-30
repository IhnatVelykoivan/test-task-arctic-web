'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from '@/lib/types';

export function LeadsFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const status = params.get('status') ?? '';

  useEffect(() => {
    setQ(params.get('q') ?? '');
  }, [params]);

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    next.delete('page');
    const qs = next.toString();
    router.push(qs ? `/leads?${qs}` : '/leads');
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q: q.trim() || null });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row gap-2 sm:items-center"
    >
      <input
        type="search"
        placeholder="Search name, email, company"
        className="input sm:max-w-xs"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="input sm:max-w-[180px]"
        value={status}
        onChange={(e) => pushParams({ status: e.target.value || null })}
      >
        <option value="">All statuses</option>
        {LEAD_STATUSES.map((s: LeadStatus) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button type="submit" className="btn-secondary">
        Search
      </button>
      {(q || status) && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.push('/leads')}
        >
          Reset
        </button>
      )}
    </form>
  );
}
