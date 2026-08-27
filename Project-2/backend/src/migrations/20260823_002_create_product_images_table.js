/**
 * Migration: Create product_images table
 *
 * Follows PRD schema exactly:
 * - id UUID PK
 * - product_id UUID FK → products(id) ON DELETE CASCADE
 * - url TEXT NOT NULL
 * - sort_order INTEGER DEFAULT 0
 * - created_at TIMESTAMP DEFAULT NOW()
 *
 * Primary image convention: sort_order = 0 is primary.
 * When a new primary is set, old primary gets sort_order bumped to 1+,
 * and the new one is set to 0.
 */

exports.up = function (knex) {
  return knex.schema.createTable('product_images', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.text('url').notNullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  }).then(() => {
    return knex.schema.raw(
      'CREATE INDEX idx_product_images_product ON product_images(product_id)'
    );
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('product_images');
};
