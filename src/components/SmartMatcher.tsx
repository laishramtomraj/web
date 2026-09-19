import React, { useState, useEffect } from "react";
import { Brain, ArrowRight, CheckCircle, Sliders, AlertTriangle, Send, RefreshCw, Layers, Check } from "lucide-react";
import { Resource, MatchResourceResponse, MatchRecommendation } from "../types";
import { matchResourceApi, executeTransferApi } from "../api";
import { PriorityConfigModal } from "./PriorityConfigModal";

interface SmartMatcherProps {
  resources: Resource[];
  onTransferCompleted?: () => void;
}

export const SmartMatcher: React.FC<SmartMatcherProps> = ({
  resources,
  onTransferCompleted
}) => {
  const [selectedResourceId, setSelectedResourceId] = useState<number>(1);
  const [matchData, setMatchData] = useState<MatchResourceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferringRequestId, setTransferringRequestId] = useState<number | null>(null);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  // Available resources only (status = AVAILABLE)
  const availableResources = resources.filter(r => r.status === "AVAILABLE" && r.quantity > 0);

  const fetchMatches = async (resourceId: number) => {
    setIsLoading(true);
    setError(null);
    setTransferSuccessMsg(null);
    try {
      const data = await matchResourceApi(resourceId);
      setMatchData(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate smart matches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (availableResources.length > 0) {
      const targetId = availableResources.some(r => r.id === selectedResourceId)
        ? selectedResourceId
        : availableResources[0].id;
      setSelectedResourceId(targetId);
      fetchMatches(targetId);
    }
  }, [resources]);

  const handleResourceChange = (id: number) => {
    setSelectedResourceId(id);
    fetchMatches(id);
  };

  const handleExecuteTransfer = async (rec: MatchRecommendation) => {
    if (!matchData) return;
    setTransferringRequestId(rec.requestId);
    try {
      const res = await executeTransferApi(
        matchData.resource.id,
        rec.requestId,
        Math.min(matchData.resource.quantity, rec.requestedQuantity),
        `Automated match fulfillment: ${matchData.resource.category} allocation to ${rec.organizationName}`
      );
      setTransferSuccessMsg(res.message);
      if (onTransferCompleted) onTransferCompleted();
      // Refresh current match
      setTimeout(() => {
        fetchMatches(matchData.resource.id);
      }, 500);
    } catch (err: any) {
      alert("Transfer failed: " + (err.message || String(err)));
    } finally {
      setTransferringRequestId(null);
    }
  };

  const selectedResourceObj = availableResources.find(r => r.id === selectedResourceId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Pipeline Architecture Overview */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
                <Brain className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Smart Resource-to-Request Matching
              </h2>
            </div>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl">
              Intelligent multi-stage pipeline: SQL pre-filtering isolates compatible pending requests, then multi-factor scoring (category, subcategory, quantity, urgency, and semantic similarity) ranks candidates, and Gemini generates explainable rationale.
            </p>
          </div>

          <button
            onClick={() => setIsPriorityModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-lg border border-stone-200 transition shrink-0 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Tune Priority Weights</span>
          </button>
        </div>

        {/* Pipeline Flow Diagram */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2 py-2 px-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-semibold text-stone-800">Matching Pipeline:</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">Available Resource</span>
            <span>↓</span>
            <span className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded font-medium">SQL Filtering</span>
            <span>↓</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-medium">Candidate Requests</span>
            <span>↓</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">AI Match Score</span>
            <span>↓</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">Recommended Request</span>
            <span>↓</span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-medium">AI Explanation</span>
          </div>
        </div>
      </div>

      {/* Resource Selection Toolbar */}
      <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Select Available Resource:
            </label>
            <select
              value={selectedResourceId}
              onChange={(e) => handleResourceChange(Number(e.target.value))}
              className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {availableResources.map((res) => (
                <option key={res.id} value={res.id}>
                  #{res.id} - {res.quantity}x {res.subcategory || res.category} ({res.condition})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchMatches(selectedResourceId)}
            disabled={isLoading}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-run Matching Engine</span>
          </button>
        </div>

        {/* Selected Resource Profile Summary */}
        {selectedResourceObj && (
          <div className="mt-3 p-3 bg-blue-50/60 rounded-lg border border-blue-200 flex flex-col md:flex-row md:items-center justify-between text-xs text-stone-700 gap-2">
            <div>
              <strong className="text-blue-950 font-semibold">{selectedResourceObj.description}</strong>
              <div className="mt-1 flex items-center space-x-3 text-stone-500">
                <span>Category: <strong>{selectedResourceObj.category}</strong></span>
                <span>•</span>
                <span>Subcategory: <strong>{selectedResourceObj.subcategory}</strong></span>
                <span>•</span>
                <span>Available: <strong className="text-blue-700">{selectedResourceObj.quantity} units</strong></span>
                <span>•</span>
                <span>Condition: <strong>{selectedResourceObj.condition}</strong></span>
              </div>
            </div>
            <div className="text-stone-500 shrink-0">
              Donor Org: <span className="font-medium text-stone-800">{selectedResourceObj.org_name || "Community Partner"}</span>
            </div>
          </div>
        )}
      </div>

      {transferSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{transferSuccessMsg}</span>
          </div>
          <span className="text-xs text-emerald-700 font-mono">MySQL Database updated</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Match Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900">
            Recommended Matches ({matchData?.recommendedRequests.length || 0} candidate requests ranked)
          </h3>
          <span className="text-xs text-stone-500">Ranked by calculated compatibility & priority</span>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200">
            <Brain className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-800">Calculating matching scores & generating AI rationale...</p>
            <p className="text-xs text-stone-500 mt-1">Filtering through SQL candidate pool and evaluating compatibility</p>
          </div>
        ) : matchData && matchData.recommendedRequests.length > 0 ? (
          <div className="space-y-4">
            {matchData.recommendedRequests.map((rec, index) => {
              const isTop = index === 0;
              const isHighMatch = rec.matchScore >= 80;

              return (
                <div
                  key={rec.requestId}
                  className={`bg-white rounded-xl p-5 border transition shadow-xs ${
                    isTop
                      ? "border-blue-300 ring-1 ring-blue-200"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Request Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        {isTop && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-blue-600 text-white rounded-full">
                            TOP MATCH #1
                          </span>
                        )}
                        <span className="text-sm font-bold text-stone-900">
                          Request #{rec.requestId} — {rec.organizationName}
                        </span>
                        <span className="text-xs text-stone-500">({rec.organizationLocation})</span>

                        {/* Priority Badge */}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            rec.urgency === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : rec.urgency === "MEDIUM"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          Urgency: {rec.urgency}
                        </span>

                        {rec.deadline && (
                          <span className="text-xs text-stone-500">
                            Deadline: <strong className="text-stone-700">{rec.deadline}</strong>
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-stone-700">{rec.requestDescription}</p>

                      <div className="flex items-center space-x-4 text-xs text-stone-500">
                        <span>Category: <strong className="text-stone-700">{rec.category}</strong></span>
                        <span>Subcategory: <strong className="text-stone-700">{rec.subcategory}</strong></span>
                        <span>Demanded: <strong className="text-blue-600">{rec.requestedQuantity} units</strong></span>
                      </div>

                      {/* "Why this match?" AI Explanation Card */}
                      <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1 mt-2">
                        <div className="flex items-center space-x-1.5 text-stone-900 font-semibold">
                          <Brain className="w-3.5 h-3.5 text-purple-600" />
                          <span>Why this match? (AI Explanation)</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{rec.reason}</p>
                      </div>

                      {/* Multi-Factor Score Breakdown */}
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-stone-600 block mb-1.5">
                          Score Factor Breakdown:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div className="p-2 bg-stone-50 rounded border border-stone-200">
                            <span className="text-stone-500 block text-[10px]">Category</span>
                            <span className="font-bold text-stone-800">{rec.scoreBreakdown.categoryMatch}%</span>
                          </div>
                          <div className="p-2 bg-stone-50 rounded border border-stone-200">
                            <span className="text-stone-500 block text-[10px]">Subcategory</span>
                            <span className="font-bold text-stone-800">{rec.scoreBreakdown.subcategoryMatch}%</span>
                          </div>
                          <div className="p-2 bg-stone-50 rounded border border-stone-200">
                            <span className="text-stone-500 block text-[10px]">Quantity</span>
                            <span className="font-bold text-stone-800">{rec.scoreBreakdown.quantityCompatibility}%</span>
                          </div>
                          <div className="p-2 bg-stone-50 rounded border border-stone-200">
                            <span className="text-stone-500 block text-[10px]">Urgency</span>
                            <span className="font-bold text-stone-800">{rec.scoreBreakdown.urgencyScore}%</span>
                          </div>
                          <div className="p-2 bg-stone-50 rounded border border-stone-200">
                            <span className="text-stone-500 block text-[10px]">Keywords</span>
                            <span className="font-bold text-stone-800">{rec.scoreBreakdown.keywordSimilarity}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Meter & Action */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-stone-200 pt-3 md:pt-0 md:pl-5 shrink-0 gap-3">
                      <div className="text-center md:text-right">
                        <span className="text-xs font-medium text-stone-500 block">Match Score</span>
                        <span
                          className={`text-3xl font-extrabold font-mono ${
                            isHighMatch
                              ? "text-emerald-600"
                              : rec.matchScore >= 50
                              ? "text-blue-600"
                              : "text-stone-500"
                          }`}
                        >
                          {rec.matchScore}%
                        </span>
                      </div>

                      <button
                        onClick={() => handleExecuteTransfer(rec)}
                        disabled={transferringRequestId === rec.requestId}
                        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <Send className={`w-3.5 h-3.5 ${transferringRequestId === rec.requestId ? "animate-spin" : ""}`} />
                        <span>
                          {transferringRequestId === rec.requestId ? "Transferring..." : "Execute Transfer"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-stone-200">
            <p className="text-stone-600 text-sm">No compatible pending requests found in the database.</p>
          </div>
        )}
      </div>

      <PriorityConfigModal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        onWeightsChanged={() => fetchMatches(selectedResourceId)}
      />
    </div>
  );
};
