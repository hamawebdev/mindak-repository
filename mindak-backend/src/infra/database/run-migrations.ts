import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

import { mandatoryEnv, mandatoryIntegerEnv, booleanEnv } from '@/core/env/env';

const runMigrations = async () => {
  const isTest = mandatoryEnv('NODE_ENV') === 'test';

  const config = {
    host: isTest ? mandatoryEnv('TEST_DB_HOST') : mandatoryEnv('DB_HOST'),
    port: isTest ? mandatoryIntegerEnv('TEST_DB_PORT') : mandatoryIntegerEnv('DB_PORT'),
    database: isTest ? mandatoryEnv('TEST_DB_NAME') : mandatoryEnv('DB_NAME'),
    user: mandatoryEnv('DB_USER'),
    password: mandatoryEnv('DB_PASSWORD'),
    ssl: isTest ? false : booleanEnv('DB_SSL', false),
  };

  const pool = new Pool(config);
  const db = drizzle({ client: pool });

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: './src/infra/database/migrations' });

  console.log('Migrations completed successfully!');

  await pool.end();
  process.exit(0);
};

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
