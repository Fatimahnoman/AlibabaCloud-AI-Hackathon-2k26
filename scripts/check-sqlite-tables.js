const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db.backup');
console.log(`Opening SQLite database: ${dbPath}\n`);
const sqlite = new Database(dbPath, { readonly: true });

// Get all tables
const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

console.log('Tables in SQLite database:');
tables.forEach(t => {
  const count = sqlite.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get();
  console.log(`  - ${t.name}: ${count.count} rows`);
});

sqlite.close();
