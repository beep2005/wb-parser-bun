import { pgTable, timestamp, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const products = pgTable('product', {
    // связь -> один <- ко многим 
    id: integer().primaryKey(),
    name: varchar( {length:255} ).notNull(),
    price: integer(), // null - если нет в наличии?
    stock: boolean(),
});

export const priceHistory = pgTable('priceHistory', {
    priceAtTime: integer(),
    actual_at: timestamp().defaultNow(),
    // связь один ко -> многим <-
    productId: integer().notNull().references(() => products.id),
});

export const cookiesStorage = pgTable('cookiesStorage', {
    id: integer().primaryKey().default(1),
    current_cookie: varchar( {length:500} ),
    updatedAt: timestamp().defaultNow(),
});


// описание связей
export const productRelations = relations(products, ({ many }) => ({
    id: many(priceHistory),
}));
export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
    id: one(products, {
        fields: [priceHistory.productId],
        references: [products.id],
    }),
}));