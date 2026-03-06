# FamSync

FamSync is a family task management app with admin approval workflow, JWT auth, MongoDB persistence, FCM push notifications, and automated cron jobs.

## Structure

- `backend/`: Node.js + Express + Mongoose API
- `frontend/`: React Native app (Expo managed workflow)

## Backend Setup

1. `cd backend`
2. `cp .env.example .env` and fill values
3. `npm install`
4. `npm run dev`

Server default: `http://localhost:5000`

### API Base

- Auth: `/api/auth`
- Family: `/api/family`
- Tasks: `/api/tasks`

## Frontend Setup (Expo)

1. `cd frontend`
2. `npm install`
3. `npx expo install --fix`
4. Update `src/api/client.js` base URL if needed
5. `npm run start`
6. Run on device/simulator with `npm run android` or `npm run ios`

## Cron Jobs

- Daily `20:00`: Pending task reminder grouped by assignee
- Daily `02:00`: Auto-delete completed tasks

## Security

- Password hashing via `bcryptjs`
- JWT auth middleware
- Approval middleware for task routes
- Admin middleware for approval endpoints
- `helmet`, `cors`, and `express-rate-limit`
