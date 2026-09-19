import { querySQL } from "../database/db.js";
import { getGeminiClient, GEMINI_MODEL } from "../config/gemini.js";

export interface PriorityWeights {
  urgency: number;      // default 40
  deadline: number;     // default 25
  availability: number; // default 20
  demand: number;       // default 15
}

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  urgency: 40,
  deadline: 25,
  availability: 20,
  demand: 15
};

let currentWeights: PriorityWeights = { ...DEFAULT_PRIORITY_WEIGHTS };

export function getPriorityWeights(): PriorityWeights {
  return { ...currentWeights };
}

export function updatePriorityWeights(newWeights: Partial<PriorityWeights>): PriorityWeights {
  currentWeights = {
    ...currentWeights,
    ...newWeights
  };
  return { ...currentWeights };
}

export interface PriorityResult {
  priority: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  factors: {
    urgencyScore: number;
    deadlineScore: number;
    availabilityScore: number;
    demandScore: number;
    daysUntilDeadline: number | null;
    availableMatchingResources: number;
    categoryDemandCount: number;
  };
  weights: PriorityWeights;
  reason: string;
}

export async function calculateRequestPriority(
  requestId: number,
  customWeights?: PriorityWeights
): Promise<PriorityResult> {
  const weights = customWeights || currentWeights;

  const requests = await querySQL(
    `SELECT r.*, o.name as org_name FROM requests r 
     JOIN organizations o ON r.organization_id = o.id 
     WHERE r.id = ?`,
    [requestId]
  );

  if (requests.length === 0) {
    throw new Error(`Request with ID ${requestId} not found`);
  }

  const req = requests[0];

  // 1. Urgency factor
  let urgencyScore = 50;
  if (req.urgency === "HIGH") urgencyScore = 100;
  else if (req.urgency === "MEDIUM") urgencyScore = 60;
  else if (req.urgency === "LOW") urgencyScore = 20;

  // 2. Deadline factor
  let deadlineScore = 30;
  let daysUntilDeadline: number | null = null;

  if (req.deadline) {
    const today = new Date();
    const target = new Date(req.deadline);
    const diffTime = target.getTime() - today.getTime();
    daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntilDeadline <= 3) deadlineScore = 100;
    else if (daysUntilDeadline <= 7) deadlineScore = 85;
    else if (daysUntilDeadline <= 14) deadlineScore = 65;
    else if (daysUntilDeadline <= 30) deadlineScore = 40;
    else deadlineScore = 15;
  }

  // 3. Availability factor (fewer matching available resources = higher priority attention needed)
  const availableRes = await querySQL(
    `SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_qty 
     FROM resources 
     WHERE category = ? AND status = 'AVAILABLE'`,
    [req.category]
  );
  const availableMatchingCount = availableRes[0]?.count || 0;
  const availableQuantity = availableRes[0]?.total_qty || 0;

  let availabilityScore = 50;
  if (availableQuantity < req.quantity) {
    availabilityScore = 95; // Extreme deficit
  } else if (availableQuantity < req.quantity * 2) {
    availabilityScore = 65; // Moderate scarcity
  } else {
    availabilityScore = 20; // Ample supply
  }

  // 4. Demand factor (number of competing pending requests in this category)
  const demandRes = await querySQL(
    `SELECT COUNT(*) as count FROM requests 
     WHERE category = ? AND status = 'PENDING'`,
    [req.category]
  );
  const categoryDemandCount = demandRes[0]?.count || 0;

  let demandScore = 40;
  if (categoryDemandCount >= 5) demandScore = 95;
  else if (categoryDemandCount >= 3) demandScore = 75;
  else if (categoryDemandCount >= 1) demandScore = 50;
  else demandScore = 20;

  // Composite Calculation
  const totalWeight = weights.urgency + weights.deadline + weights.availability + weights.demand;
  const normalizedTotalWeight = totalWeight > 0 ? totalWeight : 100;

  const compositeScore = Math.round(
    (urgencyScore * weights.urgency +
     deadlineScore * weights.deadline +
     availabilityScore * weights.availability +
     demandScore * weights.demand) /
     normalizedTotalWeight
  );

  let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  if (compositeScore >= 68) {
    priority = "HIGH";
  } else if (compositeScore < 45) {
    priority = "LOW";
  }

  // Explain reason
  let reason = "";
  if (priority === "HIGH") {
    if (daysUntilDeadline !== null && daysUntilDeadline <= 7 && availableQuantity < req.quantity) {
      reason = `This request has a short deadline (${daysUntilDeadline} days remaining) and currently has limited matching resources (${availableQuantity} available vs ${req.quantity} needed).`;
    } else if (daysUntilDeadline !== null && daysUntilDeadline <= 7) {
      reason = `This request has an impending deadline of ${req.deadline} (${daysUntilDeadline} days remaining) and marked urgency ${req.urgency}.`;
    } else {
      reason = `High resource scarcity (${availableQuantity} available in inventory) and strong category demand (${categoryDemandCount} active requests) require immediate priority action.`;
    }
  } else if (priority === "MEDIUM") {
    reason = `Moderate priority based on balanced request volume (${categoryDemandCount} requests in ${req.category}) and reasonable timeline.`;
  } else {
    reason = `Low priority because of ample category inventory and relaxed timeline.`;
  }

  // Optionally polish with Gemini if key is present
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Write a crisp 1-sentence explanation for a resource priority assessment.
Item: ${req.description} (${req.category})
Priority: ${priority} (Score: ${compositeScore}/100)
Key metrics: Urgency is ${req.urgency}, deadline is ${req.deadline || 'unspecified'} (${daysUntilDeadline ?? 'N/A'} days), available stock is ${availableQuantity} units, active category demand is ${categoryDemandCount} requests.
Return only the 1-sentence explanation string.`;
      const aiRes = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { temperature: 0.2 },
      });
      const aiText = aiRes.text?.trim();
      if (aiText && aiText.length > 10 && aiText.length < 250) {
        reason = aiText;
      }
    } catch {
      // Keep deterministic reason
    }
  }

  return {
    priority,
    score: compositeScore,
    factors: {
      urgencyScore,
      deadlineScore,
      availabilityScore,
      demandScore,
      daysUntilDeadline,
      availableMatchingResources: availableMatchingCount,
      categoryDemandCount
    },
    weights,
    reason
  };
}
