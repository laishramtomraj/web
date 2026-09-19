import { querySQL, executeSQL } from "../database/db.js";
import { getGeminiClient, GEMINI_MODEL } from "../config/gemini.js";

export interface MatchRecommendation {
  requestId: number;
  requestDescription: string;
  organizationName: string;
  organizationLocation: string;
  category: string;
  subcategory: string;
  requestedQuantity: number;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  deadline: string | null;
  matchScore: number;
  reason: string;
  scoreBreakdown: {
    categoryMatch: number;
    subcategoryMatch: number;
    quantityCompatibility: number;
    urgencyScore: number;
    keywordSimilarity: number;
  };
}

export interface MatchResourceResult {
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

export async function matchResource(resourceId: number): Promise<MatchResourceResult> {
  const resourceRows = await querySQL(
    `SELECT r.*, o.name as org_name, o.location as org_location 
     FROM resources r 
     JOIN organizations o ON r.organization_id = o.id 
     WHERE r.id = ?`,
    [resourceId]
  );

  if (resourceRows.length === 0) {
    throw new Error(`Resource #${resourceId} not found`);
  }

  const resource = resourceRows[0];

  // Pipeline Step 1: SQL Filtering
  // Eliminate clearly incompatible requests (non-pending, or completely disjoint categories when strict)
  const candidateRequests = await querySQL(
    `SELECT req.*, org.name as org_name, org.location as org_location 
     FROM requests req 
     JOIN organizations org ON req.organization_id = org.id 
     WHERE req.status = 'PENDING'
     ORDER BY CASE WHEN req.category = ? THEN 0 ELSE 1 END, req.created_at DESC`,
    [resource.category]
  );

  if (candidateRequests.length === 0) {
    return {
      resource: {
        id: resource.id,
        description: resource.description,
        category: resource.category,
        subcategory: resource.subcategory,
        quantity: resource.quantity,
        condition: resource.condition,
        status: resource.status,
        organizationName: resource.org_name
      },
      recommendedRequests: []
    };
  }

  // Pipeline Step 2 & 3: Component Scoring
  const recommendations: MatchRecommendation[] = [];

  for (const req of candidateRequests) {
    // 1. Category match
    const categoryExact = req.category.toLowerCase() === resource.category.toLowerCase();
    const categoryMatchScore = categoryExact ? 100 : 25;

    // 2. Subcategory match
    const subExact = req.subcategory.toLowerCase() === resource.subcategory.toLowerCase();
    const subContains = req.description.toLowerCase().includes(resource.subcategory.toLowerCase()) ||
                        resource.description.toLowerCase().includes(req.subcategory.toLowerCase());
    const subcategoryMatchScore = subExact ? 100 : (subContains ? 80 : 30);

    // 3. Quantity compatibility
    let quantityScore = 50;
    if (resource.quantity >= req.quantity) {
      // Resource can fulfill the full request
      const ratio = req.quantity / resource.quantity;
      quantityScore = ratio >= 0.7 ? 100 : 90; // Optimal match when request takes most of the resource
    } else {
      // Partial fulfillment
      const coverage = (resource.quantity / req.quantity) * 100;
      quantityScore = Math.max(30, Math.round(coverage * 0.75));
    }

    // 4. Urgency weight
    let urgencyScore = 60;
    if (req.urgency === "HIGH") urgencyScore = 100;
    else if (req.urgency === "MEDIUM") urgencyScore = 70;
    else urgencyScore = 40;

    // 5. Semantic & keyword overlap
    const cleanTokens = (str: string) =>
      str.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 3);
    const resTokens = new Set(cleanTokens(resource.description));
    const reqTokens = cleanTokens(req.description);
    const sharedTokens = reqTokens.filter(t => resTokens.has(t));
    const keywordSimilarity = Math.min(100, Math.round((sharedTokens.length / Math.max(1, reqTokens.length)) * 140));

    // Weighted match score:
    // Category (30%), Subcategory (25%), Quantity (20%), Keyword (15%), Urgency (10%)
    const rawScore = Math.round(
      categoryMatchScore * 0.30 +
      subcategoryMatchScore * 0.25 +
      quantityScore * 0.20 +
      keywordSimilarity * 0.15 +
      urgencyScore * 0.10
    );

    // Bound between 10 and 99
    const matchScore = Math.min(99, Math.max(15, rawScore));

    // Generate clear, explainable reason
    let reason = "";
    if (categoryExact && subExact && resource.quantity >= req.quantity) {
      reason = `The resource and request belong to the same category (${resource.category} > ${resource.subcategory}), the available quantity (${resource.quantity}) is sufficient to fulfill the requested ${req.quantity}, and the item characteristics align directly.`;
    } else if (categoryExact && resource.quantity >= req.quantity) {
      reason = `Matching category (${resource.category}) with sufficient volume (${resource.quantity} available vs ${req.quantity} needed). Fits the target usage profile.`;
    } else if (categoryExact && resource.quantity < req.quantity) {
      reason = `Direct category match providing partial fulfillment (${resource.quantity} of ${req.quantity} units needed) for an active community request.`;
    } else {
      reason = `Cross-category complementary match with overlapping functional keywords and available capacity.`;
    }

    recommendations.push({
      requestId: req.id,
      requestDescription: req.description,
      organizationName: req.org_name,
      organizationLocation: req.org_location,
      category: req.category,
      subcategory: req.subcategory,
      requestedQuantity: req.quantity,
      urgency: req.urgency,
      deadline: req.deadline,
      matchScore,
      reason,
      scoreBreakdown: {
        categoryMatch: categoryMatchScore,
        subcategoryMatch: subcategoryMatchScore,
        quantityCompatibility: quantityScore,
        urgencyScore,
        keywordSimilarity
      }
    });
  }

