import { Elysia } from 'elysia';
import { router } from './routes/router';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const app = new Elysia()
    .listen(process.env.PORT!)
    .use(router);


console.log(`Hello via Bun! Working on port: ${process.env.PORT}`);

