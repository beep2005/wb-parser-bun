import { db } from '../index'
import { eq } from 'drizzle-orm'
import { priceHistory, products } from './schema'
import { relations } from 'drizzle-orm'

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
        with: {
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
        recordedAt: time
    })
}