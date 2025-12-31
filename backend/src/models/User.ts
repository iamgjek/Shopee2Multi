import { pool } from '../db/connection';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  plan: 'free' | 'pro' | 'biz';
  status: 'active' | 'suspended' | 'deleted';
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(email: string, password: string, name?: string, role: 'user' | 'admin' = 'user'): Promise<User> {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, plan, status, role, created_at, updated_at`,
      [email, password_hash, name, role]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, name, plan, status, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(limit: number = 100, offset: number = 0, search?: string): Promise<{ users: User[]; total: number }> {
    let query = 'SELECT id, email, name, plan, status, role, created_at, updated_at FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params: any[] = [];
    
    if (search) {
      query += ' WHERE email ILIKE $1 OR name ILIKE $1';
      countQuery += ' WHERE email ILIKE $1 OR name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const [usersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, params.length - 2))
    ]);
    
    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  static async updatePlan(userId: string, plan: 'free' | 'pro' | 'biz'): Promise<void> {
    await pool.query(
      'UPDATE users SET plan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [plan, userId]
    );
  }

  static async updateStatus(userId: string, status: 'active' | 'suspended' | 'deleted'): Promise<void> {
    await pool.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, userId]
    );
  }

  static async updateRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [role, userId]
    );
  }

  static async updateUser(userId: string, updates: {
    plan?: 'free' | 'pro' | 'biz';
    status?: 'active' | 'suspended' | 'deleted';
    role?: 'user' | 'admin';
  }): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.plan !== undefined) {
      fields.push(`plan = $${paramIndex++}`);
      values.push(updates.plan);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(updates.role);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
