import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = process.env.DATA_DIR || join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'courses.db');
const db = new Database(dbPath);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all courses
app.get('/api/courses', (req, res) => {
  try {
    const row = db.prepare('SELECT data FROM courses WHERE id = ?').get('all');
    if (row) {
      res.json(JSON.parse(row.data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Save all courses (bulk update)
app.post('/api/courses', (req, res) => {
  try {
    const courses = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO courses (id, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run('all', JSON.stringify(courses));
    res.json({ success: true, count: courses.length });
  } catch (error) {
    console.error('Error saving courses:', error);
    res.status(500).json({ error: 'Failed to save courses' });
  }
});

// Get a setting
app.get('/api/settings/:key', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
    if (row) {
      res.json({ value: row.value });
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Save a setting
app.post('/api/settings/:key', (req, res) => {
  try {
    const { value } = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(req.params.key, value);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving setting:', error);
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing database...');
  db.close();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database path: ${dbPath}`);
});

