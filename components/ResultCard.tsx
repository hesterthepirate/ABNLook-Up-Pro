"use client";
import { CheckCircle2, XCircle, Building2 } from "lucide-react";

interface Props {
  abn: string;
  entityName: string;
  abnStatus: string;
  gstRegistered: string | null;
  gstCancelledDate: string | null;
}

export default function ResultCard({ abn, entityName, abnStatus, gstRegistered, gstCancelledDate }: Props) {
  const isActive = abnStatus?.toLowerCase() === "active";
  const fmt = (a: string) => a.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-4 max-w-lg mx-auto">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entity Name</p>
          <h3 className="text-xl font-bold text-gray-900">{entityName}</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ABN</p>
          <p className="font-mono text-gray-800">{fmt(abn)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {abnStatus}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">GST Registered</p>
          <p className="text-sm text-gray-700">{gstRegistered || "Not registered"}</p>
        </div>
        {gstCancelledDate && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">GST Cancelled</p>
            <p className="text-sm text-red-600">{gstCancelledDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}
