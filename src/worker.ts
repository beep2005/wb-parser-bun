import { Elysia } from 'elysia';
import { URL } from 'url';

const base_url = new URL(process.env.WB_CARD_URL!);

export async function parse(id: String){
    base_url.searchParams.set("nm", id.toString());
    const response = await fetch(base_url, {
        headers: {
            "Accept": "application/json",
            "user-agent": process.env.USER_AGENT!,
            "Cookie": process.env.COOKIES!,
            "deviceid": process.env.DEVICEID!,
        }
    });

    if(!response.ok){
        throw new Error(`WB returned ${response.status}`);
    }

    const data = await response.json();
    const product = data.products[0];
    const { name, sizes, pics } = product;
    const price = sizes[0].price.product/100;
    const res = { name, price, pics };

    return await res;
}