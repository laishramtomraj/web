import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { ResourceClassifier } from "./components/ResourceClassifier";
import { SmartMatcher } from "./components/SmartMatcher";
import { NLAnalyticsChat } from "./components/NLAnalyticsChat";
import { ImpactDashboard } from "./components/ImpactDashboard";
import { DatabaseViewer } from "./components/DatabaseViewer";
import { AIDocumentation } from "./components/AIDocumentation";
import {
  getResourcesApi,
  getRequestsApi,
  getTransfersApi,
  getOrganizationsApi,
  getAnalyticsFullApi,
  resetDemoDataApi
} from "./api";
import { Resource, ResourceRequest, TransferRecord, Organization, AnalyticsSuite } from "./types";
import { CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSuite | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resList, reqList, transList, orgList, analyticsData] = await Promise.all([
        getResourcesApi(),
        getRequestsApi(),
        getTransfersApi(),
        getOrganizationsApi(),
        getAnalyticsFullApi()
      ]);
      setResources(resList);
      setRequests(reqList);
      setTransfers(transList);
      setOrganizations(orgList);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error("Data fetch error:", err);
      showToast(err.message || "Failed to load database records", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleResetDemo = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await resetDemoDataApi();
      await loadAllData();
      showToast("Demo data reloaded to original initial state!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reset demo data", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans antialiased">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        resourceCount={resources.length}
        transferCount={transfers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "dashboard" && (
          <ImpactDashboard
            analytics={analytics}
            resources={resources}
            requests={requests}
            transfers={transfers}
            organizations={organizations}
            onRefresh={loadAllData}
            isLoading={isLoading}
          />
        )}

        {activeTab === "classifier" && (
          <ResourceClassifier
            organizations={organizations}
            onResourceCreated={() => {
              loadAllData();
              showToast("New resource extracted and saved to MySQL database!", "success");
            }}
          />
        )}

        {activeTab === "matcher" && (
          <SmartMatcher
            resources={resources}
            onTransferCompleted={() => {
              loadAllData();
              showToast("Transfer successfully logged in MySQL database!", "success");
            }}
          />
        )}

        {activeTab === "analytics" && <NLAnalyticsChat />}

        {activeTab === "database" && (
          <DatabaseViewer
            resources={resources}
            requests={requests}
            transfers={transfers}
            organizations={organizations}
            onRefresh={loadAllData}
            isLoading={isLoading}
          />
        )}

        {activeTab === "docs" && <AIDocumentation />}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
              toastMessage.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : toastMessage.type === "error"
                ? "bg-red-900 text-red-100 border-red-700"
                : "bg-stone-900 text-stone-100 border-stone-700"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-red-400" />}
            {toastMessage.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ResourceMatch AI • Innovation Component for Resource Management, Matching & Analytics
          </span>
          <div className="flex items-center space-x-4">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>•</span>
            <span>MySQL 8.0 & Python Pandas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
