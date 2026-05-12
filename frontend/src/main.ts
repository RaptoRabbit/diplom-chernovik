type Product = { id: number; name: string; price: number; category: string };

type ProductsResponse = { items: Product[] };

const API_BASE = 'http://localhost:8000';

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  return node;
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  const data = (await res.json()) as ProductsResponse;
  return data.items;
}

function render(products: Product[]) {
  const app = document.getElementById('app');
  if (!app) return;

  const styles = `
    :root{font-family:Arial,Helvetica,sans-serif;}
    body{margin:0;background:#f6f6f7;color:#1f2937;}
    header{padding:16px 20px;background:#111827;color:white;position:sticky;top:0;}
    header h1{margin:0;font-size:18px;}
    .wrap{max-width:1100px;margin:0 auto;padding:20px;}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;}
    .card{background:white;border:1px solid #e5e7eb;border-radius:12px;padding:14px;}
    .name{font-weight:700;margin-bottom:6px;}
    .meta{color:#6b7280;font-size:13px;}
    .price{font-size:16px;font-weight:700;margin-top:10px;}
    .hint{color:#6b7280;margin-top:10px;font-size:13px;}
  `;

  app.innerHTML = `
    <style>${styles}</style>
    <header><h1>Handmade Marketplace</h1></header>
    <div class='wrap'>
      <h2>Каталог</h2>
      <div class='grid' id='grid'></div>
      <div class='hint'>Демо: фронт запрашивает товары с бэкенда по /api/products</div>
    </div>
  `;

  const grid = document.getElementById('grid');
  if (!grid) return;

  for (const p of products) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class='name'>${p.name}</div>
      <div class='meta'>Категория: ${p.category}</div>
      <div class='price'>${formatPrice(p.price)}</div>
    `;
    grid.appendChild(card);
  }
}

(async function main() {
  const products = await fetchProducts();
  render(products);
})();

