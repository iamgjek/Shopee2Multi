import { pool } from '../db/connection';

export interface UsageLog {
  id: string;
  user_id: string;
  item_count: number;
  platform_target: string;
  status: 'success' | 'failed' | 'processing';
  latency_ms?: number;
  error_code?: string;
  created_at: Date;
}

export class UsageLogModel {
  static async create(
    userId: string,
    itemCount: number,
    platformTarget: string,
    status: UsageLog['status'],
    latencyMs?: number,
    errorCode?: string
  ): Promise<UsageLog> {
    const result = await pool.query(
      `INSERT INTO usage_logs (user_id, item_count, platform_target, status, latency_ms, error_code) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, itemCount, platformTarget, status, latencyMs, errorCode]
    );
    return result.rows[0];
  }

  static async getDailyUsage(userId: string, date: Date = new Date()): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await pool.query(
      `SELECT COALESCE(SUM(item_count), 0) as total 
       FROM usage_logs 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [userId, startOfDay, endOfDay]
    );
    return parseInt(result.rows[0].total) || 0;
  }

  static async getUsageHistory(userId: string, limit: number = 30): Promise<UsageLog[]> {
    const result = await pool.query(
      `SELECT * FROM usage_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}
