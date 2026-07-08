import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const server = Bun.serve({
    port: process.env.PORT,
    fetch(req){
        return new Response("hello");
    }
});


console.log(`Hello via Bun! Working on port: ${process.env.PORT}`);

