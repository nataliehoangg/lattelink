#!/usr/bin/env python3
"""
Lattelink Scraper

Pulls current café data from Google Places and Yelp Fusion APIs, analyses reviews for
workability factors, and upserts the results into MongoDB.

Prerequisites:
  - GOOGLE_PLACES_API_KEY   -> enable Places API (Text Search + Place Details)
  - YELP_API_KEY            -> Yelp Fusion API key
  - MONGODB_URI             -> destination database

See README.md for setup instructions.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple

import requests
from pymongo import MongoClient
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv

load_dotenv()

vader = SentimentIntensityAnalyzer()

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
YELP_API_KEY = os.getenv("YELP_API_KEY")
DEFAULT_MAX_RESULTS = 30

# Keywords to filter obvious restaurants that are unlikely to be laptop-friendly cafés
RESTAURANT_KEYWORDS = {
    "restaurant",
    "steak",
    "steakhouse",
    "grill",
    "bar",
    "pub",
    "tavern",
    "bbq",
    "pizza",
    "burger",
    "diner",
    "cantina",
    "taqueria",
    "brasserie",
    "kitchen",
    "eatery",
    "bistro",
    "trattoria",
    "osteria",
    "brewery",
    "wine",
    "cocktail",
}

CAFE_KEYWORDS = {"cafe", "coffee", "espresso", "tea", "roaster", "latte"}


def _now() -> datetime:
    return datetime.utcnow()


class CafeScraper:
    """Scrapes cafés and updates MongoDB."""

    def __init__(self, mongo_uri: Optional[str] = None):
        self.mongo_uri = mongo_uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017/lattelink")
        self.google_api_key = GOOGLE_PLACES_API_KEY
        self.yelp_api_key = YELP_API_KEY
        self.session = requests.Session()
        self.db = self._connect_db()

    def _connect_db(self):
        try:
            client = MongoClient(self.mongo_uri)
            db_name = self.mongo_uri.rsplit("/", 1)[-1] or "lattelink"
            print(f"✅ Connected to MongoDB: {db_name}")
            return client[db_name]
        except Exception as exc:
            print(f"❌ MongoDB connection error: {exc}")
            sys.exit(1)

    # ------------------------------------------------------------------
    # Sentiment + scoring helpers
    # ------------------------------------------------------------------

    def analyze_review_sentiment(self, text: str) -> Dict:
        """Return sentiment scores focused on workability signals."""
        text = text or ""
        text_lower = text.lower()

        wifi_keywords = ["wifi", "wi-fi", "internet", "connection", "network", "signal"]
        outlet_keywords = ["outlet", "plug", "charging", "power", "socket", "usb"]
        seating_keywords = ["seat", "table", "chair", "space", "room", "crowded", "busy"]
        noise_keywords = ["noise", "loud", "quiet", "silent", "peaceful", "chaotic", "music"]

        vader_score = vader.polarity_scores(text)["compound"]
        blob_score = TextBlob(text).sentiment.polarity
        overall = (vader_score + blob_score) / 2

        def factor_score(keywords: List[str]) -> float:
            if not any(kw in text_lower for kw in keywords):
                return 0.0
            sentences = [s for s in text.split(".") if any(kw in s.lower() for kw in keywords)]
            if not sentences:
                return 0.0
            factor_text = " ".join(sentences)
            v = vader.polarity_scores(factor_text)["compound"]
            b = TextBlob(factor_text).sentiment.polarity
            return (v + b) / 2

        wifi_score = factor_score(wifi_keywords)
        outlet_score = factor_score(outlet_keywords)
        seating_score = factor_score(seating_keywords)
        noise_score = factor_score(noise_keywords)

        keywords_found = []
        if wifi_score:
            keywords_found.append("wifi")
        if outlet_score:
            keywords_found.append("outlets")
        if seating_score:
            keywords_found.append("seating")
        if noise_score:
            keywords_found.append("noise")

        return {
            "overall": overall,
            "wifi": wifi_score,
            "outlets": outlet_score,
            "seating": seating_score,
            "noise": noise_score,
            "keywords": keywords_found,
        }

    def score_amenities(self, reviews: List[Dict]) -> Dict:
        """Aggregate sentiment into amenity scores."""
        if not reviews:
            return {
                "wifi": {"quality": "unknown", "score": 5.0},
                "outlets": {"available": False, "score": 5.0},
                "seating": {"type": "unknown", "score": 5.0},
                "noise": {"level": "unknown", "score": 5.0},
            }

        wifi_scores: List[float] = []
        outlet_scores: List[float] = []
        seating_scores: List[float] = []
        noise_scores: List[float] = []
        outlet_mentions: List[bool] = []

        for review in reviews:
            sentiment = review.get("sentiment", {})
            if sentiment.get("wifi"):
                wifi_scores.append(sentiment["wifi"])
            if sentiment.get("outlets"):
                outlet_scores.append(sentiment["outlets"])
                outlet_mentions.append(sentiment["outlets"] > 0)
            if sentiment.get("seating"):
                seating_scores.append(sentiment["seating"])
            if sentiment.get("noise"):
                noise_scores.append(sentiment["noise"])

        def to_score(value: float) -> float:
            return max(0.0, min(10.0, (value + 1) * 5))

        def to_quality(avg: float, factor: str) -> str:
            if avg > 0.35:
                return {"wifi": "excellent", "noise": "quiet", "seating": "comfortable"}[factor]
            if avg > 0.05:
                return {"wifi": "good", "noise": "moderate", "seating": "adequate"}[factor]
            if avg > -0.25:
                return {"wifi": "spotty", "noise": "moderate", "seating": "limited"}[factor]
            return {"wifi": "poor", "noise": "loud", "seating": "limited"}[factor]

        wifi_avg = sum(wifi_scores) / len(wifi_scores) if wifi_scores else 0.0
        outlet_avg = sum(outlet_scores) / len(outlet_scores) if outlet_scores else 0.0
        seating_avg = sum(seating_scores) / len(seating_scores) if seating_scores else 0.0
        noise_avg = sum(noise_scores) / len(noise_scores) if noise_scores else 0.0

        return {
            "wifi": {"quality": to_quality(wifi_avg, "wifi"), "score": to_score(wifi_avg)},
            "outlets": {
                "available": bool(outlet_mentions) and (sum(outlet_mentions) / len(outlet_mentions) >= 0.4),
                "score": to_score(outlet_avg),
            },
            "seating": {"type": to_quality(seating_avg, "seating"), "score": to_score(seating_avg)},
            "noise": {"level": to_quality(noise_avg, "noise"), "score": to_score(noise_avg)},
        }

    # ------------------------------------------------------------------
    # External API consumers
    # ------------------------------------------------------------------

    def scrape_google_places(self, city: str, max_results: int) -> List[Dict]:
        if not self.google_api_key:
            print("⚠️  GOOGLE_PLACES_API_KEY not set. Skipping Google data.")
            return []

        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            "query": f"cafes for working in {city}",
            "type": "cafe",
            "key": self.google_api_key,
        }

        places: List[Dict] = []
        while len(places) < max_results and params:
            resp = self.session.get(url, params=params, timeout=15)
            data = resp.json()
            if data.get("status") not in {"OK", "ZERO_RESULTS"}:
                print(f"⚠️  Google Places error: {data.get('status')} {data.get('error_message','')}")
                break

            for result in data.get("results", []):
                details = self.fetch_google_details(result.get("place_id"))
                if not details:
                    continue
                candidate = self.normalize_google_place(details)
                if candidate and not self.should_skip_candidate(candidate):
                    places.append(candidate)
                    if len(places) >= max_results:
                        break

            next_token = data.get("next_page_token")
            if len(places) >= max_results or not next_token:
                break
            # Google requires a short delay before using the next_page_token
            time.sleep(2)
            params = {"pagetoken": next_token, "key": self.google_api_key}

        print(f"✅ Google Places returned {len(places)} cafés for {city}")
        return places

    def fetch_google_details(self, place_id: Optional[str]) -> Optional[Dict]:
        if not place_id:
            return None
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": ",".join(
                [
                    "place_id",
                    "name",
                    "formatted_address",
                    "formatted_phone_number",
                    "website",
                    "geometry/location",
                    "types",
                    "opening_hours/weekday_text",
                    "rating",
                    "user_ratings_total",
                    "price_level",
                    "reviews",
                    "address_components",
                ]
            ),
            "reviews_no_translations": "true",
            "key": self.google_api_key,
        }
        resp = self.session.get(url, params=params, timeout=15)
        payload = resp.json()
        if payload.get("status") != "OK":
            return None
        return payload.get("result")

    def normalize_google_place(self, result: Dict) -> Optional[Dict]:
        geometry = result.get("geometry", {}).get("location", {})
        lat, lng = geometry.get("lat"), geometry.get("lng")
        if lat is None or lng is None:
            return None

        address = result.get("formatted_address") or ""
        neighborhood = self.extract_neighborhood(result.get("address_components", []))

        reviews = []
        for review in result.get("reviews", []):
            text = review.get("text") or review.get("original_text", {}).get("text")
            if not text:
                continue
            reviews.append(
                {
                    "source": "google",
                    "source_id": f"google_{result.get('place_id')}_{review.get('time')}",
                    "author": review.get("author_name"),
                    "rating": review.get("rating"),
                    "text": text,
                    "date": datetime.fromtimestamp(review.get("time", 0)),
                    "url": review.get("author_url"),
                }
            )

        return {
            "name": result.get("name", ""),
            "address": address,
            "city": self.extract_city(result.get("address_components", [])),
            "neighborhood": neighborhood,
            "lat": lat,
            "lng": lng,
            "phone": result.get("formatted_phone_number"),
            "website": result.get("website"),
            "hours": self.format_hours(result.get("opening_hours", {}).get("weekday_text")),
            "types": set(result.get("types", [])),
            "price_level": result.get("price_level"),
            "rating_sources": {"google": result.get("rating")},
            "review_counts": {"google": result.get("user_ratings_total")},
            "google_maps_id": result.get("place_id"),
            "yelp_id": None,
            "sources": {"google"},
            "reviews": reviews,
        }

    def scrape_yelp(self, city: str, max_results: int) -> List[Dict]:
        if not self.yelp_api_key:
            print("⚠️  YELP_API_KEY not set. Skipping Yelp data.")
            return []

        headers = {"Authorization": f"Bearer {self.yelp_api_key}"}
        params = {
            "term": "coffee shop",
            "location": city,
            "limit": min(max_results, 50),
            "categories": "coffee,coffeeroasteries,cafes",
            "sort_by": "rating",
        }
        resp = self.session.get(
            "https://api.yelp.com/v3/businesses/search", headers=headers, params=params, timeout=15
        )
        payload = resp.json()
        businesses = payload.get("businesses", [])
        cafes: List[Dict] = []

        for business in businesses:
            details = self.fetch_yelp_details(business.get("id"))
            if not details:
                continue
            candidate = self.normalize_yelp_business(details)
            if candidate and not self.should_skip_candidate(candidate):
                cafes.append(candidate)
                if len(cafes) >= max_results:
                    break

        print(f"✅ Yelp returned {len(cafes)} cafés for {city}")
        return cafes

    def fetch_yelp_details(self, business_id: Optional[str]) -> Optional[Dict]:
        if not business_id:
            return None
        headers = {"Authorization": f"Bearer {self.yelp_api_key}"}
        resp = self.session.get(
            f"https://api.yelp.com/v3/businesses/{business_id}", headers=headers, timeout=15
        )
        if resp.status_code != 200:
            return None
        data = resp.json()

        reviews_resp = self.session.get(
            f"https://api.yelp.com/v3/businesses/{business_id}/reviews", headers=headers, timeout=15
        )
        if reviews_resp.status_code == 200:
            data["reviews_payload"] = reviews_resp.json().get("reviews", [])
        else:
            data["reviews_payload"] = []
        return data

    def normalize_yelp_business(self, business: Dict) -> Optional[Dict]:
        coordinates = business.get("coordinates", {})
        lat, lng = coordinates.get("latitude"), coordinates.get("longitude")
        if lat is None or lng is None:
            return None

        address = ", ".join(business.get("location", {}).get("display_address", []))
        reviews = []
        for review in business.get("reviews_payload", []):
            text = review.get("text")
            if not text:
                continue
            timestamp = review.get("time_created", "").replace(" ", "T")
            try:
                review_date = datetime.fromisoformat(timestamp)
            except Exception:
                review_date = _now()
            reviews.append(
                {
                    "source": "yelp",
                    "source_id": f"yelp_{review.get('id')}",
                    "author": review.get("user", {}).get("name"),
                    "rating": review.get("rating"),
                    "text": text,
                    "date": review_date,
                    "url": review.get("url"),
                }
            )

        types = {cat.get("alias") for cat in business.get("categories", []) if cat.get("alias")}

        return {
            "name": business.get("name", ""),
            "address": address,
            "city": business.get("location", {}).get("city"),
            "neighborhood": (business.get("location", {}).get("neighborhoods") or [None])[0],
            "lat": lat,
            "lng": lng,
            "phone": business.get("display_phone"),
            "website": business.get("url"),
            "hours": self.format_yelp_hours(business.get("hours", [])),
            "types": types,
            "price_level": len(business.get("price", "") or ""),
            "rating_sources": {"yelp": business.get("rating")},
            "review_counts": {"yelp": business.get("review_count")},
            "google_maps_id": None,
            "yelp_id": business.get("id"),
            "sources": {"yelp"},
            "reviews": reviews,
        }

    # ------------------------------------------------------------------
    # Normalisation / dedupe helpers
    # ------------------------------------------------------------------

    def format_hours(self, weekday_text: Optional[List[str]]) -> Dict:
        if not weekday_text:
            return {}
        hours = {}
        for entry in weekday_text:
            if ": " in entry:
                day, value = entry.split(": ", 1)
                hours[day.lower()] = value
        return hours

    def format_yelp_hours(self, hours_payload: List[Dict]) -> Dict:
        if not hours_payload:
            return {}
        mapping = {}
        days_lookup = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for block in hours_payload:
            for span in block.get("open", []):
                day_index = span.get("day")
                if day_index is None:
                    continue
                start = span.get("start")
                end = span.get("end")
                if start and end:
                    mapping[days_lookup[day_index]] = f"{start[:2]}:{start[2:]} - {end[:2]}:{end[2:]}"
        return mapping

    def extract_neighborhood(self, components: List[Dict]) -> Optional[str]:
        for comp in components:
            types = comp.get("types", [])
            if "neighborhood" in types or "sublocality" in types:
                return comp.get("long_name")
        return None

    def extract_city(self, components: List[Dict]) -> Optional[str]:
        for comp in components:
            if "locality" in comp.get("types", []):
                return comp.get("long_name")
        return None

    def should_skip_candidate(self, candidate: Dict) -> bool:
        """Heuristics to avoid restaurants or primarily food venues."""
        name = candidate.get("name", "").lower()
        types = {t.lower() for t in candidate.get("types", set()) if t}

        if any(keyword in name for keyword in RESTAURANT_KEYWORDS) and not any(
            kw in name for kw in CAFE_KEYWORDS
        ):
            return True

        if "restaurant" in types and not ({"cafe", "coffee_shop"} & types):
            return True

        if candidate.get("sources") == {"yelp"}:
            categories = types
            if categories and not ({"coffee", "coffeeroasteries", "cafes"} & categories):
                return True

        return False

    def merge_candidates(self, *candidate_lists: List[Dict], max_results: int) -> List[Dict]:
        merged: Dict[str, Dict] = {}

        def key_for(candidate: Dict) -> str:
            name = candidate.get("name", "").strip().lower()
            address = candidate.get("address", "").strip().lower()
            return f"{name}|{address}"

        def merge(target: Dict, source: Dict):
            target["sources"].update(source.get("sources", []))
            target["types"].update(source.get("types", []))
            target["reviews"].extend(source.get("reviews", []))

            for field in ["phone", "website", "hours", "google_maps_id", "yelp_id", "lat", "lng", "neighborhood", "city"]:
                if not target.get(field) and source.get(field):
                    target[field] = source.get(field)

            for field in ["price_level"]:
                if target.get(field) is None and source.get(field) is not None:
                    target[field] = source.get(field)

            target["rating_sources"].update(
                {k: v for k, v in source.get("rating_sources", {}).items() if v is not None}
            )
            target["review_counts"].update(
                {k: v for k, v in source.get("review_counts", {}).items() if v is not None}
            )

        for candidates in candidate_lists:
            for candidate in candidates:
                k = key_for(candidate)
                if k in merged:
                    merge(merged[k], candidate)
                else:
                    merged[k] = {
                        **candidate,
                        "types": set(candidate.get("types", set())),
                        "sources": set(candidate.get("sources", [])),
                        "reviews": list(candidate.get("reviews", [])),
                        "rating_sources": dict(candidate.get("rating_sources", {})),
                        "review_counts": dict(candidate.get("review_counts", {})),
                    }

        merged_list = list(merged.values())
        merged_list.sort(key=lambda c: (c["rating_sources"].get("google", 0) or 0), reverse=True)
        return merged_list[:max_results]

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def process_cafe(self, cafe_data: Dict, reviews: List[Dict]) -> None:
        analyzed_reviews = []
        for review in reviews:
            sentiment = self.analyze_review_sentiment(review.get("text", ""))
            analyzed_reviews.append({**review, "sentiment": sentiment})

        amenities = self.score_amenities(analyzed_reviews)

        tags: Set[str] = {"Laptop-Friendly", "Study-Friendly"}
        wifi_quality = amenities["wifi"]["quality"]
        if wifi_quality in {"excellent", "good"}:
            tags.add("Fast Wi-Fi")
        if amenities["outlets"]["available"]:
            tags.add("Many Outlets")
        if amenities["noise"]["level"] == "quiet":
            tags.add("Quiet")
        if amenities["seating"]["type"] == "comfortable":
            tags.add("Spacious")

        coordinates = {
            "type": "Point",
            "coordinates": [cafe_data.get("lng", 0.0), cafe_data.get("lat", 0.0)],
        }

        cafe_doc = {
            "name": cafe_data.get("name", ""),
            "address": cafe_data.get("address", ""),
            "city": cafe_data.get("city", ""),
            "neighborhood": cafe_data.get("neighborhood") or "",
            "coordinates": coordinates,
            "amenities": amenities,
            "tags": list(tags),
            "googleMapsId": cafe_data.get("google_maps_id"),
            "yelpId": cafe_data.get("yelp_id"),
            "phone": cafe_data.get("phone"),
            "website": cafe_data.get("website"),
            "hours": cafe_data.get("hours", {}),
            "priceLevel": cafe_data.get("price_level"),
            "sources": list(cafe_data.get("sources", [])),
            "types": list(cafe_data.get("types", set())),
            "rating": self.compute_overall_rating(cafe_data.get("rating_sources", {})),
            "ratingSources": cafe_data.get("rating_sources", {}),
            "reviewCounts": cafe_data.get("review_counts", {}),
            "lastUpdated": _now(),
        }

        cafes_collection = self.db.cafes
        reviews_collection = self.db.reviews

        existing = cafes_collection.find_one(
            {
                "$or": [
                    {"googleMapsId": cafe_doc.get("googleMapsId")},
                    {"yelpId": cafe_doc.get("yelpId")},
                    {"name": cafe_doc["name"], "address": cafe_doc["address"]},
                ]
            }
        )

        if existing:
            cafe_id = existing["_id"]
            cafes_collection.update_one({"_id": cafe_id}, {"$set": cafe_doc})
            action_text = "Updated"
        else:
            result = cafes_collection.insert_one(cafe_doc)
            cafe_id = result.inserted_id
            action_text = "Added"

        review_ids = []
        for review in analyzed_reviews:
            review_doc = {
                "cafe": cafe_id,
                "source": review.get("source", "unknown"),
                "sourceId": review.get("source_id"),
                "author": review.get("author") or "Anonymous",
                "rating": review.get("rating"),
                "text": review.get("text", ""),
                "sentiment": review.get("sentiment", {}),
                "keywords": review.get("sentiment", {}).get("keywords", []),
                "date": review.get("date", _now()),
                "url": review.get("url"),
            }
            if not review_doc["text"]:
                continue
            if review_doc["sourceId"]:
                exists = reviews_collection.find_one(
                    {"sourceId": review_doc["sourceId"], "cafe": cafe_id}
                )
                if exists:
                    continue
            inserted = reviews_collection.insert_one(review_doc)
            review_ids.append(inserted.inserted_id)

        if review_ids:
            cafes_collection.update_one({"_id": cafe_id}, {"$addToSet": {"reviews": {"$each": review_ids}}})

        print(f"✅ {action_text} café: {cafe_doc['name']}")

    def compute_overall_rating(self, rating_sources: Dict[str, Optional[float]]) -> Optional[float]:
        scores = [score for score in rating_sources.values() if isinstance(score, (int, float))]
        if not scores:
            return None
        return round(sum(scores) / len(scores), 2)

    # ------------------------------------------------------------------
    # Public entrypoint
    # ------------------------------------------------------------------

    def scrape_city(self, city: str, max_results: int = DEFAULT_MAX_RESULTS):
        print(f"\n☕ Starting scrape for {city} (max {max_results})\n")

        google_candidates = self.scrape_google_places(city, max_results)
        yelp_candidates = self.scrape_yelp(city, max_results)

        merged_candidates = self.merge_candidates(
            google_candidates, yelp_candidates, max_results=max_results
        )

        if not merged_candidates:
            print("⚠️  No cafés found with current filters.")
            return

        saved = 0
        for candidate in merged_candidates:
            if candidate.get("lat") is None or candidate.get("lng") is None:
                continue
            self.process_cafe(candidate, candidate.get("reviews", []))
            saved += 1

        print(f"\n🎉 Scraping complete for {city}. Saved/updated {saved} cafés.\n")


def main():
    parser = argparse.ArgumentParser(description="Scrape café data for Lattelink")
    parser.add_argument("--city", type=str, required=True, help="City or region to scrape")
    parser.add_argument(
        "--max-results",
        type=int,
        default=DEFAULT_MAX_RESULTS,
        help=f"Maximum number of cafés to process (default {DEFAULT_MAX_RESULTS})",
    )
    parser.add_argument("--mongo-uri", type=str, help="MongoDB connection URI override")
    args = parser.parse_args()

    scraper = CafeScraper(mongo_uri=args.mongo_uri)
    scraper.scrape_city(args.city, max_results=args.max_results)


if __name__ == "__main__":
    main()
