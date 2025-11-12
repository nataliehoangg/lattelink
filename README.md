# ☕ Lattelink

Find the best cafés to work or study in—complete with reliable Wi-Fi, plenty of outlets, laptop-friendly seating, and a calm-but-productive vibe. Lattelink scrapes Google Places (and soon Yelp) to generate a “workability” score for each café and presents the data through a cozy, search-first interface.

---

## 🚀 Features

- **Search-first homepage** with a hero split featuring blurred café photography.
- **Weighted workability score** that prioritises outlets, seating, and reliable Wi-Fi while still showing noise levels.
- **Detailed café profiles** including amenity breakdowns, recent reviews, tags, and direct links.
- **Dual browsing modes**: list view for quick scanning and a map view with a ranked, scrollable sidebar.
- **Translucent global navbar** with links to `HOME` and `ABOUT` (the About page mirrors the hero aesthetic and includes the project story + portfolio link).
- **Sentiment-driven insights** derived from Google Places reviews using VADER + TextBlob.
- **Scraper-driven dataset** that stays current—each city scrape replaces outdated documents and re-computes the latest scores.

---

## 🏗️ Project Structure

```
lattelink/
├── frontend/          # Next.js app (App Router, Tailwind, Framer Motion)
├── backend/           # Express.js API + Mongoose models
└── scraper/           # Python scraper integrating Google Places APIs
```

---

## 🛠️ Tech Stack

| Area      | Technology                                                |
|-----------|-----------------------------------------------------------|
| Frontend  | Next.js 14, React, Tailwind CSS, Framer Motion, SWR       |
| Backend   | Node.js, Express.js, Mongoose                             |
| Database  | MongoDB / MongoDB Atlas                                   |
| Scraper   | Python 3.x, `requests`, Google Places API, TextBlob, VADER |

---

## 📦 Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas cluster)

### 1. Install dependencies

```bash
npm run install:all
```

This bootstraps the root, frontend, and backend workspaces.

### 2. Configure environment variables

**Backend** (`backend/.env`):
```
MONGODB_URI=mongodb://localhost:27017/lattelink    # or your Atlas connection string
PORT=3001
NODE_ENV=development
```

If you use MongoDB Atlas, replace the URI with your SRV connection string (including `/lattelink`). No quotes needed—URL-encode any special password characters.

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_BROWSER_KEY   # see Google Maps setup
```

**Scraper** (`scraper/.env`):
```
MONGODB_URI=mongodb://localhost:27017/lattelink     # must match the backend DB
GOOGLE_PLACES_API_KEY=YOUR_SERVER_KEY
# YELP_API_KEY=                                      # optional for future expansion
```

> All `.env` files are gitignored. Never commit keys—use local `.env` files and environment variables in production.

### 3. Start the development servers

```bash
npm run dev
```

By default this launches:

- Backend at `http://localhost:3001`
- Frontend at `http://localhost:3000` (Next.js will bump the port if 3000 is busy; check the console output)

---

## 🔑 Google Maps & Places Keys

1. Follow [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) for a step-by-step walkthrough.
2. Enable **Maps JavaScript API** (for the frontend) and **Places API** (for the scraper).
3. Create two keys:
   - **Frontend key** – restrict by HTTP referrer (e.g. `http://localhost:3000/*`).  
   - **Scraper key** – restrict by IP address and API (Places). If your ISP rotates IPs frequently, you can temporarily remove the IP restriction while testing.

> If the map fails to load, the UI now shows an overlay with guidance (invalid key, billing disabled, etc.). Check the browser console for the exact Google error message.

---

## 🧠 How Workability Scores Are Calculated

1. **Review analysis** – Every Google review is processed with VADER + TextBlob. Keywords for Wi-Fi, outlets, seating, and noise are extracted to produce sentiment scores in the `[-1, 1]` range.
2. **Amenity scoring** – Sentiment averages are scaled to `0–10`. Outlet availability is only marked “available” if at least two reviews positively mention outlets.
3. **Weighted rating** – Final score (0–10) uses the following weights:
   - Outlets: **45 %** (with a heavy penalty if outlets aren’t confirmed)
   - Seating comfort: **30 %**
   - Wi-Fi reliability: **20 %**
   - Noise level: **5 %** (still displayed, but almost no impact on the ranking)
