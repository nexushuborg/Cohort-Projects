exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('name', 255).notNullable();
      table.string('phone', 20);
      table.text('avatar_url');
      table.timestamps(true, true);
    })
    .createTable('driver_profiles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').notNullable().unique().onDelete('CASCADE');
      table.string('status', 20).defaultTo('offline');
      table.string('license_number', 100);
      table.boolean('is_verified').defaultTo(false);
      table.decimal('avg_rating', 3, 2).defaultTo(0.00);
      table.integer('total_trips').defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('vehicles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('driver_id').references('id').inTable('driver_profiles').notNullable().onDelete('CASCADE');
      table.string('make', 100).notNullable();
      table.string('model', 100).notNullable();
      table.integer('year').notNullable();
      table.string('color', 50).notNullable();
      table.string('license_plate', 20).notNullable();
      table.integer('seat_count').notNullable();
      table.text('photo_url');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable('rides', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('driver_id').references('id').inTable('driver_profiles').notNullable();
      table.uuid('vehicle_id').references('id').inTable('vehicles').notNullable();
      table.text('origin_address').notNullable();
      table.decimal('origin_lat', 10, 8).notNullable();
      table.decimal('origin_lng', 11, 8).notNullable();
      table.string('origin_city', 100).notNullable();
      table.text('destination_address').notNullable();
      table.decimal('destination_lat', 10, 8).notNullable();
      table.decimal('destination_lng', 11, 8).notNullable();
      table.string('destination_city', 100).notNullable();
      table.timestamp('departure_at').notNullable();
      table.integer('total_seats').notNullable();
      table.integer('available_seats').notNullable();
      table.decimal('price_per_seat', 10, 2).notNullable();
      table.text('notes');
      table.string('status', 20).defaultTo('active');
      table.timestamps(true, true);
    })
    .createTable('ride_bookings', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('ride_id').references('id').inTable('rides').notNullable();
      table.uuid('rider_id').references('id').inTable('users').notNullable();
      table.integer('seats_booked').notNullable().defaultTo(1);
      table.decimal('total_amount', 10, 2).notNullable();
      table.text('message');
      table.string('status', 20).defaultTo('requested');
      table.timestamps(true, true);
    })
    .createTable('payments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('booking_id').references('id').inTable('ride_bookings').notNullable();
      table.uuid('rider_id').references('id').inTable('users').notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.string('method', 50).notNullable();
      table.string('status', 20).defaultTo('pending');
      table.string('transaction_id', 255);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('wallet', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('driver_id').references('id').inTable('driver_profiles').notNullable().unique();
      table.decimal('balance', 10, 2).defaultTo(0.00);
      table.decimal('total_earned', 10, 2).defaultTo(0.00);
      table.decimal('total_withdrawn', 10, 2).defaultTo(0.00);
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('wallet_transactions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('wallet_id').references('id').inTable('wallet').notNullable();
      table.string('type', 20).notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.text('description');
      table.uuid('ride_id').references('id').inTable('rides');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('ride_ratings', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('ride_id').references('id').inTable('rides').notNullable();
      table.uuid('booking_id').references('id').inTable('ride_bookings').notNullable();
      table.uuid('from_user_id').references('id').inTable('users').notNullable();
      table.uuid('to_user_id').references('id').inTable('users').notNullable();
      table.integer('rating').notNullable();
      table.text('text');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('recent_searches', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').notNullable();
      table.string('origin', 255).notNullable();
      table.string('destination', 255).notNullable();
      table.date('search_date');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('recent_searches')
    .dropTableIfExists('ride_ratings')
    .dropTableIfExists('wallet_transactions')
    .dropTableIfExists('wallet')
    .dropTableIfExists('payments')
    .dropTableIfExists('ride_bookings')
    .dropTableIfExists('rides')
    .dropTableIfExists('vehicles')
    .dropTableIfExists('driver_profiles')
    .dropTableIfExists('users');
};