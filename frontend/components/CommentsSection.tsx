'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Comment } from '@/lib/types';

interface Props {
  leadId: string;
}

export function CommentsSection({ leadId }: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    api
      .listComments(leadId)
      .then((items) => {
        if (!cancelled) setComments(items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setComments([]);
        setLoadError(
          err instanceof ApiError ? err.message : 'Failed to load comments',
        );
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setSubmitError('Comment cannot be empty');
      return;
    }
    if (trimmed.length > 500) {
      setSubmitError('Comment must be 500 characters or fewer');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.addComment(leadId, trimmed);
      setComments((prev) => (prev ? [created, ...prev] : [created]));
      setText('');
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Failed to add comment',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Comments</h2>

      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          className="input min-h-[80px]"
          placeholder="Write a comment (1–500 characters)…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {text.length}/500
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
        {submitError && (
          <p role="alert" className="text-sm text-rose-600">
            {submitError}
          </p>
        )}
      </form>

      {loadError && (
        <p role="alert" className="text-sm text-rose-600">
          {loadError}
        </p>
      )}

      {comments === null && !loadError && (
        <p className="text-sm text-slate-500">Loading comments…</p>
      )}

      {comments && comments.length === 0 && !loadError && (
        <p className="text-sm text-slate-500">No comments yet.</p>
      )}

      {comments && comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm"
            >
              <p className="whitespace-pre-wrap text-slate-800">{c.text}</p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
