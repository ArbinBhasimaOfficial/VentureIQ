# VentureIQ Core

Backend API for **VentureIQ**, a market intelligence platform.

Built with **Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Zod, bcrypt, and JWT**.

## Tech Stack

* Node.js
* TypeScript
* Express 5
* Prisma ORM 8
* PostgreSQL
* Zod
* bcrypt
* JSON Web Tokens (JWT)

## Project Structure

```text
ventureiq-core/
├── api/                 # Vercel serverless entrypoint
│   └── index.ts
├── src/
│   ├── app.ts           # Express application and routes
│   ├── server.ts        # Local development server
│   ├── modules/
│   │   └── auth/        # Authentication module
│   └── prisma/          # Prisma contract and generated ORM
├── prisma.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

## Setup

Clone the repository and install dependencies:

```bash
pnpm install
```

Create a `.env` file:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
```

## Development

Start the development server:

```bash
pnpm dev
```

The API runs on:

```text
http://localhost:1570
```

## Build

```bash
pnpm build
```

Start the compiled server:

```bash
pnpm start
```

## Authentication API

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Request:

```json
{
  "name": "Arbin Bhasima",
  "email": "arbin@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "arbin@example.com",
  "password": "password123"
}
```

Both endpoints return a JWT on successful authentication.

## Environment Variables

| Variable         | Description                  |
| ---------------- | ---------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string |
| `JWT_SECRET`     | Secret used to sign JWTs     |
| `JWT_EXPIRES_IN` | JWT expiration duration      |

## Deployment

The API is structured for deployment on **Vercel** using:

```text
api/index.ts
    ↓
src/app.ts
    ↓
Express
```

The local `server.ts` is responsible for `app.listen()` and is not used as the Vercel entrypoint.

## License

ISC
