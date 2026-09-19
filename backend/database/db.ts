import initSqlJs, { Database } from "sql.js";
import {
  SEED_ORGANIZATIONS,
  SEED_CATEGORIES,
  SEED_RESOURCES,
  SEED_REQUESTS,
  SEED_TRANSFERS,
  SEED_MATCHES
} from "./demo_data.js";

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create relational tables (ANSI SQL compatible with MySQL 8.0 schema)
  db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      location TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resource_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      condition TEXT NOT NULL DEFAULT 'Good',
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      urgency TEXT NOT NULL DEFAULT 'MEDIUM',
      deadline TEXT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      request_id INTEGER NOT NULL,
      match_score INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'RECOMMENDED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      request_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Populate Organizations
  for (const org of SEED_ORGANIZATIONS) {
    db.run(
      `INSERT INTO organizations (id, name, type, contact_email, location) VALUES (?, ?, ?, ?, ?)`,
      [org.id, org.name, org.type, org.contact_email, org.location]
    );
  }

  // Populate Categories
  for (const cat of SEED_CATEGORIES) {
    db.run(
      `INSERT INTO resource_categories (id, name, description) VALUES (?, ?, ?)`,
      [cat.id, cat.name, cat.description]
    );
  }

  // Populate Resources
  for (const res of SEED_RESOURCES) {
    db.run(
      `INSERT INTO resources (id, organization_id, description, category, subcategory, quantity, condition, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [res.id, res.organization_id, res.description, res.category, res.subcategory, res.quantity, res.condition, res.status, res.created_at]
    );
  }

  // Populate Requests
  for (const req of SEED_REQUESTS) {
    db.run(
      `INSERT INTO requests (id, organization_id, description, category, subcategory, quantity, urgency, deadline, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.id, req.organization_id, req.description, req.category, req.subcategory, req.quantity, req.urgency, req.deadline, req.status, req.created_at]
    );
  }

  // Populate Transfers
  for (const tr of SEED_TRANSFERS) {
    db.run(
      `INSERT INTO transfers (id, resource_id, request_id, quantity, status, transfer_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tr.id, tr.resource_id, tr.request_id, tr.quantity, tr.status, tr.transfer_date, tr.notes]
    );
  }

  // Populate Matches
  for (const m of SEED_MATCHES) {
    db.run(
      `INSERT INTO matches (id, resource_id, request_id, match_score, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.resource_id, m.request_id, m.match_score, m.reason, m.status, m.created_at]
    );
  }

  // Initial Analytics events
  db.run(`INSERT INTO analytics (event_type, details) VALUES ('SYSTEM_INIT', 'Relational database initialized with complete schema and seed dataset')`);
  db.run(`INSERT INTO analytics (event_type, details) VALUES ('INITIAL_TRANSFERS', '2 historical completed resource distributions loaded')`);

  dbInstance = db;
  return db;
}

export async function querySQL<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export async function executeSQL(sql: string, params: any[] = []): Promise<{ lastInsertId: number; rowsModified: number }> {
  const db = await getDatabase();
  db.run(sql, params);
  const res = db.exec("SELECT last_insert_rowid() as id");
  const lastId = (res.length > 0 && res[0].values.length > 0 && res[0].values[0].length > 0) 
    ? Number(res[0].values[0][0]) 
    : 0;
  return { lastInsertId: lastId, rowsModified: 1 };
}

export async function resetDatabaseToDemo(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  await getDatabase();
}