4. **Sorting** – API responses default to descending `workabilityScore`.

The backend and scraper both run the same calculation so the value stays consistent regardless of the data ingest path.

---

## 🔄 Running the Scraper

```bash
cd scraper
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scraper.py --city "Berkeley" --max-results 40
```

Tips:

- You can scrape multiple cities by rerunning the command with different `--city` values (e.g. `"San Francisco"`, `"Oakland"`, `"Alameda"`).
- It’s technically possible to scrape cities in parallel in separate terminals, but Google Places has strict rate limits. Sequential runs are safer to avoid `OVER_QUERY_LIMIT` errors.
- Each scrape replaces the cafés (and associated reviews) for the target city, ensuring stale data is removed before new records are inserted.

---

## 📝 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/cafes?city=Berkeley` | List cafés filtered by city (defaults to workability sorting) |
| `GET /api/cafes/:id` | Fetch detailed café profile (amenities, reviews, tags, etc.) |
| `GET /api/reviews?cafeId=<id>` | Fetch recent reviews for a specific café |
| `POST /api/reviews` | Submit a user-supplied review (validated + linked to a café) |
| `POST /api/reviews/:id/helpful` | Increment the “helpful” counter for a review |

> The frontend currently consumes the first two endpoints. Review endpoints are ready for future user-generated feedback features.

---

## 🧹 Data Pipeline & Scraper Workflow

1. **Text Search** – For each requested city we call Google Places Text Search (`cafes for working in {city}`) to fetch up to _N_ candidates.
2. **Details Enrichment** – For every candidate we request Place Details to gather reviews, address components, phone, hours, and precise coordinates.
3. **Normalisation & Filtering** – We convert results into a common schema, skipping anything that looks primarily like a restaurant/bar, and capture `place_id` for dedupe.
4. **Sentiment Analysis** – Review text is analysed with VADER + TextBlob to produce per-factor sentiment (Wi-Fi, outlets, seating, noise).
5. **Amenity Scoring** – Sentiment averages are converted to 0–10 scores; outlets are only marked “available” when reviewers repeatedly praise them.
6. **Weighted Workability** – The scraper calculates the weighted score (outlets > seating > Wi-Fi > noise) and stores amenities/tags for display.
7. **Upsert & Cleanup** – Before inserting new cafés, the scraper removes existing records for that city (and associated reviews) so results stay fresh. Upserts key on `place_id`, `yelp_id`, or name+address to avoid duplicates.

> You can run multiple cities sequentially (recommended). Parallel scrapes from separate terminals work, but Google rate limiting becomes more likely.

---

## 🎨 UI Notes

- Tailwind CSS powers the editorial feel (creams, espresso browns, soft grays).
- Global navbar is translucent with backdrop blur and anchors to `HOME` / `ABOUT`.
- Map view includes a ranked sidebar to keep context while exploring.
- Detail pages are padded to account for the fixed navbar so navigation stays visible.

---

## 🚀 Deployment (Future Considerations)

- **Frontend:** Vercel or Netlify  
- **Backend:** Render, Railway, Fly.io  
- **Database:** MongoDB Atlas  
- **Scraper:** Scheduled job on Render, Railway, AWS Lambda, or a simple cron on a VM

---

## 🐞 Troubleshooting

| Issue | What to check |
|-------|---------------|
| Map overlay says the key is invalid | Confirm `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` matches the frontend key and allows the current `localhost` origin. |
| Places API returns `REQUEST_DENIED` | IP restrictions for the scraper key likely don’t include your current IPv4/IPv6, or the Places API isn’t enabled. |
| Backend can’t connect to MongoDB | Verify the `MONGODB_URI` works in `mongosh`; make sure the database name appears before the query string (`/lattelink?...`). |
| Scores don’t reflect new weighting | Run the scraper again—the new weights are applied when cafés are refreshed. |
