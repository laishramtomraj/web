import { getGeminiClient, GEMINI_MODEL } from "../config/gemini.js";
import { executeSQL, querySQL } from "../database/db.js";

export interface ClassificationResult {
  category: string;
  subcategory: string;
  quantity: number;
  condition: string;
  keywords: string[];
  explanation: string;
  savedResourceId?: number;
}

export async function classifyResource(
  description: string,
  saveToDb: boolean = true,
  organizationId: number = 1
): Promise<ClassificationResult> {
  const cleanDescription = description.trim();
  const ai = getGeminiClient();

  let classifiedData: ClassificationResult | null = null;

  if (ai) {
    try {
      const prompt = `You are an expert AI Resource Classification system for a charitable, educational, and disaster relief resource-sharing network.
Analyze the following unstructured resource description and extract structured properties.

Categories should belong to standard categories such as:
- "Furniture" (Subcategories: Chair, Table, Desk, Cabinet, Shelf, Bench)
- "Educational Supplies" (Subcategories: Notebook, School Bag, Stationery, Textbook, Art Kit)
- "Technology & Electronics" (Subcategories: Computer, Laptop, Monitor, Projector, Tablet)
- "Books & Media" (Subcategories: Book, Encyclopedia, Educational Video, Audio)
- "Medical & Hygiene" (Subcategories: First Aid, Sanitizer, Blanket, Personal Care)
- "Clothing & Apparel" (Subcategories: Uniform, Jacket, Shoes)

Conditions should be one of: "Unused", "Like New", "Good", "Fair".
Quantity should be an integer (extract the number, default to 1 if unspecified).

Resource description: "${cleanDescription}"

Return JSON matching this schema:
{
  "category": "string",
  "subcategory": "string",
  "quantity": number,
  "condition": "string",
  "keywords": ["string", "string"],
  "explanation": "string (A concise 1-2 sentence explanation of why this category, subcategory, and condition were determined)"
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = response.text || "";
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.category && parsed.subcategory) {
          classifiedData = {
            category: parsed.category,
            subcategory: parsed.subcategory,
            quantity: Number(parsed.quantity) || 1,
            condition: parsed.condition || "Good",
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
            explanation: parsed.explanation || `Classified as ${parsed.category} (${parsed.subcategory}) with quantity of ${parsed.quantity || 1} in ${parsed.condition || "Good"} condition based on linguistic feature extraction.`,
          };
        }
      }
    } catch (err) {
      console.warn("Gemini classification failed, falling back to heuristic parser:", err);
    }
  }

  // Fallback Rule-Based NLP Heuristics if offline or AI call fails
  if (!classifiedData) {
    classifiedData = heuristicClassify(cleanDescription);
  }

  if (saveToDb) {
    const insertRes = await executeSQL(
      `INSERT INTO resources (organization_id, description, category, subcategory, quantity, condition, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE')`,
      [
        organizationId,
        cleanDescription,
        classifiedData.category,
        classifiedData.subcategory,
        classifiedData.quantity,
        classifiedData.condition
      ]
    );
    classifiedData.savedResourceId = insertRes.lastInsertId;
  }

  return classifiedData;
}

function heuristicClassify(text: string): ClassificationResult {
  const lower = text.toLowerCase();

  // 1. Quantity extraction
  let quantity = 1;
  const numMatch = lower.match(/\b(\d+)\b/);
  if (numMatch) {
    quantity = parseInt(numMatch[1], 10);
  } else if (lower.includes("a pair of") || lower.includes("two")) {
    quantity = 2;
  } else if (lower.includes("a dozen")) {
    quantity = 12;
  }

  // 2. Condition extraction
  let condition = "Good";
  if (lower.includes("unused") || lower.includes("brand new") || lower.includes("sealed")) {
    condition = "Unused";
  } else if (lower.includes("like new") || lower.includes("barely used") || lower.includes("mint")) {
    condition = "Like New";
  } else if (lower.includes("fair") || lower.includes("used") || lower.includes("acceptable")) {
    condition = "Fair";
  } else if (lower.includes("good condition") || lower.includes("good")) {
    condition = "Good";
  }

  // 3. Category & Subcategory mapping
  let category = "General";
  let subcategory = "General Item";

  if (lower.includes("chair") || lower.includes("stool") || lower.includes("seating")) {
    category = "Furniture";
    subcategory = "Chair";
  } else if (lower.includes("table") || lower.includes("desk")) {
    category = "Furniture";
    subcategory = lower.includes("desk") ? "Desk" : "Table";
  } else if (lower.includes("shelf") || lower.includes("cabinet") || lower.includes("bookshelf")) {
    category = "Furniture";
    subcategory = "Storage/Shelving";
  } else if (lower.includes("notebook") || lower.includes("notepad") || lower.includes("pad")) {
    category = "Educational Supplies";
    subcategory = "Notebook";
  } else if (lower.includes("bag") || lower.includes("backpack") || lower.includes("school bag")) {
    category = "Educational Supplies";
    subcategory = "School Bag";
  } else if (lower.includes("pen") || lower.includes("pencil") || lower.includes("marker") || lower.includes("crayon")) {
    category = "Educational Supplies";
    subcategory = "Writing Instruments";
  } else if (lower.includes("computer") || lower.includes("pc") || lower.includes("desktop")) {
    category = "Technology & Electronics";
    subcategory = "Computer";
  } else if (lower.includes("laptop") || lower.includes("macbook") || lower.includes("chromebook")) {
    category = "Technology & Electronics";
    subcategory = "Laptop";
  } else if (lower.includes("monitor") || lower.includes("screen") || lower.includes("display")) {
    category = "Technology & Electronics";
    subcategory = "Monitor";
  } else if (lower.includes("book") || lower.includes("textbook") || lower.includes("novel")) {
    category = "Books & Media";
    subcategory = "Book";
  } else if (lower.includes("blanket") || lower.includes("sanitizer") || lower.includes("medical") || lower.includes("mask")) {
    category = "Medical & Hygiene";
    subcategory = lower.includes("blanket") ? "Blanket" : "Health Supplies";
  }

  // 4. Keyword extraction
  const tokens = lower
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !["the", "and", "have", "with", "that", "are", "for", "some", "our"].includes(w));
  const keywords = Array.from(new Set(tokens)).slice(0, 5);

  const explanation = `Identified item as ${category} (${subcategory}) with volume count of ${quantity} units in ${condition} condition based on extracted syntactic cues.`;

  return {
    category,
    subcategory,
    quantity,
    condition,
    keywords,
    explanation
  };
}
