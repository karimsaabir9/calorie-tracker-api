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

### Food — `/api/food`

| Method | Endpoint   | Description                                              |
| ------ | ---------- | ---------------------------------------------------------- |
| POST   | `/scan`    | Upload a food image (`multipart/form-data`, field `image`) |
| POST   | `/analyze` | Upload and analyze a food image for nutrition info          |
| POST   | `/save`    | Save an analyzed food entry to the user's log               |
| POST   | `/discard` | Discard an analyzed entry without saving it                 |

### Reports — `/api/reports`

| Method | Endpoint   | Description               |
| ------ | ---------- | -------------------------- |
| GET    | `/daily`   | Nutrition totals for a day |
| GET    | `/weekly`  | Nutrition totals for a week |
| GET    | `/monthly` | Nutrition totals for a month |

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
