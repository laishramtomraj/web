import React from "react";
import { Sparkles, Database, Brain, Cpu, RotateCcw, BarChart3, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetDemo: () => void;
  isResetting: boolean;
  resourceCount: number;
  transferCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetDemo,
  isResetting,
  resourceCount,
  transferCount
}) => {
  const tabs = [
    { id: "dashboard", label: "Impact Dashboard", icon: BarChart3 },
    { id: "classifier", label: "Resource Classifier", icon: Sparkles },
    { id: "matcher", label: "Smart Matching", icon: Brain },
    { id: "analytics", label: "AI Analytics Assistant", icon: Cpu },
    { id: "database", label: "Relational Database", icon: Database },
    { id: "docs", label: "AI Documentation", icon: CheckCircle2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Banner with Platform Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              RM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">ResourceMatch AI</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded-full border border-blue-400/30">
                  Innovation Component
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                AI-Powered Resource Management, Smart Matching & Analytics Module
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Model Indicators */}
            <div className="hidden lg:flex items-center space-x-2 text-xs text-stone-300 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-stone-200">Gemini 3.8 Flash</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400">MySQL 8.0 & Python Pandas</span>
            </div>

            {/* Quick Reset Demo button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="flex items-center space-x-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 transition disabled:opacity-50"
              title="Reset sample resources, requests, and transfers"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isResetting ? "Resetting..." : "Reset Demo Data"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-stone-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
