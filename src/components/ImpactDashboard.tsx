import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, CheckCircle2, Clock, Users, Package, Award, Sparkles, Filter, RefreshCw, BarChart2, FileText
} from "lucide-react";
import { AnalyticsSuite, Resource, ResourceRequest, TransferRecord, Organization } from "../types";

interface ImpactDashboardProps {
  analytics: AnalyticsSuite | null;
  resources: Resource[];
  requests: ResourceRequest[];
  transfers: TransferRecord[];
  organizations: Organization[];
  onRefresh: () => void;
  isLoading: boolean;
}

const COLORS = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DC2626", "#0891B2"];

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  analytics,
  resources,
  requests,
  transfers,
  organizations,
  onRefresh,
  isLoading
}) => {
  const [activeVizMode, setActiveVizMode] = useState<"interactive" | "matplotlib">("interactive");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-stone-200">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-stone-700">Loading comprehensive analytics data...</p>
      </div>
    );
  }

  const { resourceStatistics, successRate, categoryAnalysis, transferTrends, organizationActivity, charts } = analytics;

  // Prepare Interactive Recharts Data
  const categoryChartData = categoryAnalysis.categories.map((cat, i) => ({
    name: cat,
    Supply: categoryAnalysis.supply[i] || 0,
    Demand: categoryAnalysis.demand[i] || 0,
  }));

  const trendChartData = transferTrends.months.map((m, i) => ({
    month: m,
    Units: transferTrends.monthlyUnits[i] || 0,
  }));

  const pieData = categoryAnalysis.categories.map((cat, i) => ({
    name: cat,
    value: categoryAnalysis.supply[i] || 0,
  }));

  // Filtered resources display
  const filteredResources = selectedCategoryFilter === "ALL"
    ? resources
    : resources.filter(r => r.category === selectedCategoryFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Impact & Allocation Analytics Dashboard
              </h2>
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Real-time KPIs, multi-dimensional category allocation analysis, and monthly transfer trends powered by Python Pandas.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Viz Mode Toggle */}
            <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs font-medium">
              <button
                onClick={() => setActiveVizMode("interactive")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeVizMode === "interactive"
                    ? "bg-white text-stone-900 shadow-xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Interactive Recharts
              </button>
              <button
                onClick={() => setActiveVizMode("matplotlib")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeVizMode === "matplotlib"
                    ? "bg-white text-stone-900 shadow-xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Python Matplotlib SVGs
              </button>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-200 transition cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 5 High-Impact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Total Resources */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Total Resources</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {resourceStatistics.totalUnits}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {resourceStatistics.availableUnits} available • {resourceStatistics.totalResourcesCount} records
          </p>
        </div>

        {/* KPI 2: Successful Transfers */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Successful Transfers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {resourceStatistics.transferredUnits}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {transferTrends.totalTransfersCount} completed transfers
          </p>
        </div>

        {/* KPI 3: Pending Requests */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">
            {successRate.pendingRequests}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Awaiting matching allocation
          </p>
        </div>

        {/* KPI 4: Participating Orgs */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Organizations</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 font-mono">
            {organizations.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Active donors & recipients
          </p>
        </div>

        {/* KPI 5: Success Rate */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Fulfillment Rate</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">
            {successRate.ratePercent}%
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {successRate.fulfilledRequests} of {successRate.totalRequests} fulfilled
          </p>
        </div>
      </div>

      {/* Visualizations Section */}
      {activeVizMode === "interactive" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Supply vs Demand by Category */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Resource Inventory & Demand by Category</h3>
                <p className="text-xs text-stone-500">Compares available supply vs active requests</p>
              </div>
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Units Count
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716C" }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: "#78716C" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1C1917", borderRadius: "8px", border: "none", color: "#F5F5F4", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Supply" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Demand" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Transfer Trends */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Monthly Transfer Trends</h3>
                <p className="text-xs text-stone-500">Historical completed resource transfers</p>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Timeline
              </span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716C" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#78716C" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1C1917", borderRadius: "8px", border: "none", color: "#F5F5F4", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="Units"
                    name="Units Transferred"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ fill: "#059669", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Python Matplotlib Generated Vector Charts */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Python / Matplotlib: Category Distribution</h3>
                <p className="text-xs text-stone-500">Rendered via Python analytics engine script</p>
              </div>
              <span className="text-[11px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Matplotlib SVG
              </span>
            </div>
            <div
              className="w-full h-auto flex items-center justify-center p-2 bg-stone-50 rounded-lg border border-stone-200"
              dangerouslySetInnerHTML={{ __html: charts.categoryChartSvg }}
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Python / Matplotlib: Monthly Trends</h3>
                <p className="text-xs text-stone-500">Time-series aggregation with Pandas</p>
              </div>
              <span className="text-[11px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Matplotlib SVG
              </span>
            </div>
            <div
              className="w-full h-auto flex items-center justify-center p-2 bg-stone-50 rounded-lg border border-stone-200"
              dangerouslySetInnerHTML={{ __html: charts.trendsChartSvg }}
            />
          </div>
        </div>
      )}

      {/* Organization Activity Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Organization Participation & Contributions</h3>
            <p className="text-xs text-stone-500">Activity rankings derived from relational inventory logs</p>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {organizationActivity.length} Active Partners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3.5 font-semibold">Rank</th>
                <th className="p-3.5 font-semibold">Organization</th>
                <th className="p-3.5 font-semibold">Units Donated</th>
                <th className="p-3.5 font-semibold">Resources Listed</th>
                <th className="p-3.5 font-semibold">Requests Placed</th>
                <th className="p-3.5 font-semibold">Community Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {organizationActivity.map((org, index) => (
                <tr key={org.organizationId} className="hover:bg-stone-50/70 transition">
                  <td className="p-3.5 font-bold font-mono text-stone-500">#{index + 1}</td>
                  <td className="p-3.5 font-medium text-stone-900">{org.organizationName}</td>
                  <td className="p-3.5 font-bold text-blue-600 font-mono">{org.unitsDonated} units</td>
                  <td className="p-3.5 text-stone-600">{org.resourcesDonated} items</td>
                  <td className="p-3.5 text-stone-600">{org.requestsPlaced} requests</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {org.unitsDonated > 100 ? "Leading Contributor" : org.unitsDonated > 0 ? "Active Donor" : "Community Recipient"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
