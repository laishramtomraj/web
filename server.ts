import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { apiRouter } from "./backend/api/router.js";
import { getDatabase } from "./backend/database/db.js";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Parse JSON payloads
  app.use(express.json());

  // Initialize in-memory SQL database
  await getDatabase();
  console.log("Relational database initialized with complete schema and demo data.");

  // Mount API router FIRST before frontend middleware
  app.use("/api", apiRouter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      module: "AI-powered Resource Management, Smart Matching, and Analytics",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server start error:", err);
  process.exit(1);
});
