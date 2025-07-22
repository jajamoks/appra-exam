import db from "../database";
import { VerificationCode, AuditLog } from "../../types/verification";

export async function createVerificationCode(
  userId: number,
  code: string,
  expiresAt: Date,
): Promise<VerificationCode> {
  const stmt = db.prepare(
    "INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)",
  );
  const result = stmt.run(userId, code, expiresAt.toISOString());
  
  const selectStmt = db.prepare(
    "SELECT * FROM verification_codes WHERE id = ?",
  );
  return selectStmt.get(result.lastInsertRowid) as VerificationCode;
}

export async function getVerificationCode(
  userId: number,
  code: string,
): Promise<VerificationCode | null> {
  const stmt = db.prepare(
    "SELECT * FROM verification_codes WHERE user_id = ? AND code = ? AND used_at IS NULL",
  );
  return stmt.get(userId, code) as VerificationCode | null;
}

export async function markVerificationCodeAsUsed(
  codeId: number,
): Promise<void> {
  const stmt = db.prepare(
    "UPDATE verification_codes SET used_at = CURRENT_TIMESTAMP WHERE id = ?",
  );
  stmt.run(codeId);
}

export async function cleanupExpiredCodes(): Promise<void> {
  const stmt = db.prepare(
    "DELETE FROM verification_codes WHERE expires_at < CURRENT_TIMESTAMP",
  );
  stmt.run();
}

export async function createAuditLog(
  userId: number,
  eventType: string,
  eventData?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<AuditLog> {
  const stmt = db.prepare(
    "INSERT INTO audit_logs (user_id, event_type, event_data, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
  );
  const result = stmt.run(userId, eventType, eventData || null, ipAddress || null, userAgent || null);
  
  const selectStmt = db.prepare(
    "SELECT * FROM audit_logs WHERE id = ?",
  );
  return selectStmt.get(result.lastInsertRowid) as AuditLog;
}

export async function checkRateLimit(
  userId: number,
  requestType: string,
  limit: number,
  windowMinutes: number,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const cleanupStmt = db.prepare(
    "DELETE FROM rate_limits WHERE window_start < ?",
  );
  cleanupStmt.run(windowStart.toISOString());
  
  const stmt = db.prepare(
    "SELECT SUM(request_count) as total FROM rate_limits WHERE user_id = ? AND request_type = ? AND window_start > ?",
  );
  const result = stmt.get(userId, requestType, windowStart.toISOString()) as { total: number | null };
  
  const currentCount = result.total || 0;
  return currentCount < limit;
}

export async function incrementRateLimit(
  userId: number,
  requestType: string,
): Promise<void> {
  const stmt = db.prepare(
    "INSERT INTO rate_limits (user_id, request_type, request_count) VALUES (?, ?, 1)",
  );
  stmt.run(userId, requestType);
}