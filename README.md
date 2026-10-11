# Calorie Tracker API

A REST API for a calorie-tracking app. Users sign up, snap a photo of their food, get it analyzed for calories and macros via OpenAI, and save it to their daily log. Built with Express, TypeScript, and MongoDB, with meal photos stored on Cloudflare R2.

## Features

- JWT-based authentication (register, login, current-user lookup)
- Food photo upload and AI-powered nutrition analysis (calories, protein, carbs, fat)
- Save or discard an analyzed entry before it's committed to the log
- Daily, weekly, and monthly nutrition reports
- Meal photos uploaded to Cloudflare R2 object storage

## Tech Stack

- **Runtime:** Node.js + TypeScript (`tsx` for dev, `tsc` for build)
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose)
- **Auth:** JSON Web Tokens, bcrypt password hashing
- **AI:** OpenAI API for food image analysis
- **Storage:** Cloudflare R2 (via `@aws-sdk/client-s3`)
- **Validation:** Zod
- **Image processing:** Sharp

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or Atlas)
- An OpenAI API key
- A Cloudflare R2 bucket and access credentials

### Install

```bash
npm install
```

### Configure

Create a `.env` file in the project root:

```env
PORT=8000
NODE_ENV=development

MONGODB_URI_DEV=mongodb://localhost:27017/calorie-tracker
MONGODB_URI_PROD=your-production-mongodb-uri

JWT_SECRET=your-jwt-secret

OPENAI_API_KEY=your-openai-api-key

R2_BUCKET_NAME=your-r2-bucket-name
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_ACCOUNT_ID=your-r2-account-id
R2_PUBLIC_URL=https://your-r2-public-url
```

The Mongo connection string used at runtime is chosen based on `NODE_ENV`: `MONGODB_URI_PROD` in production, `MONGODB_URI_DEV` otherwise.

### Run

```bash
npm run dev    # start with hot reload
npm run build  # compile to dist/
npm start      # run the compiled build
```

The server starts on `http://localhost:8000` by default.

## API Reference

All routes except `/api/auth/register` and `/api/auth/login` require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint    | Description                  |
| ------ | ----------- | ----------------------------- |
| POST   | `/register` | Create a new account          |
| POST   | `/login`    | Log in and receive a JWT      |
| GET    | `/me`       | Get the current user's profile |

**Register**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "dailyCalorieGoal": 2000   // optional, defaults to 2000
}
```
Response includes the created user plus a JWT: `{ "message": "...", "user": { "email", "name", "dailyCalorieGoal", "token" } }`.

**Login** returns the same shape as register on success.

### Food — `/api/food`

| Method | Endpoint   | Description                                                          |
| ------ | ---------- | ---------------------------------------------------------------------- |
| POST   | `/scan`    | Upload a food image, analyze it, and save the entry in one step        |
| POST   | `/analyze` | Upload and analyze a food image without saving — for user confirmation |
| POST   | `/save`    | Persist a previously analyzed entry the user confirmed                 |
| POST   | `/discard` | Delete an analyzed-but-unconfirmed image from R2                       |

`/scan` and `/analyze` both take `multipart/form-data` with an `image` field. The difference is the workflow:
- **`/scan`** is the one-shot path: image in, nutrition analyzed, entry saved to the log, saved `FoodEntry` returned.
- **`/analyze` → `/save` or `/discard`** is the review-first path: `/analyze` uploads the image and returns the AI analysis (`foodName`, `calories`, `protein`, `carbs`, `fat`, `mealType`, `imageUrl`, `storageKey`, and a base64 preview) without touching the database. The client then either calls `/save` with that data to commit it, or `/discard` with just the `storageKey` to delete the now-unused image from R2.

### Reports — `/api/reports`

| Method | Endpoint             | Description                                  |
| ------ | --------------------- | ----------------------------------------------- |
| GET    | `/daily?date=`        | Totals, macros, and meal breakdown for a day (defaults to today) |
| GET    | `/weekly`              | Last 7 days, day-by-day, with totals and averages |
| GET    | `/monthly?year=&month=` | Full month totals, daily chart data, and the highest-calorie day (defaults to current month) |

## Image Processing

Every uploaded photo is optimized with Sharp before it's stored or analyzed:
- Auto-rotated based on EXIF orientation
- Resized to fit within 1024×1024 (aspect ratio preserved, never upscaled)
- Re-encoded as JPEG at 85% quality with mozjpeg compression
- Uploaded to R2 under the `colorie-tracker-api/<random-hex>.jpeg` key

## Macro Calculations

Reports convert macro grams to calories using standard conversions, then derive each macro's share of total macro calories:
- Protein: 4 kcal/g
- Carbohydrates: 4 kcal/g
- Fat: 9 kcal/g

## Error Handling

Standard HTTP status codes are used throughout: `200` success, `201` created, `400` bad request, `401` unauthorized, `404` not found, `500` internal server error — each with a JSON `{ "message": "..." }` body.

## Data Models

**User** — `email`, `password` (hashed), `name`, `dailyCalorieGoal` (default 2000), `onBoardingCompleted`, `createdAt`.

**FoodEntry** — `userId`, `foodName`, `calories`, `protein`, `carbs`, `fat`, `imageUrl`, `storageKey` (R2 object key), `timestamp`, `mealType` (`breakfast` | `lunch` | `dinner` | `snack`).

## Project Structure

```
.
├── config/        # env config, DB connection, R2 client
├── controller/    # route handlers
├── middleware/     # auth guard, file upload
├── models/        # Mongoose schemas
├── routes/        # Express routers
├── services/      # OpenAI integration, calorie calculations
└── server.ts      # app entry point
```
