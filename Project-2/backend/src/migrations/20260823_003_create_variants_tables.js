/**
 * Migration: Create variant_types and variant_options tables
 *
 * Follows PRD schema exactly:
 * - variant_types: id, product_id FK, name, created_at
 * - variant_options: id, variant_type_id FK, value, created_at
 *
 * Business logic constraints (enforced in service):
 * - Unique variant type name per product
 * - Unique option value per variant type
 */

exports.up = function (knex) {
  return knex.schema
    .createTable('variant_types', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.string('name', 100).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema.raw(
        'CREATE INDEX idx_variant_types_product ON variant_types(product_id)'
      );
    })
    .then(() => {
      return knex.schema.createTable('variant_options', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('variant_type_id').notNullable().references('id').inTable('variant_types').onDelete('CASCADE');
        table.string('value', 100).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    })
    .then(() => {
      return knex.schema.raw(
        'CREATE INDEX idx_variant_options_type ON variant_options(variant_type_id)'
      );
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('variant_options')
    .then(() => knex.schema.dropTableIfExists('variant_types'));
};
