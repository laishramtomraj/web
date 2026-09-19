export interface Organization {
  id: number;
  name: string;
  type: string;
  contact_email: string;
  location: string;
  created_at: string;
}

export interface Resource {
  id: number;
  organization_id: number;
  org_name?: string;
  org_location?: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  condition: string;
  status: 'AVAILABLE' | 'MATCHED' | 'TRANSFERRED' | 'RESERVED';
  created_at: string;
}

export interface ResourceRequest {
  id: number;
  organization_id: number;
  org_name?: string;
  org_location?: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  deadline: string | null;
  status: 'PENDING' | 'MATCHED' | 'FULFILLED' | 'CANCELLED';
  created_at: string;
}

export interface ClassificationResponse {
  category: string;
  subcategory: string;
  quantity: number;
  condition: string;
  keywords: string[];
  explanation: string;
  savedResourceId?: number;
}

export interface MatchScoreBreakdown {
  categoryMatch: number;
  subcategoryMatch: number;
  quantityCompatibility: number;
  urgencyScore: number;
  keywordSimilarity: number;
}

export interface MatchRecommendation {
  requestId: number;
  requestDescription: string;
  organizationName: string;
  organizationLocation: string;
  category: string;
  subcategory: string;
  requestedQuantity: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  deadline: string | null;
  matchScore: number;
  reason: string;
  scoreBreakdown: MatchScoreBreakdown;
}

export interface MatchResourceResponse {
  resource: {
    id: number;
    description: string;
    category: string;
    subcategory: string;
    quantity: number;
    condition: string;
    status: string;
    organizationName: string;
  };
  recommendedRequests: MatchRecommendation[];
}

export interface PriorityFactors {
  urgencyScore: number;
  deadlineScore: number;
  availabilityScore: number;
  demandScore: number;
  daysUntilDeadline: number | null;
  availableMatchingResources: number;
  categoryDemandCount: number;
}

export interface PriorityWeights {
  urgency: number;
  deadline: number;
  availability: number;
  demand: number;
}

export interface PriorityResponse {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  factors: PriorityFactors;
  weights: PriorityWeights;
  reason: string;
}

export interface NLAnalyticsResponse {
  question: string;
  generatedSQL: string;
  validatedSQL: string;
  data: any[];
  rowCount: number;
  answer: string;
  suggestedChartType?: 'bar' | 'pie' | 'line' | 'stat';
  chartData?: any[];
  chartKey?: string;
  chartValue?: string;
  executionTimeMs: number;
}

export interface AnalyticsSuite {
  resourceStatistics: {
    totalResourcesCount: number;
    totalUnits: number;
    availableUnits: number;
    transferredUnits: number;
    matchedUnits: number;
  };
  successRate: {
    ratePercent: number;
    totalRequests: number;
    fulfilledRequests: number;
    pendingRequests: number;
  };
  categoryAnalysis: {
    categories: string[];
    supply: number[];
    demand: number[];
    mostRequestedCategory: string;
  };
  transferTrends: {
    months: string[];
    monthlyUnits: number[];
    totalTransfersCount: number;
  };
  organizationActivity: Array<{
    organizationId: number;
    organizationName: string;
    resourcesDonated: number;
    unitsDonated: number;
    requestsPlaced: number;
  }>;
  charts: {
    categoryChartSvg: string;
    trendsChartSvg: string;
  };
}

export interface TransferRecord {
  id: number;
  resource_id: number;
  request_id: number;
  quantity: number;
  status: string;
  transfer_date: string;
  notes: string;
  resource_desc?: string;
  request_desc?: string;
  donor_org?: string;
  recipient_org?: string;
}
