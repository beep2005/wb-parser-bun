import { Elysia } from 'elysia';

export const router = new Elysia()
    .get("/", mainpage);

function mainpage(){
    return "Hello, world!";
}