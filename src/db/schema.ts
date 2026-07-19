import { pgTable, timestamp, integer, varchar } from "drizzle-orm/pg-core";

export const productTable = pgTable('product', {
    id: integer().primaryKey(),
    name: varchar( {length:255} ),
    price,
    image
}),

export const priceHistory = pgTable('priceHistory', {
    id:
    current_price:
    data: timestamp
})