/**
 * Migration: Create product_skus and sku_variants tables
 *
 * Follows PRD schema exactly:
 * - product_skus: id, product_id FK, sku_code (unique), price_override, stock_quantity, status, created_at, updated_at
 * - sku_variants: id, sku_id FK, variant_option_id FK, UNIQUE(sku_id, variant_option_id)
 *
 * stock_quantity has CHECK (stock_quantity >= 0) per PRD.
 * status column added per Person 2 Task (draft, active, inactive).
 */

exports.up = function (knex) {
  return knex.schema
    .createTable('product_skus', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.string('sku_code', 100).notNullable().unique();
      table.decimal('price_override', 10, 2).nullable();
      table.integer('stock_quantity').notNullable().defaultTo(0);
      table
        .string('status', 20)
        .notNullable()
        .defaultTo('draft')
        .checkIn(['draft', 'active', 'inactive']);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema.raw(
        'CREATE INDEX idx_product_skus_product ON product_skus(product_id)'
      );
    })
    .then(() => {
      return knex.schema.raw(
        'ALTER TABLE product_skus ADD CONSTRAINT check_stock CHECK (stock_quantity >= 0)'
      );
    })
    .then(() => {
      return knex.schema.createTable('sku_variants', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('sku_id').notNullable().references('id').inTable('product_skus').onDelete('CASCADE');
        table.uuid('variant_option_id').notNullable().references('id').inTable('variant_options');
        table.unique(['sku_id', 'variant_option_id']);
      });
    })
    .then(() => {
      return knex.schema.raw(
        'CREATE INDEX idx_sku_variants_sku ON sku_variants(sku_id)'
      );
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('sku_variants')
    .then(() => knex.schema.dropTableIfExists('product_skus'));
};
