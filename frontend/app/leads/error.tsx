'use client';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LeadsError({ error, reset }: Props) {
  return (
    <div
      role="alert"
      className="rounded-md border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700"
    >
      <p className="font-semibold">Something went wrong loading leads.</p>
      <p className="mt-1">{error.message}</p>
      <button onClick={reset} className="btn-secondary mt-4">
        Try again
      </button>
    </div>
  );
}
