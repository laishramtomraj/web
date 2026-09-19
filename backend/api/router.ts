import express, { Request, Response } from "express";
import { classifyResource } from "../services/classifier.js";
import { calculateRequestPriority, getPriorityWeights, updatePriorityWeights } from "../services/priority.js";
import { matchResource } from "../services/matching.js";
import { processNaturalLanguageQuery } from "../services/nlAnalytics.js";
import { runFullAnalytics } from "../services/pythonAnalytics.js";
import { querySQL, executeSQL, resetDatabaseToDemo } from "../database/db.js";

export const apiRouter = express.Router();

// ==========================================
// 1. AI Resource Classification
// ==========================================
apiRouter.post("/ai/classify-resource", async (req: Request, res: Response) => {
  try {
    const { description, saveToDb = true, organizationId = 1 } = req.body;
    if (!description || typeof description !== "string") {
      res.status(400).json({ error: "Missing or invalid 'description' parameter" });
      return;
    }
    const result = await classifyResource(description, Boolean(saveToDb), Number(organizationId) || 1);
    res.json(result);
  } catch (error: any) {
    console.error("Classification error:", error);
    res.status(500).json({ error: error.message || "Failed to classify resource" });
  }
});

// ==========================================
// 2. Priority Recommendation & Weights
// ==========================================
apiRouter.post("/ai/calculate-priority", async (req: Request, res: Response) => {
  try {
    const { requestId, customWeights } = req.body;
    if (!requestId) {
      res.status(400).json({ error: "Missing 'requestId' parameter" });
      return;
    }
    const result = await calculateRequestPriority(Number(requestId), customWeights);
    res.json(result);
  } catch (error: any) {
    console.error("Priority calculation error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate priority" });
  }
});

apiRouter.get("/ai/priority-weights", (req: Request, res: Response) => {
  res.json(getPriorityWeights());
});

apiRouter.post("/ai/priority-weights", (req: Request, res: Response) => {
  try {
    const updated = updatePriorityWeights(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid priority weights" });
  }
});

// ==========================================
// 3. Smart Resource-to-Request Matching
// ==========================================
apiRouter.post("/ai/match-resource", async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body;
    if (!resourceId) {
      res.status(400).json({ error: "Missing 'resourceId' parameter" });
      return;
    }
    const result = await matchResource(Number(resourceId));
    res.json(result);
  } catch (error: any) {
    console.error("Matching error:", error);
    res.status(500).json({ error: error.message || "Failed to match resource" });
  }
});

// ==========================================
// 4. Natural-Language Analytics Assistant
// ==========================================
apiRouter.post("/ai/natural-language-query", async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Missing or invalid 'question' parameter" });
      return;
    }
    const result = await processNaturalLanguageQuery(question);
    res.json(result);
  } catch (error: any) {
    console.error("NL Analytics error:", error);
    res.status(400).json({ error: error.message || "Query validation or execution error" });
  }
});

// ==========================================
// 5. Python & Pandas Analytics Endpoints
// ==========================================
apiRouter.get("/analytics/full", async (req: Request, res: Response) => {
  try {
    const analytics = await runFullAnalytics();
    res.json(analytics);
  } catch (error: any) {
    console.error("Analytics suite error:", error);
    res.status(500).json({ error: error.message || "Failed to generate analytics" });
  }
});

