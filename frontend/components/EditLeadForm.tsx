'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type Lead,
  type LeadStatus,
  type UpdateLeadInput,
} from '@/lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  lead: Lead;
}

export function EditLeadForm({ lead }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: lead.name,
    email: lead.email ?? '',
    company: lead.company ?? '',
    status: lead.status,
    value: lead.value ?? '',
    notes: lead.notes ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (form.email && !EMAIL_RE.test(form.email)) {
      setError('Email is not valid');
      return;
    }

    const payload: UpdateLeadInput = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      company: form.company.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
      value:
        form.value === '' || form.value === null
          ? undefined
          : Number(form.value),
    };

    setSubmitting(true);
    try {
      await api.updateLead(lead.id, payload);
      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to update lead',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteLead(lead.id);
      router.push('/leads');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to delete lead',
      );
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name *">
          <input
            className="input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </Field>
        <Field label="Status">
          <select
            className="input"
            value={form.status}
            onChange={(e) => update('status', e.target.value as LeadStatus)}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Email">
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label="Company">
          <input
            className="input"
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
          />
        </Field>
        <Field label="Value">
          <input
            type="number"
            step="0.01"
            className="input"
            value={form.value}
            onChange={(e) => update('value', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          className="input min-h-[100px]"
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
      {savedAt && !error && (
        <p className="text-sm text-emerald-600">Saved.</p>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? 'Deleting…' : 'Delete lead'}
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-slate-700">{label}</span>
      {children}
    </label>
  );
}
