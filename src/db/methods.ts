import { db } from './db'
import { eq } from 'drizzle-orm'
import { cookiesStorage, priceHistory, products } from './schema'

export async function setProductDb(id: number){
    await db.insert(products).values({
        id: id, 
        name: 'none'
    });
}
export async function deleteProductDb(id: number){
    await db.delete(products).where(eq(products.id, id));
};

export async function getProductDb(id: number){
    const currentProduct = await db.query.products.findFirst({
        where: {
            id: id,
        }
    });
    return currentProduct;
}

export async function getAllProducts(){
    const allProducts = await db.select().from(products);
    return allProducts;
}

// история цены
export async function updatePriceHistory(id: number, price: number | null, time: Date | null){
    await db.insert(priceHistory).values({
        productId: id, 
        priceAtTime: price, 
        ...(time && {recordedAt: time}), // передаём time если есть
    })
}

// достаём cookies
export async function getCookiesDb(){
    const row = await db.
        select({
            cookie: cookiesStorage.current_cookie,
        }).
        from(cookiesStorage).
        where(eq(cookiesStorage.id, 1))
    return row[0]?.cookie;
}
// сохраняем cookies
export async function saveCookiesDb(cookies: string){
    await db.
        insert(cookiesStorage).
        values({
            current_cookie: cookies,
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: cookiesStorage.id,
            set: {
                current_cookie: cookies,
                updatedAt: new Date(),
            }
        })
};