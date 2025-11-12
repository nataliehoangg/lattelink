# Lattelink Scraper

Python scraper for collecting café data from Google Maps and Yelp, analyzing reviews for workability factors.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (`.env`):
```
MONGODB_URI=mongodb://localhost:27017/lattelink
GOOGLE_PLACES_API_KEY=your_key_here
YELP_API_KEY=your_key_here
```

## Usage

```bash
python scraper.py --city "Berkeley" --max-results 20
```

## What the scraper does

- Queries **Google Places Text Search** and **Place Details** to gather café metadata and up to five recent reviews per place.
- Queries **Yelp Fusion** search, business details, and reviews, then merges the results with Google data.
- Applies heuristics to skip obvious restaurants (name/type keywords, business categories).
- Runs sentiment analysis on every review to score Wi-Fi, outlet availability, seating comfort, and noise.
- Aggregates sentiment into a workability score, generates amenity tags, and upserts the café + review data into MongoDB.

The script stores additional context in MongoDB such as source ratings, review counts, price level, hours, and sources (`google`, `yelp`, `user`).

## Sentiment Analysis

The scraper uses:
- **VADER Sentiment**: For general sentiment analysis
- **TextBlob**: For additional sentiment scoring
- **Keyword Matching**: To identify workability factors (Wi-Fi, outlets, seating, noise)

Reviews are analyzed to extract:
- Wi-Fi quality scores
- Outlet availability
- Seating comfort
- Noise levels

These are aggregated into a "workability score" for each café.

## Notes

- Google Places enforces a short delay when paging results; the scraper handles this automatically.
- Yelp Fusion rate limits apply (default script keeps requests under typical free-tier limits).
- If either API key is missing, that data source is skipped with a warning.
- The script de-duplicates cafés by name + address and merges reviews across sources.

