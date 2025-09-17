import { drizzle } from 'drizzle-orm/neon-http';
import { withReplicas } from 'drizzle-orm/pg-core';
import * as schema from '@/lib/db/schema';
import { serverEnv } from '@/env/server';
import { upstashCache } from 'drizzle-orm/cache/upstash';
import { neon } from '@neondatabase/serverless';

// Configure neon with better connection handling
const sql = neon(serverEnv.DATABASE_URL);

export const maindb = drizzle(sql, {
  schema,
  cache: upstashCache({
    url: serverEnv.UPSTASH_REDIS_REST_URL,
    token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
    global: true,
    config: { ex: 600 },
  }),
  logger: process.env.NODE_ENV === 'development',
});

// Check if read replica URLs are provided, if not use main database
const readDb1Url = process.env.READ_DB_1;
const readDb2Url = process.env.READ_DB_2;

let db: typeof maindb;

if (readDb1Url && readDb2Url) {
  const sqlread1 = neon(readDb1Url);
  const sqlread2 = neon(readDb2Url);

  const dbread1 = drizzle(sqlread1, {
    schema,
    cache: upstashCache({
      url: serverEnv.UPSTASH_REDIS_REST_URL,
      token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
      global: true,
      config: { ex: 600 },
    }),
    logger: process.env.NODE_ENV === 'development',
  });

  const dbread2 = drizzle(sqlread2, {
    schema,
    cache: upstashCache({
      url: serverEnv.UPSTASH_REDIS_REST_URL,
      token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
      global: true,
      config: { ex: 600 },
    }),
    logger: process.env.NODE_ENV === 'development',
  });

  db = withReplicas(maindb, [dbread1, dbread2]);
} else {
  // Fallback to main database if read replicas are not configured
  console.log('Read replicas not configured, using main database only');
  db = maindb;
}

export { db };
