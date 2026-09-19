import {
  ClassificationResponse,
  MatchResourceResponse,
  PriorityResponse,
  PriorityWeights,
  NLAnalyticsResponse,
  AnalyticsSuite,
  Resource,
  ResourceRequest,
  TransferRecord,
  Organization
} from "./types";

export async function classifyResourceApi(
  description: string,
  saveToDb: boolean = true,
  organizationId: number = 1
): Promise<ClassificationResponse> {
  const res = await fetch("/api/ai/classify-resource", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, saveToDb, organizationId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Classification failed: ${res.statusText}`);
  }
  return res.json();
}

export async function matchResourceApi(resourceId: number): Promise<MatchResourceResponse> {
  const res = await fetch("/api/ai/match-resource", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Matching failed: ${res.statusText}`);
  }
  return res.json();
}

export async function calculatePriorityApi(
  requestId: number,
  customWeights?: PriorityWeights
): Promise<PriorityResponse> {
  const res = await fetch("/api/ai/calculate-priority", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, customWeights }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Priority calculation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getPriorityWeightsApi(): Promise<PriorityWeights> {
  const res = await fetch("/api/ai/priority-weights");
  if (!res.ok) throw new Error("Failed to fetch priority weights");
  return res.json();
}

export async function updatePriorityWeightsApi(weights: Partial<PriorityWeights>): Promise<PriorityWeights> {
  const res = await fetch("/api/ai/priority-weights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  });
  if (!res.ok) throw new Error("Failed to update priority weights");
  return res.json();
}

export async function queryNLAnalyticsApi(question: string): Promise<NLAnalyticsResponse> {
  const res = await fetch("/api/ai/natural-language-query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Analytics query failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getAnalyticsFullApi(): Promise<AnalyticsSuite> {
  const res = await fetch("/api/analytics/full");
  if (!res.ok) throw new Error("Failed to fetch full analytics");
  return res.json();
}

export async function getResourcesApi(): Promise<Resource[]> {
  const res = await fetch("/api/data/resources");
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json();
}

export async function getRequestsApi(): Promise<ResourceRequest[]> {
  const res = await fetch("/api/data/requests");
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

export async function getTransfersApi(): Promise<TransferRecord[]> {
  const res = await fetch("/api/data/transfers");
  if (!res.ok) throw new Error("Failed to fetch transfers");
  return res.json();
}

export async function getOrganizationsApi(): Promise<Organization[]> {
  const res = await fetch("/api/data/organizations");
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return res.json();
}

export async function executeTransferApi(
  resourceId: number,
  requestId: number,
  quantity?: number,
  notes?: string
): Promise<{ success: boolean; transferId: number; message: string }> {
  const res = await fetch("/api/data/execute-match-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceId, requestId, quantity, notes }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to execute transfer");
  }
  return res.json();
}

export async function resetDemoDataApi(): Promise<void> {
  const res = await fetch("/api/data/reset-demo", { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset demo data");
}
