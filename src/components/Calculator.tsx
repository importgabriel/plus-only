"use client";

// Calculator — main orchestrator for the addition-only calculator.
//
// Responsibilities:
//  • Manages two number inputs (a, b)
//  • POSTs to /api/add and displays the result
//  • GETs /api/add on mount and after each addition to refresh history
//  • Renders HistoryList with live data

import { useState, useEffect, useCallback, useRef } from "react";
import HistoryList from "@/components/HistoryList";
import type { AddRequest, AddResponse, HistoryResponse } from "@/types/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InputField = "a" | "b";

interface FormState {
  a: string;
  b: string;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Helper: safe fetch wrapper that returns { data } | { error }
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      return { data: null, error: `Request failed (${res.status}): ${text}` };
    }
    const data: T = await res.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Calculator() {
  // Form inputs (kept as strings to preserve what the user typed)
  const [form, setForm] = useState<FormState>({ a: "", b: "" });

  // Result of the most recent addition
  const [result, setResult] = useState<AddResponse | null>(null);

  // Addition in-flight state
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // History state
  const [historyState, setHistoryState] = useState<AsyncState<AddResponse[]>>({
    data: null,
    loading: true,
    error: null,
  });

  // Prevent fetch-on-unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch history
  // ---------------------------------------------------------------------------

  const fetchHistory = useCallback(async () => {
    setHistoryState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await apiFetch<HistoryResponse>("/api/add");

    if (!mountedRef.current) return;

    if (result.error) {
      setHistoryState({ data: null, loading: false, error: result.error });
    } else {
      setHistoryState({
        data: result.data.history,
        loading: false,
        error: null,
      });
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ---------------------------------------------------------------------------
  // Handle input change
  // ---------------------------------------------------------------------------

  function handleChange(field: InputField, raw: string) {
    // Allow empty string, minus sign, decimals — let parseFloat validate later
    setForm((prev) => ({ ...prev, [field]: raw }));
  }

  // ---------------------------------------------------------------------------
  // Handle add
  // ---------------------------------------------------------------------------

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError(null);

    const a = parseFloat(form.a);
    const b = parseFloat(form.b);

    if (!isFinite(a)) {
      setAddError("Please enter a valid number for A.");
      return;
    }
    if (!isFinite(b)) {
      setAddError("Please enter a valid number for B.");
      return;
    }

    setAdding(true);
    const body: AddRequest = { a, b };

    const res = await apiFetch<AddResponse>("/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!mountedRef.current) return;
    setAdding(false);

    if (res.error) {
      setAddError(res.error);
      return;
    }

    setResult(res.data);
    // Refresh history after a successful addition
    fetchHistory();
  }

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const inputA = parseFloat(form.a);
  const inputB = parseFloat(form.b);
  const bothValid = isFinite(inputA) && form.a !== "" && isFinite(inputB) && form.b !== "";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {/* Card */}
      <div className="w-full rounded-2xl bg-white shadow-md border border-slate-100 p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800">
          Addition Calculator
        </h1>

        <form onSubmit={handleAdd} noValidate className="flex flex-col gap-4">
          {/* Inputs row */}
          <div className="flex items-center gap-3">
            {/* Input A */}
            <div className="flex-1">
              <label
                htmlFor="input-a"
                className="mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wide"
              >
                A
              </label>
              <input
                id="input-a"
                type="number"
                value={form.a}
                onChange={(e) => handleChange("a", e.target.value)}
                placeholder="0"
                aria-label="First number"
                className={[
                  "w-full rounded-xl border bg-slate-50 px-4 py-3 text-right font-mono text-lg",
                  "text-slate-800 placeholder-slate-300",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent",
                  "transition-colors",
                  form.a !== "" && !isFinite(parseFloat(form.a))
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200",
                ].join(" ")}
              />
            </div>

            {/* Plus sign */}
            <span
              className="mt-5 select-none text-2xl font-light text-slate-400"
              aria-hidden="true"
            >
              +
            </span>

            {/* Input B */}
            <div className="flex-1">
              <label
                htmlFor="input-b"
                className="mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wide"
              >
                B
              </label>
              <input
                id="input-b"
                type="number"
                value={form.b}
                onChange={(e) => handleChange("b", e.target.value)}
                placeholder="0"
                aria-label="Second number"
                className={[
                  "w-full rounded-xl border bg-slate-50 px-4 py-3 text-right font-mono text-lg",
                  "text-slate-800 placeholder-slate-300",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent",
                  "transition-colors",
                  form.b !== "" && !isFinite(parseFloat(form.b))
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200",
                ].join(" ")}
              />
            </div>
          </div>

          {/* Add button */}
          <button
            type="submit"
            disabled={adding || !bothValid}
            aria-busy={adding}
            className={[
              "mt-1 w-full rounded-xl px-6 py-3 font-semibold text-white",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",
              adding || !bothValid
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] shadow-sm",
            ].join(" ")}
          >
            {adding ? "Adding…" : "Add"}
          </button>

          {/* Addition error */}
          {addError && (
            <p role="alert" className="text-sm text-red-600 mt-1">
              {addError}
            </p>
          )}
        </form>

        {/* Result display */}
        {result && !adding && (
          <div
            role="region"
            aria-live="polite"
            aria-label="Addition result"
            className="mt-6 flex flex-col items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-100 px-6 py-4"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-indigo-400">
              Result
            </span>
            <span className="font-mono text-4xl font-bold text-indigo-700">
              {result.sum}
            </span>
          </div>
        )}
      </div>

      {/* History */}
      <HistoryList
        history={historyState.data ?? []}
        loading={historyState.loading}
        error={historyState.error}
      />
    </div>
  );
}
