import React, { useState } from "react";
import { Sparkles, ArrowRight, Tag, Layers, CheckCircle2, Box, Info, Database, AlertCircle } from "lucide-react";
import { ClassificationResponse, Organization } from "../types";
import { classifyResourceApi } from "../api";

interface ResourceClassifierProps {
  organizations: Organization[];
  onResourceCreated?: () => void;
}

export const ResourceClassifier: React.FC<ResourceClassifierProps> = ({
  organizations,
  onResourceCreated
}) => {
  const [description, setDescription] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<number>(1);
  const [saveToDb, setSaveToDb] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResponse | null>(null);

  const sampleInputs = [
    "We have 50 unused wooden chairs.",
    "We have 20 notebooks that are in good condition.",
    "25 refurbished desktop computers with Intel i5 and keyboards.",
    "40 heavy-duty waterproof school bags with reflective safety straps.",
    "30 modular wooden conference and study tables in like new shape."
  ];

  const handleClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await classifyResourceApi(description, saveToDb, selectedOrgId);
      setResult(data);
      if (saveToDb && onResourceCreated) {
        onResourceCreated();
      }
    } catch (err: any) {
      setError(err.message || "Failed to classify resource");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Concept Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">AI Resource Classification</h2>
            </div>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Enter raw, unstructured natural language text from donations, inventory manifests, or community emails. Gemini 3.8 extracts structured attributes (category, subcategory, quantity, condition, and semantic tags) with transparent explanations.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-stone-500 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200 shrink-0">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Endpoint: <strong>POST /api/ai/classify-resource</strong></span>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
        <form onSubmit={handleClassify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Unstructured Resource Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your available resource... (e.g. 'We have 50 unused wooden chairs.')"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              required
            />
          </div>

          {/* Quick Preset Samples */}
          <div>
            <span className="text-xs font-medium text-stone-500 block mb-1.5">Quick Demo Examples (Click to test):</span>
            <div className="flex flex-wrap gap-2">
              {sampleInputs.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDescription(sample)}
                  className="text-xs px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition border border-stone-200/80 cursor-pointer"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions & Settings */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-stone-100">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToDb}
                  onChange={(e) => setSaveToDb(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Store structured record in MySQL Database</span>
              </label>

              {organizations.length > 0 && (
                <div className="flex items-center space-x-1.5 text-xs text-stone-600">
                  <span>Donor Org:</span>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(Number(e.target.value))}
                    className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs text-stone-800"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Classifying with AI..." : "Classify Resource"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Structured Output Card */}
      {result && (
        <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-stone-900 text-base">Structured Extraction Result</h3>
            </div>
            {result.savedResourceId && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                Saved to MySQL as Resource #{result.savedResourceId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Category */}
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-medium text-stone-500 block">Category</span>
              <span className="text-base font-bold text-stone-900 mt-0.5 block">{result.category}</span>
            </div>

            {/* Subcategory */}
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-medium text-stone-500 block">Subcategory</span>
              <span className="text-base font-bold text-stone-900 mt-0.5 block">{result.subcategory}</span>
            </div>

            {/* Quantity */}
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-medium text-stone-500 block">Quantity</span>
              <span className="text-base font-bold text-blue-600 font-mono mt-0.5 block">
                {result.quantity} units
              </span>
            </div>

            {/* Condition */}
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-medium text-stone-500 block">Condition</span>
              <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                {result.condition}
              </span>
            </div>
          </div>

          {/* Keywords & Tags */}
          {result.keywords && result.keywords.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                <span>Extracted Keywords:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md border border-stone-200 font-mono"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-blue-900 block">AI Explanation (Section 4 Requirement):</span>
                <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">{result.explanation}</p>
              </div>
            </div>
          </div>

          {/* Raw JSON View */}
          <div>
            <details className="text-xs text-stone-600">
              <summary className="cursor-pointer font-medium text-stone-500 hover:text-stone-800">
                View Raw API JSON Payload
              </summary>
              <pre className="mt-2 p-3 bg-stone-900 text-stone-100 rounded-lg font-mono text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
