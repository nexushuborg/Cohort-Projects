/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. Force clear the ghost table if it's lingering from previous runs
  await knex.schema.raw('DROP TABLE IF EXISTS "users" CASCADE;');
  
  // 2. Build the table clean
  return knex.schema.createTable("users", (table) => {
    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.string("name", 100).notNullable();
    table.string("avatar", 500).nullable(); // Leave this as "avatar" so the next file can rename it!
    table.string("timezone", 50).nullable().defaultTo("UTC");

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  return knex.schema.raw('DROP TABLE IF EXISTS "users" CASCADE;');
};
