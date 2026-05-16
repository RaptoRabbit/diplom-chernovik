import express from 'express';
import cors from 'cors';

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function ensureSchemaAndSeed() {
  if (process.env.SKIP_DB_SCHEMA === 'true') return;

  const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);

  if (process.env.SEED_DEMO === 'true') {
    const seedPath = path.join(process.cwd(), 'src', 'db', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seed);
    }
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ ok: true, db: 'up' });
  } catch {
    return res.status(500).json({ ok: false, db: 'down' });
  }
});

app.get('/api/products', async (req, res) => {
  const category = req.query.category;

  const sql = `
    SELECT
      p.id,
      p.title AS name,
      p.price,
      c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'ACTIVE'
      ${category ? 'AND c.name = $1' : ''}
    ORDER BY p.id;
  `;

  const params = category ? [String(category)] : [];

  try {
    const { rows } = await pool.query(sql, params);
    return res.json({ items: rows });
  } catch {
    return res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const { rows } = await pool.query(
      `
        SELECT
          p.id,
          p.title AS name,
          p.price,
          c.name AS category
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = $1 AND p.status = 'ACTIVE'
        LIMIT 1;
      `,
      [id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ error: 'DB error' });
  }
});

app.listen(8000, async () => {
  console.log('Backend API listening on :8000');
  try {
    await ensureSchemaAndSeed();
    console.log('DB schema ensured');
  } catch (e) {
    console.error('DB schema error', e);
  }
});


