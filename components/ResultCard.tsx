"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Hash,
  Tag,
  Copy,
  Check,
} from "lucide-react";

interface ResultCardProps {
  abn: string;
  entityName: string;
  abnStatus: string;
  gstRegistered: boolean;
  gstCancelledDate?: string;
}

function formatAbn(abn: string): string {
  const clean = abn.replace(/\s/g, "");
  if (clean.length !== 11) return abn;
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 11)}`;
}

export default function ResultCard({
  abn,
  entityName,
  abnStatus,
  gstRegistered,
  gstCancelledDate,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const isActive = abnStatus?.toLowerCase() === "active";
  const formattedAbn = formatAbn(abn);

  function handleCopy() {
    navigator.clipboard
      .writeText(formattedAbn)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback: silently fail — clipboard not available
      });
  }

  return (
    <div className="fade-in card-shadow rounded-2xl bg-white overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                Entity Name
              </p>
              <h2 className="text-xl font-bold text-slate-900 leading-tight truncate">
                {entityName}
              </h2>
            </div>
          </div>
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-red-50 text-red-700 ring-1 ring-red-200"
            }`}
          >
            {isActive ? (
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            ) : (
              <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            )}
            {abnStatus}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ABN */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              ABN
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-mono font-semibold text-slate-800 tracking-wide">
              {formattedAbn}
            </span>
            <button
              onClick={handleCopy}
              aria-label="Copy ABN to clipboard"
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                copied
                  ? "bg-green-100 text-green-600"
                  : "bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 ring-1 ring-slate-200"
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              ) : (
                <Copy className="w-3.5 h-3.5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* GST */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              GST
            </span>
          </div>
          {gstRegistered ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className="w-4 h-4 text-green-600"
                strokeWidth={2}
              />
              <span className="text-sm font-semibold text-green-700">
                Registered
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <span className="text-sm font-semibold text-slate-500">
                Not registered
              </span>
            </div>
          )}
          {gstCancelledDate && (
            <p className="text-xs text-slate-400 mt-1">
              Cancelled {gstCancelledDate}
            </p>
          )}
        </div>

        {/* Entity type placeholder — can be wired up when API returns it */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2
              className="w-3.5 h-3.5 text-slate-400"
              strokeWidth={2}
            />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              ABN Status
            </span>
          </div>
          <span
            className={`text-sm font-semibold ${
              isActive ? "text-green-700" : "text-red-600"
            }`}
          >
            {abnStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
