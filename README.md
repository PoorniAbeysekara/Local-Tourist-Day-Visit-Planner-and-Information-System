# Baddegama Explorer – Local Tourist Day-Visit Planner (ITE2953)

MERN app: React (Vite) + Express + MongoDB. Implements SRS v1.0 (features 4.1 – 4.6).

## 1. Install once
- Node.js 20 LTS or newer: https://nodejs.org
- Git: https://git-scm.com
- MongoDB: either **MongoDB Atlas** free cluster (easiest, copy the connection string) or local MongoDB Community / `docker compose up -d`
- VS Code (+ extensions: ESLint, Prettier), Postman

## 2. Run
```bash
# terminal 1 – API
cd server
cp .env.example .env        # then edit MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD
npm install
npm run seed                # 10 places, categories, admin account
npm run dev                 # http://localhost:5000/api/health

# terminal 2 – web app
cd client
npm install
npm run dev                 # http://localhost:5173
```
Admin: http://localhost:5173/admin (email/password from `server/.env`).

## 3. Git
```bash
git init && git add . && git commit -m "chore: initial project scaffold"
git branch -M main
git remote add origin <your GitHub repo URL> && git push -u origin main
```
Commit small and often – commit history is a deliverable.

## 4. API
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/places | – | `q, category, maxDistance, freeOnly, openNow` |
| GET | /api/places/:id | – | |
| POST/PUT/DELETE | /api/places[/:id] | admin | |
| GET | /api/categories | – | |
| POST | /api/auth/login | – | returns JWT (2h) |
| GET | /api/auth/me | admin | |

## 5. SRS → code map
- REQ-1.x list/search/filters → `server/src/routes/places.js`, `client/src/pages/Browse.jsx`
- REQ-2.x detail page → `PlaceDetail.jsx`
- REQ-3.x map → `components/MapView.jsx`, `MapPage.jsx` (Leaflet + OpenStreetMap, resolves TBD-1)
- REQ-4.x plan builder → `PlanContext.jsx` (sessionStorage), `MyPlan.jsx`
- REQ-5.x admin CRUD → `AdminDashboard.jsx`
- REQ-6.x auth (bcrypt + JWT) → `server/src/routes/auth.js`, `middleware/auth.js`

## 6. TODO (next)
1. **Verify seed data** (`server/src/seed/seed.js`): coordinates, hours, fees are placeholders. Add 3–5 real photo URLs per place via the admin form.
2. Travel times use straight-line x1.4 at 35 km/h. Swap to OSRM when you decide TBD-4.
3. Reorder is up/down buttons; drag-and-drop is optional polish.
4. Write test cases mapped to each REQ.
5. Deploy (TBD-2): Render/Railway for API, Netlify/Vercel for client, Atlas for DB.
