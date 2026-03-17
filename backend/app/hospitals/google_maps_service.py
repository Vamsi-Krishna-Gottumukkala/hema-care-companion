import requests
from app.config import get_settings


async def search_nearby_hospitals(lat: float, lng: float, radius: int = 5000) -> list[dict]:
    """Search for nearby hospitals using Google Maps Places API (Nearby Search)."""
    settings = get_settings()
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "hospital",
        "keyword": "hematology oncology cancer blood",
        "key": settings.GOOGLE_MAPS_API_KEY,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if data.get("status") != "OK":
            return []

        hospitals = []
        for place in data.get("results", []):
            location = place.get("geometry", {}).get("location", {})
            hospitals.append({
                "name": place.get("name", ""),
                "address": place.get("vicinity", ""),
                "rating": place.get("rating"),
                "lat": location.get("lat"),
                "lng": location.get("lng"),
                "phone": None,  # Requires Place Details call
                "specializations": ["Hospital"],
                "beds": None,
                "founded": None,
                "source": "google_maps",
                "place_id": place.get("place_id"),
                "open_now": place.get("opening_hours", {}).get("open_now"),
            })

        return hospitals

    except Exception:
        return []


async def get_place_details(place_id: str) -> dict | None:
    """Get detailed info about a place using Google Maps Place Details API."""
    settings = get_settings()
    url = "https://maps.googleapis.com/maps/api/place/details/json"

    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,formatted_phone_number,rating,website,opening_hours",
        "key": settings.GOOGLE_MAPS_API_KEY,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if data.get("status") != "OK":
            return None

        result = data.get("result", {})
        return {
            "name": result.get("name"),
            "address": result.get("formatted_address"),
            "phone": result.get("formatted_phone_number"),
            "rating": result.get("rating"),
            "website": result.get("website"),
        }

    except Exception:
        return None
