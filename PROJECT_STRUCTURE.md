# 📁 Lattelink Project Structure

```
lattelink/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # Next.js 13+ app directory
│   │   ├── globals.css      # Global styles with coffee-shop theme
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page with search
│   │   └── cafe/[id]/        # Café detail pages
│   ├── components/           # React components
│   │   ├── SearchBar.tsx     # Search input with animations
│   │   ├── CafeCard.tsx      # Café card component
│   │   ├── CafeList.tsx      # List view of cafés
│   │   └── MapView.tsx       # Google Maps integration
│   ├── hooks/                # Custom React hooks
│   │   └── useCafes.ts       # SWR hook for fetching cafés
│   ├── lib/                  # Utilities
│   │   └── api.ts            # API client and types
│   ├── types/                # TypeScript types
│   │   └── google-maps.d.ts  # Google Maps type definitions
│   ├── package.json
│   ├── tailwind.config.js    # Tailwind with coffee theme
│   └── tsconfig.json
│
├── backend/                  # Express.js API server
│   ├── models/               # MongoDB models
│   │   ├── Cafe.js           # Café schema
│   │   └── Review.js         # Review schema
│   ├── routes/               # API routes
│   │   ├── cafes.js          # GET/POST/PUT /api/cafes
│   │   └── reviews.js         # GET/POST /api/reviews
│   ├── scripts/              # Utility scripts
│   │   └── seed-sample-data.js  # Seed database with sample cafés
│   ├── server.js             # Express server entry point
│   └── package.json
│
├── scraper/                  # Python scraper
│   ├── scraper.py            # Main scraper with sentiment analysis
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Scraper documentation
│
├── package.json              # Root workspace config
├── README.md                 # Main project documentation
├── SETUP.md                  # Detailed setup instructions
└── .gitignore
```

## Key Features by Directory

### Frontend (`frontend/`)
- **Next.js 14** with App Router
- **Tailwind CSS** with custom coffee-shop color palette
- **Framer Motion** for smooth animations
- **SWR** for data fetching
- **TypeScript** for type safety
- Responsive design with mobile support

### Backend (`backend/`)
- **Express.js** REST API
- **MongoDB** with Mongoose ODM
- **Express Validator** for input validation
- CORS enabled for frontend communication
- Geospatial queries for location-based search

### Scraper (`scraper/`)
- **Python** with BeautifulSoup/Selenium
- **VADER Sentiment** analysis
- **TextBlob** for NLP
- Keyword extraction for workability factors
- MongoDB integration for data storage

## Color Palette

Defined in `frontend/tailwind.config.js`:
- **Cream**: `#f9f5f0` - Background
- **Coffee Brown**: `#6f4e37` - Primary text/buttons
- **Soft Gray**: `#e5dfd5` - Borders/secondary
- **Muted Teal**: `#5a7d7a` - Accents
- **Forest Green**: `#4a5d4e` - Secondary accents

## API Endpoints

### Cafés
- `GET /api/cafes` - Search/filter cafés
  - Query params: `city`, `neighborhood`, `q`, `wifi`, `outlets`, `noise`, `lat`, `lng`, `radius`
- `GET /api/cafes/:id` - Get single café
- `POST /api/cafes` - Create café (scraper/admin)
- `PUT /api/cafes/:id` - Update café

### Reviews
- `GET /api/reviews` - Get reviews (optional `cafeId` filter)
- `POST /api/reviews` - Create user review
- `POST /api/reviews/:id/helpful` - Mark review as helpful

## Database Schema

### Cafe Collection
```javascript
{
  name: String,
  address: String,
  city: String,
  neighborhood: String,
  coordinates: { lat: Number, lng: Number },
  amenities: {
    wifi: { quality: String, score: Number },
    outlets: { available: Boolean, score: Number },
    seating: { type: String, score: Number },
    noise: { level: String, score: Number }
  },
  workabilityScore: Number,  // Calculated from amenities
  tags: [String],
  reviews: [ObjectId],
  // ... other fields
}
```

### Review Collection
```javascript
{
  cafe: ObjectId,
  source: 'google' | 'yelp' | 'user',
  author: String,
  rating: Number,
  text: String,
  sentiment: {
    overall: Number,
    wifi: Number,
    outlets: Number,
    seating: Number,
    noise: Number
  },
  keywords: [String]
}
```

