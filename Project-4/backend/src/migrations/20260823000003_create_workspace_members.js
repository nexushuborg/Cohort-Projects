/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('workspace_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('workspace_id').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('role', 20).notNullable().defaultTo('member');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.unique(['workspace_id', 'user_id']);
    table.index(['user_id'], 'idx_workspace_members_user');
    table.index(['workspace_id'], 'idx_workspace_members_workspace');
  }).then(() => {
    return knex.raw("ALTER TABLE workspace_members ADD CONSTRAINT chk_workspace_members_role CHECK (role IN ('owner', 'admin', 'member'))");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workspace_members');
};
