# 🚀 Lattelink Setup Guide

Complete setup instructions for getting Lattelink running locally.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/downloads/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

## Step 1: Install Dependencies

From the project root:

```bash
npm run install:all
```

This will install dependencies for:
- Root workspace
- Frontend (Next.js)
- Backend (Express.js)

## Step 2: Set Up MongoDB

📖 **Detailed instructions available in [MONGODB_SETUP.md](./MONGODB_SETUP.md)**

### Quick Summary

**Option A: MongoDB Atlas (Recommended for Beginners)** ☁️
- Free cloud-hosted MongoDB
- No local installation needed
- Perfect for development
- See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for step-by-step guide

**Option B: Local MongoDB** 💻
- Install MongoDB on your computer
- Full control, works offline
- See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for installation instructions

## Step 3: Configure Environment Variables

### Backend

Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/lattelink
# OR for Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lattelink

PORT=3001
NODE_ENV=development
```

### Frontend

Create `frontend/.env.local`:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here  # Optional for map view
```

### Scraper (Optional)

Create `scraper/.env`:

```bash
cp scraper/.env.example scraper/.env
```

Edit `scraper/.env`:
```
MONGODB_URI=mongodb://localhost:27017/lattelink
GOOGLE_PLACES_API_KEY=your_key_here  # Optional
YELP_API_KEY=your_key_here  # Optional
```

## Step 4: Seed Sample Data (Optional)

To populate the database with sample cafés for testing:

```bash
cd backend
node scripts/seed-sample-data.js
```

This adds 5 sample cafés in Berkeley, CA.

## Step 5: Start Development Servers

From the project root:

```bash
npm run dev
```

This starts:
- **Backend API** on `http://localhost:3001`
- **Frontend** on `http://localhost:3000`

Or start them separately:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

## Step 6: Test the Application

1. Open `http://localhost:3000` in your browser
2. Search for "Berkeley" (if you seeded sample data)
3. Browse cafés in list or map view
4. Click on a café to see details

## 🎨 Google Maps Setup (Optional)

To enable the map view:

1. Get a Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the key to your domain (for production)

2. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. Restart the frontend server

## 🐍 Running the Scraper (Optional)

The scraper is set up but requires API keys for full functionality:

1. Set up Python environment:
   ```bash
   cd scraper
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Get API keys:
   - **Google Places API**: [Google Cloud Console](https://console.cloud.google.com/)
   - **Yelp Fusion API**: [Yelp Developers](https://www.yelp.com/developers)

3. Add keys to `scraper/.env`

4. Run scraper:
   ```bash
   python scraper.py --city "Berkeley" --max-results 20
   ```

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongosh` should connect
- Check `MONGODB_URI` in `backend/.env`
- For Atlas: Ensure your IP is whitelisted

### Frontend Can't Connect to Backend

- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Check CORS settings in `backend/server.js`

### Port Already in Use

- Change `PORT` in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` accordingly

## 📚 Next Steps

- Implement actual scraping with Google Places/Yelp APIs
- Add user authentication for reviews
- Deploy to production (Vercel/Netlify for frontend, Render/Railway for backend)
- Set up scheduled scraping jobs (cron, AWS Lambda)

## 🎉 You're All Set!

Your Lattelink application should now be running. Happy café hunting! ☕

