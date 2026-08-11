import { Elysia } from 'elysia';
import { router } from './routes/router';

import { getCookiesDb, saveCookiesDb } from './db/methods';
import { getPageCookies } from './getCookies';

const app = new Elysia()
    .listen(process.env.PORT!)
    .use(router);

console.log(`Hello via Bun! Working on port: ${process.env.PORT}`);

export let cookiesDb = await getCookiesDb()

if(cookiesDb == null){
    cookiesDb = await getPageCookies();
    saveCookiesDb(cookiesDb);
    console.log(cookiesDb);
    console.log('Cookies were saved into db');
}

