import { pool } from '../db/connection';

export interface ConversionTask {
  id: string;
  user_id: string;
  source_url: string;
  platform_target: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payload_json?: any;
  result_path?: string;
  error_message?: string;
  created_at: Date;
  completed_at?: Date;
}

export class ConversionTaskModel {
  static async create(
    userId: string,
    sourceUrl: string,
    platformTarget: string
  ): Promise<ConversionTask> {
    const result = await pool.query(
      `INSERT INTO conversion_tasks (user_id, source_url, platform_target) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, sourceUrl, platformTarget]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<ConversionTask | null> {
    const result = await pool.query(
      'SELECT * FROM conversion_tasks WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<ConversionTask[]> {
    const result = await pool.query(
      `SELECT * FROM conversion_tasks 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async updateStatus(
    id: string,
    status: ConversionTask['status'],
    resultPath?: string,
    errorMessage?: string
  ): Promise<void> {
    await pool.query(
      `UPDATE conversion_tasks 
       SET status = $1, result_path = $2, error_message = $3, completed_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [status, resultPath, errorMessage, id]
    );
  }

  static async countByUserId(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM conversion_tasks WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count) || 0;
  }
}
