import { pgTable, timestamp, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const products = pgTable('product', {
    // связь -> один <- ко многим 
    id: integer().primaryKey(),
    name: varchar( {length:255} ).notNull(),
    currentPrice: integer(), // null - если нет в наличии?
    inStock: boolean(),
    updatedAt: timestamp().defaultNow().notNull(),
});

export const priceHistory = pgTable('priceHistory', {
    priceAtTime: integer(),
    recordedAt: timestamp().defaultNow(),
    // связь один ко -> многим <-
    productId: integer().notNull().references(() => products.id),
});

export const cookiesStorage = pgTable('cookiesStorage', {
    id: integer().primaryKey().default(1),
    current_cookie: varchar( {length:500} ),
    updatedAt: timestamp().defaultNow(),
});


// описание связей
export const relations = defineRelations({ products, priceHistory }, (r) => ({
    productHistory: {
        many(priceHistory)
    }
}));
export const priceHistoryRelations = defineRelations(priceHistory, ({ one }) => ({
    product: one(products, {
        fields: [priceHistory.productId],
        references: [products.id],
    }),
}));