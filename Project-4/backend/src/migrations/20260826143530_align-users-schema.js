exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.renameColumn("avatar", "avatar_url");
    table.string("name", 255).alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("users", function(table) {
    table.renameColumn("avatar_url", "avatar");
    table.string("name", 100).alter();
  });
};
