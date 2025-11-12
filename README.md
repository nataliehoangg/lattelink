# ☕ Lattelink

Find the best cafés to work or study in. Discover cafés with reliable Wi-Fi, outlets, comfortable seating, and the right noise level for productivity.

## 🚀 Features

- **Search by City/Neighborhood**: Find cafés in any location
- **Workability Scores**: See how suitable each café is for work/study
- **Detailed Amenities**: Wi-Fi reliability, outlet availability, seating, noise levels
- **Map & List Views**: Choose your preferred way to browse
- **Sentiment Analysis**: Reviews analyzed for workability factors
- **Clean, Cozy UI**: Calm coffee-shop aesthetic

## 🏗️ Project Structure

```
lattelink/
├── frontend/          # Next.js frontend
├── backend/           # Express.js API
└── scraper/           # Python scraper for Google Maps/Yelp
```

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Scraper**: Python (BeautifulSoup/Scrapy)

## 📦 Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:

**Backend** (`backend/.env`):
```
MONGODB_URI=mongodb://localhost:27017/lattelink
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here  # Optional - see GOOGLE_MAPS_SETUP.md
```

3. Start development servers:
```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:3000`

## 🗺️ Google Maps Setup (Optional)

To enable the map view, you'll need a Google Maps API key. See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) for detailed instructions.

Quick steps:
1. Create a Google Cloud account (free $200/month credits)
2. Enable Maps JavaScript API
3. Create an API key
4. Add it to `frontend/.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## 🔄 Running the Scraper

```bash
cd scraper
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python scraper.py --city "Berkeley"
```

## 📝 API Endpoints

- `GET /api/cafes?city=Berkeley` - Get cafés by city
- `GET /api/cafes/:id` - Get café details
- `POST /api/reviews` - Submit user review
- `GET /api/cafes/search?q=coffee` - Search cafés

## 🎨 Design

The UI features a calm, cozy aesthetic with:
- Cream (#f9f5f0)
- Coffee brown (#6f4e37)
- Soft gray (#e5dfd5)
- Muted teal accents

## 🚀 Deployment

- Frontend: Vercel/Netlify
- Backend: Render/Railway
- Database: MongoDB Atlas
- Scraper: AWS Lambda or Render cron job

## 📄 License

MIT

