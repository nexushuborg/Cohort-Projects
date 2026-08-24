const env = require('./src/config/env');

module.exports = {
  development: {
    client: 'pg',
    connection: env.databaseUrl,
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  },
  production: {
    client: 'pg',
    connection: env.databaseUrl,
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  },
  test: {
    client: 'pg',
    connection: env.databaseUrl,
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  }
};
