import { pool } from '../db/connection';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export class ContactModel {
  static async create(
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<ContactSubmission> {
    const result = await pool.query(
      `INSERT INTO contact_submissions (name, email, subject, message) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, subject, message]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<ContactSubmission | null> {
    const result = await pool.query(
      'SELECT * FROM contact_submissions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(
    limit: number = 100,
    offset: number = 0,
    status?: string
  ): Promise<{ submissions: ContactSubmission[]; total: number }> {
    let query = 'SELECT * FROM contact_submissions';
    let countQuery = 'SELECT COUNT(*) as total FROM contact_submissions';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      countQuery += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [submissionsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, params.length - 2))
    ]);

    return {
      submissions: submissionsResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  static async updateStatus(
    id: string,
    status: 'new' | 'read' | 'replied' | 'archived'
  ): Promise<void> {
    await pool.query(
      'UPDATE contact_submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
  }
}

