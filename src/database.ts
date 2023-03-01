import { knex as setupKnex, Knex } from 'knex'
import { env } from './env';
export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
}

export const knex = setupKnex(config)

// npm run knex -- migrate:make create-documents
// npm run knex -- migrate:rollback
// npm run knex -- migrate:latest