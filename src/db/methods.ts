import { db } from '../index'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import { products } from './schema'

export async function setProductDb(id: string){
    await db.insert(products).values({id: Number(id), name: 'none'});
}
export async function deleteProductDb(id: string){
    await db.delete(products).where(eq(products.id, id));
};

export async function getProductDb(id: string){
    //await db.query.products.findOne();
}

export async function getAllProducts(){
    //await db.query.
}