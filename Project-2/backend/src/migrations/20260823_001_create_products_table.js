/**
 * Migration: Create products table
 *
 * Follows the PRD schema (title, not name).
 * Includes slug and brand for marketplace functionality.
 * Uses IF NOT EXISTS for compatibility with schema.sql.
 *
 * NOTE: store_id and category_id FKs reference tables created by Person 1.
 */

exports.up = function (knex) {
  return knex.schema.raw(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      brand VARCHAR(255),
      price DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `).then(() => knex.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_store') THEN
        CREATE INDEX idx_products_store ON products(store_id);
      END IF;
    END $$;
  `)).then(() => knex.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_category') THEN
        CREATE INDEX idx_products_category ON products(category_id);
      END IF;
    END $$;
  `)).then(() => knex.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_status') THEN
        CREATE INDEX idx_products_status ON products(status);
      END IF;
    END $$;
  `));
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('products');
};
