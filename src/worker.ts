import { Elysia } from 'elysia';
import { URL } from 'url';
import { getPageCookies } from './test.ts';

interface WBPrice {
    product: number;
}
interface WBSizes {
    price: {
        product: number;
    }
}
interface WBProduct {
    name: string;
    pics: number;
    sizes: WBSizes[];
}
interface WBResponse{
    products: WBProduct[];
}

//const base_url = String(process.env.WB_CARD_URL);
const url = new URL(process.env.WB_CARD_URL!)
//const cookies = await getPageCookies();
//console.log(cookies);

export async function parse(id: string){
    //const {part, vol}  = getBasket(id);
    const cookies = await getPageCookies();
    url.searchParams.set('nm', id);

    try{
        console.log(cookies);
        console.log("---")
        const response = await fetch(url, {
            headers: {
                "Cookie": cookies,
                "deviceid": process.env.deviceid!,
            },
        });
        if(!response.ok){
            throw new Error('error')
        }
        const data = await response.json() as WBResponse;
        const product = data.products[0];
        if(!product){
            throw new Error("No product with such article")
        };
        const { name, sizes, pics } = product;
        const price = sizes[0]!.price.product/100;
        const res = { name, price, pics };
        return res;

    } catch(error){
        throw new Error(`WB returned ${error}`);
    }

    // const response = await fetch(url, {
    //     headers: {
    //         'Cookie': cookies,
    //     },
    // });

    // if(!response.ok){
    //     throw new Error(`WB returned ${response.status}`);
    // }

    //return await res;
}

function getBasket(article: string){
    const part = article.slice(0, -3);
    const vol = article.slice(0, -5);
    return {part, vol};
}