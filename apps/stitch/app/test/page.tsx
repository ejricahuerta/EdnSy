"use client";

import { useCallback, useEffect, useState } from "react";

type SampleMeta = { id: string; label: string; file: string };

type TestApiOk = {
  sampleId?: string;
  sampleLabel?: string;
  source?: string;
  projectId?: string;
  screenId?: string;
  htmlUrl?: string;
  html?: string;
};

export default function TestPreviewPage() {
  const [samples, setSamples] = useState<SampleMeta[]>([]);
  const [samplesError, setSamplesError] = useState<string | null>(null);
  const [randomize, setRandomize] = useState(true);
  const [lockedSampleId, setLockedSampleId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<TestApiOk | null>(null);
  const [htmlSrcDoc, setHtmlSrcDoc] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/test/samples");
        const data = (await res.json()) as { samples?: SampleMeta[]; error?: string };
        if (!res.ok) {
          if (!cancelled) {
            setSamplesError(data.error ?? `HTTP ${res.status}`);
          }
          return;
        }
        if (!cancelled && data.samples?.length) {
          setSamples(data.samples);
          setLockedSampleId((id) => id || data.samples![0]!.id);
        }
      } catch (e) {
        if (!cancelled) {
          setSamplesError(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMeta(null);
    setHtmlSrcDoc(null);
    setIframeSrc(null);

    const body =
      randomize || !lockedSampleId
        ? undefined
        : JSON.stringify({ sampleId: lockedSampleId });

    try {
      const res = await fetch("/api/test", {
        method: "POST",
        ...(body !== undefined
          ? {
              headers: { "Content-Type": "application/json" },
              body,
            }
          : {}),
      });
      const data = (await res.json()) as TestApiOk & { error?: string; code?: string };

      if (!res.ok) {
        const msg =
          data.error ??
          (data.code ? `${data.code}` : null) ??
          `Request failed (${res.status})`;
        setError(msg);
        return;
      }

      setMeta({
        sampleId: data.sampleId,
        sampleLabel: data.sampleLabel,
        source: data.source,
        projectId: data.projectId,
        screenId: data.screenId,
        htmlUrl: data.htmlUrl,
      });

      if (typeof data.html === "string" && data.html.length > 0) {
        setHtmlSrcDoc(data.html);
        return;
      }

      if (typeof data.htmlUrl === "string" && data.htmlUrl.length > 0) {
        try {
          const htmlRes = await fetch(data.htmlUrl);
          if (htmlRes.ok) {
            const text = await htmlRes.text();
            setHtmlSrcDoc(text);
            return;
          }
        } catch {
          // Fall back to loading the URL directly in the iframe.
        }
        setIframeSrc(data.htmlUrl);
        return;
      }

      setError("Response had no html or htmlUrl to display.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [randomize, lockedSampleId]);

  const hasPreview = htmlSrcDoc !== null || iframeSrc !== null;

  return (
    <div className="flex min-h-full flex-1 flex-col gap-4 p-6">
      <header className="flex flex-col gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold tracking-tight">
          Stitch test preview
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Calls <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">POST /api/test</code>{" "}
          with the docs one-liner plus one of several JSON payloads under{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">docs/references/</code>
          . Payloads are
          listed via{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">GET /api/test/samples</code>
          . With <strong>Random sample</strong> on, each run asks the server to pick a payload at random.
          Successful generations count toward a <strong>daily quota</strong> (default 100 per UTC day, shared with{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">POST /create</code>
          ); see <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">docs/README.md</code>.
        </p>

        {samplesError ? (
          <p className="text-sm text-amber-700 dark:text-amber-400" role="status">
            Could not load sample list: {samplesError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={randomize}
              onChange={(e) => setRandomize(e.target.checked)}
              className="rounded border-zinc-400"
            />
            Random sample each run
          </label>

          {!randomize && samples.length > 0 ? (
            <label className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Payload</span>
              <select
                value={lockedSampleId}
                onChange={(e) => setLockedSampleId(e.target.value)}
                className="max-w-xs rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              >
                {samples.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.id})
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            onClick={runTest}
            disabled={loading || (!randomize && !lockedSampleId)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Running…" : "Run test"}
          </button>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        {meta && !error ? (
          <dl className="grid gap-1 text-xs text-zinc-500 dark:text-zinc-500 sm:grid-cols-2">
            {meta.sampleLabel ? (
              <div className="sm:col-span-2">
                <dt className="inline font-medium text-zinc-600 dark:text-zinc-400">
                  Sample{" "}
                </dt>
                <dd className="inline">
                  {meta.sampleLabel}
                  {meta.sampleId ? (
                    <span className="ml-1 font-mono text-[11px]">({meta.sampleId})</span>
                  ) : null}
                </dd>
              </div>
            ) : null}
            {meta.source ? (
              <div className="sm:col-span-2">
                <dt className="inline font-medium text-zinc-600 dark:text-zinc-400">
                  Source{" "}
                </dt>
                <dd className="inline">{meta.source}</dd>
              </div>
            ) : null}
            {meta.projectId ? (
              <div>
                <dt className="inline font-medium text-zinc-600 dark:text-zinc-400">
                  Project{" "}
                </dt>
                <dd className="inline font-mono">{meta.projectId}</dd>
              </div>
            ) : null}
            {meta.screenId ? (
              <div>
                <dt className="inline font-medium text-zinc-600 dark:text-zinc-400">
                  Screen{" "}
                </dt>
                <dd className="inline font-mono">{meta.screenId}</dd>
              </div>
            ) : null}
            {meta.htmlUrl && !htmlSrcDoc ? (
              <div className="sm:col-span-2">
                <dt className="inline font-medium text-zinc-600 dark:text-zinc-400">
                  htmlUrl{" "}
                </dt>
                <dd className="inline break-all font-mono text-[11px]">
                  {meta.htmlUrl}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </header>

      {!hasPreview && !loading && !error ? (
        <p className="text-sm text-zinc-500">
          Click <strong>Run test</strong> to generate and preview HTML.
        </p>
      ) : null}

      {hasPreview ? (
        <iframe
          title="Generated landing page preview"
          className="min-h-[70vh] w-full flex-1 rounded-lg border border-zinc-300 bg-white dark:border-zinc-700"
          {...(htmlSrcDoc !== null
            ? { srcDoc: htmlSrcDoc }
            : iframeSrc !== null
              ? { src: iframeSrc }
              : {})}
        />
      ) : null}
    </div>
  );
}
