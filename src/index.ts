import { Elysia } from 'elysia';
import { router } from './routes/router';

import { drizzle } from 'drizzle-orm/postgres-js';

export const db = drizzle(process.env.DATABASE_URL!);

const app = new Elysia()
    .listen(process.env.PORT!)
    .use(router);


console.log(`Hello via Bun! Working on port: ${process.env.PORT}`);

