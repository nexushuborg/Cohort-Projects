/**
 * Migration: Create products table
 * 
 * NOTE: store_id and category_id columns are created WITHOUT foreign key constraints
 * because the stores and categories tables are owned by Person 1 and may not exist yet.
 * 
 * When Person 1 creates the stores and categories tables, add FK constraints:
 *   - table.foreign('store_id').references('id').inTable('stores').onDelete('CASCADE');
 *   - table.foreign('category_id').references('id').inTable('categories');
 */

exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('store_id').notNullable(); // FK → stores(id) — Person 1
    table.uuid('category_id');            // FK → categories(id) — Person 1
    table.string('name', 255).notNullable();
    table.string('slug', 255).notNullable().unique();
    table.text('description');
    table.string('brand', 255);
    table.decimal('price', 10, 2).notNullable();
    table
      .string('status', 20)
      .defaultTo('draft')
      .checkIn(['draft', 'active', 'archived']);
    table.timestamps(true, true);

    // Indexes for search and filtering
    table.index('store_id');
    table.index('category_id');
    table.index('status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('products');
};
