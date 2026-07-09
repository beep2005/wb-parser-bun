import { Elysia } from 'elysia';
import { parse } from '../worker';

export const router = new Elysia()
    .get("/", mainpage)
    .post('/set-product', setproduct)
    .get('/parse/:id', ({params: {id}}) => parsing(id));

//парсить по артикулу
function parsing(id: String){
    //const res = parse(id);
    //return res;
    return parse(id);
}

// занести товар в бд как цель парсинга
function setproduct(){
};

function mainpage(){
    return "Hello, world!";
}