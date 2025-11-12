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

## Implementation Notes

This scraper provides the structure and sentiment analysis logic. To fully implement:

1. **Google Places API**: Sign up at [Google Cloud Console](https://console.cloud.google.com/) and enable Places API
2. **Yelp Fusion API**: Sign up at [Yelp Developers](https://www.yelp.com/developers)
3. Implement the `scrape_google_maps()` and `scrape_yelp()` methods with actual API calls

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

