import { Elysia } from 'elysia';
import { parse } from '../worker';
import { deleteProductDb, getAllProducts, getProductDb, saveCookiesDb, setProductDb } from '../db/methods';
import { getPageCookies } from '../getCookies';
import { cookiesDb, updateGlobalCookies } from '..';

export const router = new Elysia()
    .get("/", mainpage)
    .post('/set-product/:id', ({params: {id}}) => setProduct(id))
    .post('/delete-product/:id', ({params: {id}}) => deleteProduct(id))
    .get('/parse/:id', ({params: {id}}) => parsing(id))
    .get('/all', () => viewAll())
    .get('/get/:id', ({params: {id}}) => viewCurrent(id))

//парсить по артикулу
async function parsing(id: string){
    try {
        return await parse(id);
    } catch (error: any) {
        const message = error?.message ?? '';
        if(message === 'error 498'){
            console.log("Got 498, refreshing cookies...");

            const newCookies = await getPageCookies();
            updateGlobalCookies(newCookies);
            saveCookiesDb(newCookies);

            console.log('Cookies were updated');

            // один повторный запрос
        }
        throw error;
    }
}

// занести товар в бд как цель парсинга
function setProduct(id: string){
    // проверка на валидность артикула
    const isValid = /^\d{4,12}$/.test(id);;
    if(isValid){
        setProductDb(Number(id));
    } else {
        // артикул невалидный, возвращаем ошибку
        return new Response(
            JSON.stringify({ error: 'Invalid article. Only digits allowed (4–12 characters).' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
// удалить продукт
function deleteProduct(id: string){
    deleteProductDb(Number(id));
}

// смотреть все товары
function viewAll(){
    return getAllProducts();
}

// смотреть определённый товар с историей цены
function viewCurrent(id: string){
    return getProductDb(Number(id));
}

function mainpage(){
    return "Hello, world!";
}