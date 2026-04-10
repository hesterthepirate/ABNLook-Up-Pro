"use client";

import { useState } from "react";
import { Search, Zap, FileText, Download, AlertCircle } from "lucide-react";
import ResultCard from "@/components/ResultCard";

interface LookupResult {
  abn: string;
  entityName: string;
  abnStatus: string;
  gstRegistered: boolean;
  gstCancelledDate?: string;
  error?: string;
}

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Results in under a second. No captchas, no waiting, no nonsense.",
  },
  {
    icon: FileText,
    title: "Clean Results",
    description:
      "Status, GST registration, entity name — everything you need, nothing you don't.",
  },
  {
    icon: Download,
    title: "Export to CSV",
    description: "Bulk lookups and CSV export coming soon for Pro subscribers.",
  },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const abn = query.replace(/\s/g, "");
    if (!abn) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/lookup?abn=${encodeURIComponent(abn)}`);
      const data: LookupResult = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ring-blue-200 mb-6">
            <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
            Faster than the ABR
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Look up any Australian
            <br />
            <span className="text-blue-600">business in seconds</span>
          </h1>

          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
            Faster than the ABR. Cleaner results. No BS.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
            <div className="flex gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter ABN (e.g. 51 824 753 556)"
                  aria-label="ABN search"
                  className="w-full pl-10 pr-4 py-3 text-sm sm:text-base bg-white border border-slate-200 rounded-xl shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                  maxLength={14}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="flex-shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results area */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center fade-in">
            <span className="spinner" aria-hidden="true" />
            <p className="text-sm text-slate-500 font-medium">
              Searching ABR...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="fade-in flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4">
            <AlertCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div>
              <p className="font-semibold text-sm">Lookup failed</p>
              <p className="text-sm mt-0.5 text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <ResultCard
            abn={result.abn}
            entityName={result.entityName}
            abnStatus={result.abnStatus}
            gstRegistered={result.gstRegistered}
            gstCancelledDate={result.gstCancelledDate}
          />
        )}
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-10">
            Why ABNLookupPro?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 card-shadow transition-shadow duration-200 hover:[box-shadow:0_1px_3px_0_rgb(0_0_0/0.06),0_8px_24px_0_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.06)]"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
