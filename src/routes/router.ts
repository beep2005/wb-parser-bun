import { Elysia } from 'elysia';
import { parse } from '../worker';
import { deleteProductDb, getAllProducts, getProductDb, setProductDb } from '../db/methods';

export const router = new Elysia()
    .get("/", mainpage)
    .post('/set-product/:id', ({params: {id}}) => setProduct(id))
    .post('/delete-product/:id', ({params: {id}}) => deleteProduct(id))
    .get('/parse/:id', ({params: {id}}) => parsing(id))
    .get('/all', () => viewAll())
    .get('/get/:id', ({params: {id}}) => viewCurrent(id))

//парсить по артикулу
function parsing(id: string){
    return parse(id);
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