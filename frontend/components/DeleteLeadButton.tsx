'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';

interface Props {
  id: string;
  name: string;
}

export function DeleteLeadButton({ id, name }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete lead "${name}"? Comments will be removed too.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.deleteLead(id);
      router.refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[delete lead]', err);
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? `Failed: ${err.message}`
            : 'Failed to delete';
      setError(message);
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
        aria-label={`Delete ${name}`}
      >
        {busy ? 'Deleting…' : 'Delete'}
      </button>
      {error && (
        <span role="alert" className="text-xs text-rose-600">
          {error}
        </span>
      )}
    </span>
  );
}
