import { Elysia } from 'elysia';
import { URL } from 'url';
import { getCookiesDb, saveCookiesDb } from './db/methods.ts';
import { cookiesDb } from './index.ts';


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
    let hasStock = true;
    if(sizes[0]!.stocks.length === 0){
        console.log(id, ': Product is out of stock');
        hasStock = false;
    }
    const price = hasStock ? sizes[0]!.price.product/100 : null;
    const res = { name, price, inStock: hasStock };
    return res;
}