apiRouter.get("/analytics/resource-statistics", async (req: Request, res: Response) => {
  try {
    const analytics = await runFullAnalytics();
    res.json(analytics.resourceStatistics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/analytics/transfer-trends", async (req: Request, res: Response) => {
  try {
    const analytics = await runFullAnalytics();
    res.json(analytics.transferTrends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/analytics/category-analysis", async (req: Request, res: Response) => {
  try {
    const analytics = await runFullAnalytics();
    res.json(analytics.categoryAnalysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/analytics/organization-activity", async (req: Request, res: Response) => {
  try {
    const analytics = await runFullAnalytics();
    res.json(analytics.organizationActivity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/analytics/success-rate", async (req: Request, res: Response) => {
  try {
    const analytics = await runFullAnalytics();
    res.json(analytics.successRate);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. Real-Time Relational Data Endpoints
// ==========================================
apiRouter.get("/data/resources", async (req: Request, res: Response) => {
  try {
    const rows = await querySQL(`
      SELECT r.*, o.name as org_name, o.location as org_location 
      FROM resources r 
      JOIN organizations o ON r.organization_id = o.id 
      ORDER BY r.id DESC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/data/requests", async (req: Request, res: Response) => {
  try {
    const rows = await querySQL(`
      SELECT req.*, o.name as org_name, o.location as org_location 
      FROM requests req 
      JOIN organizations o ON req.organization_id = o.id 
      ORDER BY req.id DESC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/data/transfers", async (req: Request, res: Response) => {
  try {
    const rows = await querySQL(`
      SELECT t.*, res.description as resource_desc, req.description as request_desc,
             res_org.name as donor_org, req_org.name as recipient_org
      FROM transfers t
      LEFT JOIN resources res ON t.resource_id = res.id
      LEFT JOIN requests req ON t.request_id = req.id
      LEFT JOIN organizations res_org ON res.organization_id = res_org.id
      LEFT JOIN organizations req_org ON req.organization_id = req_org.id
      ORDER BY t.transfer_date DESC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/data/organizations", async (req: Request, res: Response) => {
  try {
    const rows = await querySQL(`SELECT * FROM organizations ORDER BY id ASC`);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/data/execute-match-transfer", async (req: Request, res: Response) => {
  try {
    const { resourceId, requestId, quantity, notes } = req.body;
    if (!resourceId || !requestId) {
      res.status(400).json({ error: "resourceId and requestId are required" });
      return;
    }

    const resRows = await querySQL("SELECT * FROM resources WHERE id = ?", [resourceId]);
    const reqRows = await querySQL("SELECT * FROM requests WHERE id = ?", [requestId]);

    if (resRows.length === 0 || reqRows.length === 0) {
      res.status(404).json({ error: "Resource or request not found" });
      return;
    }

    const resource = resRows[0];
    const request = reqRows[0];
    const transferQty = Number(quantity) || Math.min(resource.quantity, request.quantity);

    // 1. Insert transfer
    const transferInsert = await executeSQL(
      `INSERT INTO transfers (resource_id, request_id, quantity, status, notes) 
       VALUES (?, ?, ?, 'COMPLETED', ?)`,
      [resourceId, requestId, transferQty, notes || `Smart match transfer executed via AI allocation engine`]
    );

    // 2. Update resource
    if (resource.quantity <= transferQty) {
      await executeSQL(`UPDATE resources SET status = 'TRANSFERRED', quantity = 0 WHERE id = ?`, [resourceId]);
    } else {
      await executeSQL(`UPDATE resources SET quantity = quantity - ? WHERE id = ?`, [transferQty, resourceId]);
    }

    // 3. Update request
    await executeSQL(`UPDATE requests SET status = 'FULFILLED' WHERE id = ?`, [requestId]);

    // 4. Update match status if exists
    await executeSQL(`UPDATE matches SET status = 'ACCEPTED' WHERE resource_id = ? AND request_id = ?`, [resourceId, requestId]);

    res.json({
      success: true,
      transferId: transferInsert.lastInsertId,
      transferredQuantity: transferQty,
      message: `Successfully executed transfer of ${transferQty} units.`
    });
  } catch (err: any) {
    console.error("Execute transfer error:", err);
    res.status(500).json({ error: err.message || "Failed to execute transfer" });
  }
});

apiRouter.post("/data/reset-demo", async (req: Request, res: Response) => {
  try {
    await resetDatabaseToDemo();
    res.json({ success: true, message: "Database reset to initial demo state" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
