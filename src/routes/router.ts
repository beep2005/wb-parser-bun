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
        console.log(message);
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
    setProductDb(Number(id));
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