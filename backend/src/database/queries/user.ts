import Database from "better-sqlite3";
import { join } from "path";

const db: Database.Database = new Database(join(__dirname, "..", "..", "database", "database.db"));

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  date_of_birth: string | null;
  phone_number: string | null;
  post_address: string | null;
  home_address: string | null;
  bank_name: string | null;
  bsb: string | null;
  account_name: string | null;
  account_number: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  date_of_birth: string | null;
  phone_number: string | null;
  post_address: string | null;
  home_address: string | null;
  bank_name: string | null;
  bsb: string | null;
  account_name: string | null;
  account_number: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  date_of_birth?: string;
  phone_number?: string;
  post_address?: string;
  home_address?: string;
  bank_name?: string;
  bsb?: string;
  account_name?: string;
  account_number?: string;
  facebook_url?: string;
  twitter_url?: string;
  youtube_url?: string;
}

export async function getUserById(id: number): Promise<SafeUser | null> {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = stmt.get(id) as User | null;
  if (!user) {
    return null;
  }
  
  // Remove password from response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser as SafeUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as User | null;
}

export async function updateUser(id: number, data: UserUpdateData): Promise<SafeUser | null> {
  const fields = Object.keys(data)
    .filter(key => data[key as keyof UserUpdateData] !== undefined);
  
  if (fields.length === 0) {
    return await getUserById(id);
  }
  
  const setClause = fields.map(field => `${field} = ?`).join(", ");
  const values = fields.map(field => data[field as keyof UserUpdateData]);
  
  const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
  const result = stmt.run(...values, id);
  
  if (result.changes === 0) {
    return null;
  }
  
  return await getUserById(id);
}

export async function getAllUsers(): Promise<SafeUser[]> {
  const stmt = db.prepare("SELECT * FROM users");
  const users = stmt.all() as User[];
  return users.map(user => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser as SafeUser;
  });
} 