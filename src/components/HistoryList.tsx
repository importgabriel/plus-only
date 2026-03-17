// HistoryList — pure display component for past additions.
// Receives data from Calculator; owns no fetch logic.

import type { AddResponse } from "@/types/api";

interface HistoryListProps {
  history: AddResponse[];
  loading: boolean;
  error: string | null;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export default function HistoryList({ history, loading, error }: HistoryListProps) {
  return (
    <section aria-labelledby="history-heading" className="w-full max-w-md">
      <h2
        id="history-heading"
        className="mb-3 text-lg font-semibold text-slate-700 tracking-tight"
      >
        History
      </h2>

      {/* Loading skeleton */}
      {loading && (
        <ul aria-busy="true" className="space-y-2" role="status">
          {[1, 2, 3].map((n) => (
            <li
              key={n}
              className="h-12 rounded-xl bg-slate-100 animate-pulse"
              aria-hidden="true"
            />
          ))}
          <span className="sr-only">Loading history…</span>
        </ul>
      )}

      {/* Error state */}
      {!loading && error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && history.length === 0 && (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
          No additions yet. Try adding two numbers above!
        </p>
      )}

      {/* History rows */}
      {!loading && !error && history.length > 0 && (
        <ol
          className="space-y-2"
          aria-label={`${history.length} past addition${history.length === 1 ? "" : "s"}`}
        >
          {history.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
            >
              <span className="font-mono text-sm text-slate-700">
                {entry.sum}&nbsp;
                <span className="text-xs text-slate-400">(result)</span>
              </span>
              <time
                dateTime={entry.created_at}
                className="text-xs text-slate-400 tabular-nums"
              >
                {formatDate(entry.created_at)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
