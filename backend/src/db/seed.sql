-- Seed demo data

-- Create a demo seller user
INSERT INTO users (role, name, email, password_hash)
VALUES ('SELLER', 'Ирина Рукодельница', 'seller@example.com', 'demo_hash')
ON CONFLICT (email) DO NOTHING;

-- Seller profile
INSERT INTO seller_profiles (user_id, shop_name, description, avatar_url)
SELECT u.id, 'Мастерская Ирины', 'Хендмейд изделия', NULL
FROM users u
WHERE u.email = 'seller@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- Categories
INSERT INTO categories (name)
VALUES ('Свечи'), ('Керамика'), ('Вязание')
ON CONFLICT (name) DO NOTHING;

-- Products
WITH s AS (
  SELECT id AS seller_id FROM users WHERE email='seller@example.com' LIMIT 1
),
items AS (
  SELECT 'Свечи'   AS cat, 'Свеча ручной работы'   AS title, 'Свечи и ароматы' AS description, 1200.00::numeric AS price UNION ALL
  SELECT 'Керамика' AS cat, 'Керамическая кружка' AS title, 'Тёплая керамика' AS description,  900.00::numeric AS price UNION ALL
  SELECT 'Вязание'  AS cat, 'Вязаная шапка'        AS title, 'Мягкая шерсть'    AS description, 1500.00::numeric AS price
)
INSERT INTO products (seller_id, category_id, title, description, price, currency, status)
SELECT
  s.seller_id,
  c.id,
  i.title,
  i.description,
  i.price,
  'RUB',
  'ACTIVE'
FROM s
JOIN items i ON true
JOIN categories c ON c.name = i.cat
ON CONFLICT DO NOTHING;


