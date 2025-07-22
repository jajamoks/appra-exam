import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

const db: Database.Database = new Database(join(__dirname, "..", "database", "database.db"));

export function initializeDatabase(): void {
  const schema = readFileSync(join(__dirname, "..", "database", "schema.sql"), "utf8");
  db.exec(schema);
  
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const seedData = readFileSync(join(__dirname, "..", "database", "seed.sql"), "utf8");
    db.exec(seedData);
  }
}

export default db;