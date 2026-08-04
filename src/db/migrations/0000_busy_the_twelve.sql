CREATE TABLE "cookiesStorage" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"current_cookie" varchar(500),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "priceHistory" (
	"priceAtTime" integer,
	"recordedAt" timestamp DEFAULT now(),
	"productId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"currentPrice" integer,
	"inStock" boolean,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "priceHistory" ADD CONSTRAINT "priceHistory_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;