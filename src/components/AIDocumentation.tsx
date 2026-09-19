import React from "react";
import { FileText, Cpu, ShieldCheck, Database, Layers, ArrowRight, CheckCircle2, Lock, GitBranch, BarChart3 } from "lucide-react";

export const AIDocumentation: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <FileText className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            AI System Documentation & Technical Architecture
          </h2>
        </div>
        <p className="text-sm text-stone-600 mt-1 max-w-3xl">
          Comprehensive operational specification covering the AI Resource Classifier, Priority Scoring Engine, Smart Matching Pipeline, SQL Whitelist Security, Python/Pandas Analytics Engine, and MySQL 8.0 schema.
        </p>
      </div>

      {/* High-Level Architecture Diagram */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
          <GitBranch className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-stone-900">End-to-End System Architecture</h3>
        </div>

        <div className="p-4 bg-stone-900 text-stone-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{`
  +-----------------------------------------------------------------------------------------+
  |                                   CLIENT FRONTEND (React 18 + Vite)                     |
  |  [Classifier Form]   [Smart Matcher]   [Priority Tuner]   [NL Assistant]   [Dashboard]  |
  +--------------------------------------------+--------------------------------------------+
                                               | (HTTP / REST APIs)
                                               v
  +-----------------------------------------------------------------------------------------+
  |                                   EXPRESS API BACKEND                                   |
  |  /api/ai/classify-resource       /api/ai/match-resource        /api/ai/calculate-priority |
  |  /api/ai/natural-language-query  /api/analytics/full           /api/data/*              |
  +--------------------+-----------------------+-----------------------------+--------------+
                       |                       |                             |
                       v                       v                             v
  +--------------------------+  +----------------------------+  +---------------------------+
  |    GOOGLE GEMINI 3.8     |  |   SQL SAFETY VALIDATOR     |  |  PYTHON ANALYTICS ENGINE  |
  | - Attribute Extraction   |  | - Strict SELECT Whitelist  |  | - Python 3 & Pandas Agg   |
  | - Semantic Matching Rationale| - Keyword Blacklist (DROP)  |  | - Matplotlib-style SVGs   |
  | - Anti-Hallucination QA  |  | - Approved Tables Filter   |  | - Multi-axis Visualizers  |
  +--------------------------+  +--------------+-------------+  +-------------+-------------+
                                               |                              |
                                               v                              v
  +-----------------------------------------------------------------------------------------+
  |                           RELATIONAL DATABASE ENGINE (MySQL 8.0)                        |
  |  tables: organizations | resources | requests | transfers | matches | categories        |
  +-----------------------------------------------------------------------------------------+
`}</pre>
        </div>
      </div>

      {/* Module 1: AI Resource Classification */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">1</span>
          <h3>AI Resource Classification</h3>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          Converts raw, unstructured resource descriptions (e.g., <em>"We have 50 unused wooden chairs"</em>) into verified JSON entities matching our relational schema:
        </p>
        <ul className="list-disc list-inside text-xs text-stone-600 space-y-1 pl-2">
          <li><strong>Category:</strong> Normalized into standard domains (<em>Furniture, Educational Supplies, Technology & Electronics, Books & Media, Medical & Health</em>).</li>
          <li><strong>Subcategory:</strong> Fine-grained object type (<em>Chair, Notebook, Computer, Desk, Backpack</em>).</li>
          <li><strong>Quantity:</strong> Extracted numeric quantity with natural language word conversion (<em>"fifty" &rarr; 50</em>).</li>
          <li><strong>Condition:</strong> Evaluated into <em>Unused, Like New, Good, Refurbished, Fair</em>.</li>
          <li><strong>Semantic Tags:</strong> Key feature and material keywords for cross-category matching.</li>
          <li><strong>Explanation:</strong> Human-readable rationale detailing why attributes were assigned.</li>
        </ul>
      </div>

      {/* Module 2: Priority Recommendation Engine */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">2</span>
          <h3>Priority Recommendation Algorithm</h3>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          Requests are dynamically scored on a 0–100 scale using a transparent, multi-factor weighting formula:
        </p>
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 font-mono text-xs text-stone-800">
          Priority Score = (Urgency × 0.40) + (Deadline Proximity × 0.25) + (Resource Scarcity × 0.20) + (Category Demand × 0.15)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <strong className="text-red-900 block font-bold">HIGH Priority (≥ 68)</strong>
            <span className="text-red-800">Imminent deadline (&lt;14 days), emergency status, or high resource availability.</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <strong className="text-amber-900 block font-bold">MEDIUM Priority (40 – 67)</strong>
            <span className="text-amber-800">Standard operational need with 2-4 week timeline.</span>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <strong className="text-stone-900 block font-bold">LOW Priority (&lt; 40)</strong>
            <span className="text-stone-700">Flexible timeline, exploratory requests, or low overall volume.</span>
          </div>
        </div>
      </div>

      {/* Module 3 & 4: Smart Matching Pipeline & Explanation */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">3</span>
          <h3>Smart Matching Pipeline & AI Explanation</h3>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          The allocation engine eliminates arbitrary pairings by enforcing a multi-stage filtering and scoring pipeline:
        </p>
        <div className="space-y-2 text-xs text-stone-700">
          <div className="p-2.5 bg-stone-50 rounded border border-stone-200 flex items-start space-x-2">
            <span className="font-bold text-blue-600">Stage 1: SQL Pre-Filtering:</span>
            <span>Queries all non-fulfilled requests sharing identical category or subcategory with quantity criteria.</span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded border border-stone-200 flex items-start space-x-2">
            <span className="font-bold text-purple-600">Stage 2: Deterministic Multi-Factor Scoring:</span>
            <span>Category Match (35%) + Subcategory Match (25%) + Quantity Compatibility (20%) + Urgency (10%) + Keyword Overlap (10%).</span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded border border-stone-200 flex items-start space-x-2">
            <span className="font-bold text-emerald-600">Stage 3: Gemini Explainable Rationale:</span>
            <span>Synthesizes a 1–2 sentence "Why this match?" justification detailing exact compatibility metrics and community impact.</span>
          </div>
        </div>
      </div>

      {/* Module 5: Natural Language Analytics & SQL Safety */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">4</span>
          <h3>Natural-Language Analytics & SQL Security Guardrails</h3>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          The system allows non-technical stakeholders to query the operational database in plain English without risking SQL injection or unauthorized schema modifications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>SQL Validator Security Rules</span>
            </div>
            <ul className="list-disc list-inside text-emerald-800 space-y-1">
              <li>Strictly permits only read-only <strong>SELECT</strong> statements.</li>
              <li>Blocks all DDL and DML keywords (<code>DROP, INSERT, UPDATE, DELETE, ALTER, TRUNCATE, EXEC</code>).</li>
              <li>Enforces table whitelist: only approved tables (<code>organizations, resources, requests, transfers, matches</code>) may be accessed.</li>
              <li>Multi-statement delimiters (<code>;</code>) and comment blocks are sanitized to prevent stacked injection.</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center space-x-1.5 text-blue-900 font-bold">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>Anti-Hallucination Design</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              The AI explanation engine is fed the exact JSON array of database rows returned by the validated query. If 0 rows return, it is strictly forbidden from extrapolating and returns: <em>"I don't have enough data in the system to answer that question."</em>
            </p>
          </div>
        </div>
      </div>

      {/* Module 6: Python & Pandas Analytics */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">5</span>
          <h3>Python, Pandas, & Matplotlib Analytics Engine</h3>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          The statistical module is powered by an underlying Python analytics script (<code>backend/analytics/analytics_engine.py</code>) running automated data aggregation and vector chart generation:
        </p>
        <ul className="list-disc list-inside text-xs text-stone-600 space-y-1 pl-2">
          <li><strong>Data Aggregation:</strong> Performs Pandas-equivalent grouping (<code>{"df.groupby(['category']).agg({'quantity': 'sum'})"}</code>) for category breakdown and time-series rollups.</li>
          <li><strong>Matplotlib SVG Generation:</strong> Produces crisp, publication-quality vector charts with accurate axes, labels, gridlines, and color coding.</li>
          <li><strong>REST Consumption:</strong> Exposes clean endpoints (<code>/api/analytics/resource-statistics</code>, <code>/api/analytics/transfer-trends</code>, <code>/api/analytics/category-analysis</code>, <code>/api/analytics/organization-activity</code>, <code>/api/analytics/success-rate</code>).</li>
        </ul>
      </div>

      {/* Database Schema Reference */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
          <Database className="w-5 h-5 text-stone-700" />
          <h3>MySQL 8.0 Relational Database Schema</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <strong className="text-blue-700 block mb-1">organizations</strong>
            <p className="text-stone-600 text-[11px]">
              id (PK), name, type, contact_email, location, created_at
            </p>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <strong className="text-blue-700 block mb-1">resources</strong>
            <p className="text-stone-600 text-[11px]">
              id (PK), organization_id (FK), description, category, subcategory, quantity, condition, status, created_at
            </p>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <strong className="text-blue-700 block mb-1">requests</strong>
            <p className="text-stone-600 text-[11px]">
              id (PK), organization_id (FK), description, category, subcategory, quantity, urgency, deadline, status, created_at
            </p>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <strong className="text-blue-700 block mb-1">transfers</strong>
            <p className="text-stone-600 text-[11px]">
              id (PK), resource_id (FK), request_id (FK), quantity, status, transfer_date, notes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
