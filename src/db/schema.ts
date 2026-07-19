import { pgTable, timestamp, integer, varchar } from "drizzle-orm/pg-core";

export const productTable = pgTable('product', {
    id: integer().primaryKey(),
    name: varchar( {length:255} ).notNull(),
    price: integer().notNull(),
    image
}),

export const priceHistory = pgTable('priceHistory', {
    id:
    current_price:
    data: timestamp
}),

export const cookiesStorage = pgTable('cookiesStorage', {
    current_cookie: varchar( {length:500} ),
}),