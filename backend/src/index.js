import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory demo data
const products = [
  { id: 1, name: 'Свеча ручной работы', price: 1200, category: 'Свечи' },
  { id: 2, name: 'Керамическая кружка', price: 900, category: 'Керамика' },
  { id: 3, name: 'Вязаная шапка', price: 1500, category: 'Вязание' }
];

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/products', (_req, res) => {
  res.json({ items: products });
});

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.listen(8000, () => {
  console.log('Backend API listening on :8000');
});

