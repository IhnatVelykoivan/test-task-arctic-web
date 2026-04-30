'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type CreateLeadInput,
  type LeadStatus,
} from '@/lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateLeadForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateLeadInput>({
    name: '',
    email: '',
    company: '',
    status: 'NEW',
    value: undefined,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function update<K extends keyof CreateLeadInput>(
    key: K,
    value: CreateLeadInput[K],
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

    const payload: CreateLeadInput = {
      name: form.name.trim(),
      status: form.status,
    };
    if (form.email?.trim()) payload.email = form.email.trim();
    if (form.company?.trim()) payload.company = form.company.trim();
    if (form.notes?.trim()) payload.notes = form.notes.trim();
    if (form.value !== undefined && !Number.isNaN(form.value)) {
      payload.value = form.value;
    }

    setSubmitting(true);
    try {
      await api.createLead(payload);
      setForm({
        name: '',
        email: '',
        company: '',
        status: 'NEW',
        value: undefined,
        notes: '',
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to create lead',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        + New lead
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Create lead</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name *">
          <input
            className="input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className="input"
            value={form.email ?? ''}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label="Company">
          <input
            className="input"
            value={form.company ?? ''}
            onChange={(e) => update('company', e.target.value)}
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
        <Field label="Value">
          <input
            type="number"
            step="0.01"
            className="input"
            value={form.value ?? ''}
            onChange={(e) =>
              update(
                'value',
                e.target.value === '' ? undefined : Number(e.target.value),
              )
            }
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          className="input min-h-[72px]"
          value={form.notes ?? ''}
          onChange={(e) => update('notes', e.target.value)}
        />
      </Field>

      {error && (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating…' : 'Create lead'}
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
