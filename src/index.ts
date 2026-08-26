import { Elysia } from 'elysia';
import { router } from './routes/router';

import { getCookiesDb, getProductsToParse, saveCookiesDb } from './db/methods';
import { getPageCookies } from './getCookies';
import { startController } from './controller';

const app = new Elysia()
    .listen(process.env.PORT!)
    .use(router);

console.log(`Hello via Bun! Working on port: ${process.env.PORT}`);

// initializing 1-level cache of cookies
export let cookiesDb = await getCookiesDb()

// check if there is any cookies
if(cookiesDb == null){
    cookiesDb = await getPageCookies();
    saveCookiesDb(cookiesDb);
}

// starting controller to auto parse products
startController();

// method to update global varuable (1-level cache)
export async function updateGlobalCookies(newCookies: string){
    cookiesDb = newCookies;
}

