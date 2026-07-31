import { Elysia } from 'elysia';
import { parse } from '../worker';

export const router = new Elysia()
    .get("/", mainpage)
    .post('/set-product/:id', ({params: {id}}) => setProduct(id))
    .post('/delete-product/:id', ({params: {id}}) => deleteProduct(id))
    .get('/parse/:id', ({params: {id}}) => parsing(id));

//парсить по артикулу
function parsing(id: string){
    return parse(id);
}

// занести товар в бд как цель парсинга
function setProduct(id: string){
};
// удалить продукт
function deleteProduct(id: string){

}

// смотреть все товары
function viewAll(){

}

// смотреть определённый товар с историей цены
function viewCurrent(id: string){

}

function mainpage(){
    return "Hello, world!";
}