# SellBuy Used Cars Marketplace

Full-stack used-car marketplace.

- Backend: Express + MySQL
- Frontend: React + Vite

## Prerequisites

- Node.js 18+
- pnpm 8+
- MySQL 8+

## 1) Setup Database

Create the schema and tables:

```bash
cd backend
mysql -u root -p < schema.sql
```

If your MySQL user is not `root`, use your own credentials.

## 2) Configure Environment Variables

Create `backend/.env`:

```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sellbuy_cars
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
TRUST_SCORE_WORKER_INTERVAL_MS=15000
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

## 3) Install Dependencies

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

## 4) Seed Sample Data (Optional)

```bash
cd backend
pnpm run seed
```

Seed login examples (password for all: `Password@123`):
- admin@sellbuycars.com
- seller1@sellbuycars.com
- buyer1@sellbuycars.com

## Database Refresh Note

This project now includes SQL triggers and new tables for:
- Automatic EMI generation on car insert/update
- Trust-score job queueing on car insert/update and seller verification changes
- Live bidding support tables

If your DB was created earlier, refresh schema to apply triggers/tables:

```bash
cd backend
mysql -u root -p -e "DROP DATABASE IF EXISTS sellbuy_cars;"
mysql -u root -p < schema.sql
```

## 5) Run the Project

Start backend:

```bash
cd backend
pnpm run dev
```

Start frontend (new terminal):

```bash
cd frontend
pnpm run dev
```

Open:
- Frontend: http://localhost:5173
- Backend API health: http://localhost:8080/

## Common Commands

Backend:

```bash
pnpm run dev
pnpm start
pnpm run seed
```

Frontend:

```bash
pnpm run dev
pnpm run build
pnpm run preview
```

## Notes

- Chatbot already uses Gemini through `GEMINI_API_KEY`.
- New feature plan uses Gemini for all AI needs.
- If ports change, update `PORT` and `VITE_API_URL`.
