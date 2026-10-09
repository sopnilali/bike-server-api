# Bike Servicing Management API

A simple REST API for managing bike servicing — customers, bikes, and service records. Built for Assignment-8 with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Zod.

## Technologies

- Node.js + Express.js
- TypeScript (strict)
- Prisma ORM (v6)
- PostgreSQL
- Zod validation
- dotenv, cors, tsx

## Project Structure

```text
prisma/schema.prisma
src/
  app.ts
  server.ts
  config/prisma.ts
  middlewares/errorHandler.ts, notFound.ts
  utils/AppError.ts, catchAsync.ts
  modules/customers/
  modules/bikes/
  modules/services/
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally

## Installation

```bash
npm install
cp .env.example .env
# Edit .env and set your real DATABASE_URL
```

## PostgreSQL Setup

Create the database:

```sql
CREATE DATABASE bike_servicing_db;
```

Or with terminal:

```bash
createdb bike_servicing_db
# or
psql -U postgres -c "CREATE DATABASE bike_servicing_db;"
```

`.env` example:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bike_servicing_db?schema=public"
```

Never commit `.env`. Only `.env.example` is committed.

## Prisma Commands

```bash
# Generate client (after schema change)
npx prisma generate

# Create + run migration (dev)
npx prisma migrate dev --name init

# Push schema without migration (quick prototyping)
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

Server: `http://localhost:5000` — health check `GET /`.

## API Endpoints

### Customers

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/customers` | Create customer |
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Bikes

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/bikes` | Create bike |
| GET | `/api/bikes` | Get all bikes |
| GET | `/api/bikes/:id` | Get bike by ID |

### Services

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/services` | Create service record |
| GET | `/api/services` | Get all service records |
| GET | `/api/services/status` | Get pending/in-progress services older than 7 days |
| GET | `/api/services/:id` | Get service by ID |
| PUT | `/api/services/:id/complete` | Mark service as done |

> `GET /api/services/status` must be called exactly like that — the server defines `/status` before `/:id` so it is not mistaken for an ID.

## Example Requests

Create customer:

```json
POST /api/customers
{
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "phone": "01700000000"
}
```

Create bike:

```json
POST /api/bikes
{
  "brand": "Yamaha",
  "model": "FZ-S",
  "year": 2022,
  "customerId": "<customer-uuid>"
}
```

Create service (status optional, defaults to `pending`):

```json
POST /api/services
{
  "bikeId": "<bike-uuid>",
  "serviceDate": "2025-01-10T10:00:00.000Z",
  "description": "Engine oil change",
  "status": "pending"
}
```

Valid statuses: `pending`, `in-progress`, `done`.

Complete service (body optional):

```json
PUT /api/services/:id/complete
{
  "completionDate": "2025-02-01T10:00:00.000Z"
}
```

If omitted, server uses current date/time.

## Example Responses

Success (201 create):

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "customerId": "uuid",
    "name": "Rahim Uddin",
    "email": "rahim@example.com",
    "phone": "01700000000",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

Error (404):

```json
{
  "success": false,
  "status": 404,
  "message": "Customer not found"
}
```

Status codes: `201` created, `200` success, `400` validation, `404` not found, `409` duplicate email, `500` server error. Stack trace included only when `NODE_ENV=development`.

## Overdue Logic

`GET /api/services/status` returns records where:

- `status` is `pending` or `in-progress`, AND
- `serviceDate` < now minus 7 days.

Returns `[]` if none match.

## Postman Testing

1. Start server: `npm run dev`.
2. Import endpoints manually or create a collection with base `http://localhost:5000`.
3. Test in order: create customer → copy `customerId` → create bike → copy `bikeId` → create service.
4. For overdue test, create a service with `serviceDate` 8+ days in the past and `status: "pending"`, then call `GET /api/services/status`.

## Testing Checklist

- [ ] POST customer success → 201
- [ ] POST customer missing fields → 400
- [ ] POST customer invalid email → 400
- [ ] POST customer duplicate email → 409
- [ ] GET all customers → 200
- [ ] GET customer invalid UUID → 400
- [ ] GET customer nonexistent UUID → 404
- [ ] PUT customer success → 200
- [ ] PUT customer duplicate email → 409
- [ ] DELETE customer success → 200 (cascade-deletes their bikes and service records)
- [ ] POST bike success → 201
- [ ] POST bike invalid year / missing fields → 400
- [ ] POST bike nonexistent customerId → 404
- [ ] GET bike invalid UUID → 400, nonexistent → 404
- [ ] POST service success → 201, `completionDate` null when pending
- [ ] POST service invalid status → 400
- [ ] POST service nonexistent bikeId → 404
- [ ] PUT complete with custom date → 200, status `done`
- [ ] PUT complete without body → 200, uses now
- [ ] PUT complete already-done → 400
- [ ] GET `/services/status` returns only pending/in-progress older than 7 days
- [ ] GET `/services/status` empty array when no match
- [ ] GET `/services/status` is not hijacked by `/:id` route
