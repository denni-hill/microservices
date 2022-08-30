// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  default: {
    client: "pg",
    connection: {
      host: process.env.DATABASE_HOST,
      port: "5432",
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },
  test: {
    client: "pg",
    connection: {
      host: "localhost",
      port: process.env.DATABASE_PORT || "5432",
      database: process.env.DATABASE_NAME || "auth_database",
      user: process.env.DATABASE_USER || "auth_service_user",
      password: process.env.DATABASE_PASSWORD || "AuthUserPassword"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