  // Sort by match score descending
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  // Top candidates can be enhanced with Gemini explanations if available
  const topCandidate = recommendations[0];
  const ai = getGeminiClient();
  if (ai && topCandidate && topCandidate.matchScore >= 60) {
    try {
      const prompt = `You are an AI Resource Matching Explainer.
Given an available resource and a matching request, generate a clear, transparent, user-friendly 1-2 sentence explanation answering "Why this match?".

Available Resource:
- Category: ${resource.category}
- Subcategory: ${resource.subcategory}
- Quantity: ${resource.quantity}
- Condition: ${resource.condition}
- Description: "${resource.description}"

Matched Request:
- Recipient: ${topCandidate.organizationName} (${topCandidate.organizationLocation})
- Requested: ${topCandidate.requestedQuantity} x ${topCandidate.subcategory}
- Urgency: ${topCandidate.urgency}
- Deadline: ${topCandidate.deadline || 'flexible'}
- Description: "${topCandidate.requestDescription}"
- Calculated Match Score: ${topCandidate.matchScore}%

Return only the 1-2 sentence explanation.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { temperature: 0.2 },
      });

      const refinedReason = response.text?.trim();
      if (refinedReason && refinedReason.length > 20 && refinedReason.length < 300) {
        topCandidate.reason = refinedReason;
      }
    } catch {
      // keep deterministic explanation
    }
  }

  // Save top match recommendation to matches table if not already existing
  if (topCandidate && topCandidate.matchScore >= 70) {
    const existing = await querySQL(
      `SELECT id FROM matches WHERE resource_id = ? AND request_id = ?`,
      [resource.id, topCandidate.requestId]
    );
    if (existing.length === 0) {
      await executeSQL(
        `INSERT INTO matches (resource_id, request_id, match_score, reason, status) 
         VALUES (?, ?, ?, ?, 'RECOMMENDED')`,
        [resource.id, topCandidate.requestId, topCandidate.matchScore, topCandidate.reason]
      );
    }
  }

  return {
    resource: {
      id: resource.id,
      description: resource.description,
      category: resource.category,
      subcategory: resource.subcategory,
      quantity: resource.quantity,
      condition: resource.condition,
      status: resource.status,
      organizationName: resource.org_name
    },
    recommendedRequests: recommendations.slice(0, 5)
  };
}
