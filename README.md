# Shop-X — Hostinger Deployment Guide

## Folder Structure (Hostinger-Ready)
```
shop-x/                      ← Project root (upload this)
├── server.js                ← Entry point (set this in hPanel)
├── package.json             ← Root package with build + start scripts
├── .env.example             ← Copy to .env and fill in values
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── frontend/                ← React app (built into frontend/dist/)
    ├── package.json
    ├── src/
    └── dist/                ← Created after npm run build
```

## Deploying to Hostinger (hPanel → Node.js Apps)

### Method 1: ZIP Upload (Easiest)
1. Run `npm run build` locally to build the frontend
2. Delete `node_modules/` and `frontend/node_modules/` folders
3. Zip the entire `shop-x/` folder
4. In hPanel → **Websites** → **Add Website** → **Node.js Apps** → **Upload ZIP**
5. Configure:
   - **Entry file:** `server.js`
   - **Build command:** `npm install && npm run build`
   - **Node.js version:** 20.x or 22.x
6. Add **Environment Variables** (from `.env.example`)
7. Click **Deploy**

### Method 2: GitHub (Recommended)
1. Push this folder to a GitHub repo
2. hPanel → **Websites** → **Add Website** → **Node.js Apps** → **Import Git Repository**
3. Select your repo
4. Configure:
   - **Build command:** `npm install && npm run build`
   - **Entry file:** `server.js`
5. Add all env variables in hPanel dashboard
6. Deploy

## Environment Variables to Set in hPanel
Copy from `.env.example` — set all of these in Hostinger's Node.js environment variables panel.

## After Deployment
Run the database seeder once via SSH or Hostinger terminal:
```bash
node utils/seeder.js
```

## Default Login (after seed)
| Role        | Email                  | Password     |
|-------------|------------------------|--------------|
| Super Admin | superadmin@shopx.lk    | admin123456  |
| Admin       | admin@shopx.lk         | admin123456  |
