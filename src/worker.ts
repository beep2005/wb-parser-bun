import { Elysia } from 'elysia';
import { URL } from 'url';
import { getCookiesDb, saveCookiesDb } from './db/methods.ts';
import { cookiesDb } from './index.ts';
import { getPageCookies } from './getCookies.ts';

// ошибка 498 - просрочены куки -> они ЕСТЬ, но они не ТЕ ->
// поэтому помогает чистка кешэ браузера

interface WBSizes {
    price: {
        product: number;
    }
    stocks:[];
}
interface WBProduct {
    name: string;
    pics: number;
    sizes: WBSizes[];
}
interface WBResponse{
    products: WBProduct[];
}

const url = new URL(process.env.WB_CARD_URL!);
const base_pics_url = (process.env.PICS_URL!) as string;

export async function parse(id: string){
    url.searchParams.set('nm', id);
    if(!cookiesDb){
        throw new Error('Cookies are empty')
    }
    console.log("Sending request to WB...")
    const response = await fetch(url, {
        headers: {
            "Cookie": cookiesDb,
            "deviceid": process.env.deviceid!,
        },
    });
    console.log(response);
    if(!response.ok){
        throw new Error(`error ${response.status}`)
    }
    const data = await response.json() as WBResponse;
    const product = data.products[0];
    if(!product){
        throw new Error("No product with such article")
    };
    const { name, sizes } = product;
    if(sizes[0]!.stocks.length === 0){
        throw new Error('Product is out of stock')
    }
    const price = sizes[0]!.price.product/100;
    const res = { name, price };
    return res;
}

async function getBasket(id: string){
    const part = id.slice(0, -3);
    const vol = id.slice(0, -5);
    return {part, vol};
}

// нужно получить правильную ссылку (с/без mow-)
// надо посмотреть в респонсах в девтулс, может сервер возвращает готовую ссылку
async function getPics(id: string){
    const { part, vol } = await getBasket(id);
    const pics_url = base_pics_url
        .replace("{vol}", vol).replace("{part}", part)
        .replace("{id}", id);
    let res = [];
    for(let i=1; i<11; i++){
        const current_url = pics_url.replace("{num}", i.toString());
        res.push(current_url);
    }
    console.log(res);
    return res;
}

//getPics("488928125")