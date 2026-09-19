import React, { useState } from "react";
import { Database, Search, RefreshCw, Table, PlusCircle, CheckCircle } from "lucide-react";
import { Resource, ResourceRequest, TransferRecord, Organization } from "../types";

interface DatabaseViewerProps {
  resources: Resource[];
  requests: ResourceRequest[];
  transfers: TransferRecord[];
  organizations: Organization[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({
  resources,
  requests,
  transfers,
  organizations,
  onRefresh,
  isLoading
}) => {
  const [activeTable, setActiveTable] = useState<"resources" | "requests" | "transfers" | "organizations">("resources");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-stone-100 text-stone-700 rounded-md">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                MySQL 8.0 Relational Database Inspector
              </h2>
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Direct relational storage powering the AI matching and analytics layer. All records are updated in real-time as classifications and transfers execute.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-lg border border-stone-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Tables</span>
          </button>
        </div>

        {/* Table Selector Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-stone-100">
          <button
            onClick={() => setActiveTable("resources")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTable === "resources"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTable("requests")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTable === "requests"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTable("transfers")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTable === "transfers"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            transfers ({transfers.length})
          </button>
          <button
            onClick={() => setActiveTable("organizations")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTable === "organizations"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            organizations ({organizations.length})
          </button>
        </div>
      </div>

      {/* Table Data View */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search in ${activeTable}...`}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-stone-500 font-mono">
            Table: <strong className="text-stone-700">{activeTable}</strong>
          </span>
        </div>

        {/* Resources Table */}
        {activeTable === "resources" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-mono text-[11px]">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">description</th>
                  <th className="p-3">category</th>
                  <th className="p-3">subcategory</th>
                  <th className="p-3">quantity</th>
                  <th className="p-3">condition</th>
                  <th className="p-3">status</th>
                  <th className="p-3">org_name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {resources
                  .filter(r =>
                    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50/60">
                      <td className="p-3 font-mono font-bold text-stone-500">#{r.id}</td>
                      <td className="p-3 font-medium text-stone-900 max-w-xs truncate">{r.description}</td>
                      <td className="p-3 text-stone-700">{r.category}</td>
                      <td className="p-3 text-stone-700">{r.subcategory}</td>
                      <td className="p-3 font-bold font-mono text-blue-600">{r.quantity}</td>
                      <td className="p-3 text-stone-600">{r.condition}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            r.status === "AVAILABLE"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "TRANSFERRED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-600">{r.org_name || `Org #${r.organization_id}`}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Requests Table */}
        {activeTable === "requests" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-mono text-[11px]">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">description</th>
                  <th className="p-3">category</th>
                  <th className="p-3">subcategory</th>
                  <th className="p-3">quantity</th>
                  <th className="p-3">urgency</th>
                  <th className="p-3">deadline</th>
                  <th className="p-3">status</th>
                  <th className="p-3">org_name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {requests
                  .filter(req =>
                    req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((req) => (
                    <tr key={req.id} className="hover:bg-stone-50/60">
                      <td className="p-3 font-mono font-bold text-stone-500">#{req.id}</td>
                      <td className="p-3 font-medium text-stone-900 max-w-xs truncate">{req.description}</td>
                      <td className="p-3 text-stone-700">{req.category}</td>
                      <td className="p-3 text-stone-700">{req.subcategory}</td>
                      <td className="p-3 font-bold font-mono text-amber-600">{req.quantity}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            req.urgency === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : req.urgency === "MEDIUM"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>
                      <td className="p-3 text-stone-600 font-mono">{req.deadline || "—"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            req.status === "FULFILLED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-600">{req.org_name || `Org #${req.organization_id}`}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transfers Table */}
        {activeTable === "transfers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-mono text-[11px]">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">quantity</th>
                  <th className="p-3">donor_org</th>
                  <th className="p-3">recipient_org</th>
                  <th className="p-3">status</th>
                  <th className="p-3">transfer_date</th>
                  <th className="p-3">notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/60">
                    <td className="p-3 font-mono font-bold text-stone-500">#{t.id}</td>
                    <td className="p-3 font-bold font-mono text-emerald-600">{t.quantity} units</td>
                    <td className="p-3 font-medium text-stone-800">{t.donor_org || `Res #${t.resource_id}`}</td>
                    <td className="p-3 font-medium text-stone-800">{t.recipient_org || `Req #${t.request_id}`}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-stone-500 font-mono">{t.transfer_date}</td>
                    <td className="p-3 text-stone-600 max-w-xs truncate">{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Organizations Table */}
        {activeTable === "organizations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-mono text-[11px]">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">name</th>
                  <th className="p-3">type</th>
                  <th className="p-3">location</th>
                  <th className="p-3">contact_email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-stone-50/60">
                    <td className="p-3 font-mono font-bold text-stone-500">#{org.id}</td>
                    <td className="p-3 font-bold text-stone-900">{org.name}</td>
                    <td className="p-3 text-stone-700">{org.type}</td>
                    <td className="p-3 text-stone-600">{org.location}</td>
                    <td className="p-3 text-blue-600 font-mono">{org.contact_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
