export interface SQLValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedSQL?: string;
  tableMatches: string[];
}

const APPROVED_TABLES = new Set([
  "organizations",
  "users",
  "resource_categories",
  "resources",
  "requests",
  "matches",
  "transfers",
  "analytics"
]);

const FORBIDDEN_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "ALTER",
  "TRUNCATE",
  "CREATE",
  "REPLACE",
  "GRANT",
  "REVOKE",
  "EXEC",
  "EXECUTE",
  "PRAGMA",
  "ATTACH",
  "DETACH",
  "OUTFILE",
  "LOAD_FILE",
  "INFORMATION_SCHEMA",
  "BENCHMARK",
  "SLEEP"
];

export function validateSQL(sql: string): SQLValidationResult {
  if (!sql || typeof sql !== "string") {
    return { isValid: false, error: "SQL query string is missing or empty.", tableMatches: [] };
  }

  // Remove markdown code fences if model returned them
  let sanitized = sql
    .replace(/^```(sql)?/i, "")
    .replace(/```$/i, "")
    .trim();

  // Remove single trailing semicolon
  if (sanitized.endsWith(";")) {
    sanitized = sanitized.slice(0, -1).trim();
  }

  // Prevent multiple queries stacked with semicolons
  if (sanitized.includes(";")) {
    return {
      isValid: false,
      error: "Multiple statements separated by semicolon are forbidden for security.",
      tableMatches: []
    };
  }

  const upper = sanitized.toUpperCase();

  // 1. MUST start with SELECT
  if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
    return {
      isValid: false,
      error: "Only read-only SELECT queries are permitted.",
      tableMatches: []
    };
  }

  // 2. Check for blocked DML/DDL operations
  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(upper)) {
      return {
        isValid: false,
        error: `Security violation: Query contains blocked keyword '${keyword}'. Modifying or inspecting system tables is forbidden.`,
        tableMatches: []
      };
    }
  }

  // 3. Table whitelist validation
  // Extract table names following FROM or JOIN
  const tableRegex = /\b(?:FROM|JOIN)\s+([`"]?)([a-zA-Z0-9_]+)\1/gi;
  const tablesFound: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(sanitized)) !== null) {
    const tableName = match[2].toLowerCase();
    tablesFound.push(tableName);
  }

  if (tablesFound.length === 0) {
    // Queries like SELECT 1 or SELECT date() are safe, but analytics should target our tables
    return {
      isValid: false,
      error: "Query must reference approved system tables.",
      tableMatches: []
    };
  }

  for (const tbl of tablesFound) {
    if (!APPROVED_TABLES.has(tbl)) {
      return {
        isValid: false,
        error: `Access Denied: Table '${tbl}' is not in the approved database schema whitelist. Approved tables: ${Array.from(APPROVED_TABLES).join(", ")}.`,
        tableMatches: tablesFound
      };
    }
  }

  return {
    isValid: true,
    sanitizedSQL: sanitized,
    tableMatches: tablesFound
  };
}
