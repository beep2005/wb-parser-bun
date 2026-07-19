import { Elysia } from 'elysia';
import { URL } from 'url';

const base_url = String(process.env.WB_CARD_URL);

export async function parse(id: string){
    const {part, vol}  = getBasket(id);
    const current_url = String(process.env.WB_CARD_URL).replace("{vol_int}", vol).replace("{part_int}", part)
    const url = new URL(current_url!);

    const response = await fetch(base_url, {});

    if(!response.ok){
        throw new Error(`WB returned ${response.status}`);
    }

    const data = await response.json();
    const { name, sizes, pics } = data.imt_name;
    const price = sizes[0].price.product/100;
    const res = { name, price, pics };

    return await res;
}

function getBasket(article: string){
    const part = article.slice(0, -3);
    const vol = article.slice(0, -5);
    return {part, vol};
}