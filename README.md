[Русская версия](README.ru.md)
# wb-parser-bun

# Wildberries Product Parser

A backend service for parsing and monitoring Wildberries products.

The application retrieves product information by article ID, stores products and price history in PostgreSQL, and periodically updates monitored products automatically.

## Features

* Parse Wildberries products by article ID
* Retrieve product name, current price and stock status
* Store products in PostgreSQL
* Track price history
* Automatically parse products stored in the database
* Handle expired sessions and refresh cookies
* Retry failed requests
* REST API for managing monitored products
* Persistent cookie storage
* Type-safe database access with Drizzle ORM

## Tech Stack

* **Bun** — JavaScript runtime
* **TypeScript** — programming language
* **Elysia** — HTTP framework
* **PostgreSQL** — database
* **Drizzle ORM** — database ORM and schema management
* **Bun.WebView** — obtaining a valid browser session and cookies

## How It Works

The application consists of several main components:

```text
                         ┌──────────────────┐
                         │    REST API      │
                         │     Elysia       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     Parser       │
                         │   Wildberries    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   PostgreSQL     │
                         │                  │
                         │    products      │
                         │   priceHistory   │
                         │ cookiesStorage   │
                         └──────────────────┘
                                  ▲
                                  │
                         ┌────────┴─────────┐
                         │  Cookie Manager  │
                         │   Bun.WebView    │
                         └──────────────────┘
```

The parser sends requests to the Wildberries product API and extracts the required product data.

The service stores the current product state in PostgreSQL and records price changes in a separate price history table.

Cookies required for authenticated requests are stored in the database. If the current session expires, the application obtains a new session through `Bun.WebView`.

## Automatic Product Monitoring

Products added to the database can be processed automatically by the controller.

The controller:

1. Retrieves products from the database.
2. Parses each product.
3. Updates its current state.
4. Records price changes.
5. Waits between requests.
6. Retries temporary failures.

This allows the application to continuously monitor a list of products without requiring a manual request for every product.

## Session and Cookie Handling

Wildberries may return a `498` response when the current session is no longer valid.

When this happens, the application:

```text
Request
   │
   ▼
498 response
   │
   ▼
Refresh browser session
   │
   ▼
Get new cookies
   │
   ▼
Save cookies
   │
   ▼
Retry request
```

`Bun.WebView` is used to obtain a fresh browser session and cookies.

The current cookie is stored in PostgreSQL and reused for subsequent requests.

## Database

The project uses PostgreSQL with Drizzle ORM.

### `product`

Stores the current state of monitored products.

| Column         | Description                               |
| -------------- | ----------------------------------------- |
| `id`           | Wildberries article ID                    |
| `name`         | Product name                              |
| `currentPrice` | Current product price                     |
| `inStock`      | Whether the product is currently in stock |
| `updatedAt`    | Last update timestamp                     |

### `priceHistory`

Stores historical product prices.

| Column        | Description                            |
| ------------- | -------------------------------------- |
| `productId`   | Reference to the product               |
| `priceAtTime` | Product price at the time of recording |
| `recordedAt`  | Timestamp of the record                |

A single product can have multiple price history records.

### `cookiesStorage`

Stores the current Wildberries cookie session used by the parser.

## API

### `GET /`

Health check endpoint.

```http
GET /
```

### `GET /parse/:id`

Parse a product by its Wildberries article ID.

```http
GET /parse/12345678
```

Example response:

```json
{
  "name": "Product name",
  "price": 1999,
  "inStock": true
}
```

### `POST /set-product/:id`

Add a product to the monitoring list.

```http
POST /set-product/12345678
```

### `POST /delete-product/:id`

Remove a product from the monitoring list.

```http
POST /delete-product/12345678
```

### `GET /all`

Get all products currently stored in the database.

```http
GET /all
```

### `GET /get/:id`

Get a product and its price history.

```http
GET /get/12345678
```

## Project Structure

```text
wb-parser-bun/
├── src/
│   ├── db/
│   │   ├── migrations/
│   │   ├── methods.ts
│   │   └── schema.ts
│   │
│   ├── routes/
│   │   └── router.ts
│   │
│   ├── controller.ts
│   ├── getCookies.ts
│   ├── index.ts
│   └── worker.ts
│
├── .env.example
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

### `worker.ts`

Contains the main product parsing logic and communication with the Wildberries API.

### `controller.ts`

Controls automatic product processing, request delays, retries and error handling.

### `getCookies.ts`

Responsible for obtaining and refreshing the browser session and cookies using `Bun.WebView`.

### `routes/router.ts`

Contains the REST API endpoints.

### `db/schema.ts`

Defines the PostgreSQL database schema using Drizzle ORM.

## Installation

### Requirements

* [Bun](https://bun.sh/)
* PostgreSQL
* Chromium or Google Chrome

### 1. Clone the repository

```bash
git clone https://github.com/beep2005/wb-parser-bun.git
cd wb-parser-bun
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Example:

```env
PORT=8000

DATABASE_URL=postgresql://user:password@localhost:5432/wbparser

WB_CARD_URL=https://www.wildberries.ru/__internal/u-card/cards/v4/detail

deviceid=your-device-id
```

Do **not** commit `.env` to the repository.

### 4. Set up the database

Create a PostgreSQL database and specify its connection string in `DATABASE_URL`.

Run the database migrations:

```bash
bunx drizzle-kit migrate
```

### 5. Start the application

Development:

```bash
bun run dev
```

Production:

```bash
bun run start
```

The server will start on the port specified in `PORT`.

## Error Handling

The parser handles several types of failures:

| Situation                    | Behavior                      |
| ---------------------------- | ----------------------------- |
| Product exists               | Product data is updated       |
| Product is out of stock      | Stock status is updated       |
| Session expired (`498`)      | Cookies are refreshed         |
| Temporary request failure    | Request is retried            |
| Invalid/non-existent product | Product is handled as invalid |

## Why Bun?

This project was built with Bun to experiment with a fast JavaScript/TypeScript runtime and its built-in APIs.

Bun provides:

* Fast application startup
* Native TypeScript execution
* Built-in package management
* `Bun.WebView` for browser automation/session handling
* A lightweight runtime suitable for backend services

The project also uses Elysia, a lightweight and type-safe HTTP framework designed for Bun.

## Disclaimer

This project was created for educational purposes and for learning backend development, HTTP APIs, web parsing, PostgreSQL, session management and background processing.

Use the project responsibly and respect Wildberries' terms of service and applicable laws.

## License

This project is provided for educational purposes.


[Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
