import aiohttp
import asyncio
from app.config import get_settings


async def search_nearby_hospitals(lat: float, lng: float, radius: int = 5000) -> list[dict]:
    """Search for nearby hospitals using Mapbox Search Box API (category search) with fallback to Geocoding v5."""
    settings = get_settings()
    token = settings.MAPBOX_API_KEY

    # Strategy 1: Mapbox Search Box API v1 — best POI coverage globally including India
    results = await _search_box_hospitals(lat, lng, token)
    if results:
        return results

    # Strategy 2: Mapbox Geocoding v5 with multiple query terms
    results = await _geocoding_hospitals(lat, lng, token)
    if results:
        return results

    return []


async def _search_box_hospitals(lat: float, lng: float, token: str) -> list[dict]:
    """Use Mapbox Search Box API for category-based hospital search (better India coverage)."""
    url = "https://api.mapbox.com/search/searchbox/v1/category/hospital"
    params = {
        "proximity": f"{lng},{lat}",
        "limit": 25,
        "language": "en",
        "access_token": token,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
                data = await response.json()

        features = data.get("features", [])
        if not features:
            return []

        hospitals = []
        for feature in features:
            props = feature.get("properties", {})
            coords = feature.get("geometry", {}).get("coordinates", [0, 0])
            hospitals.append({
                "name": props.get("name", "Unknown Hospital"),
                "address": props.get("full_address") or props.get("address", ""),
                "rating": None,
                "lat": coords[1] if len(coords) > 1 else None,
                "lng": coords[0] if len(coords) > 0 else None,
                "phone": None,
                "specializations": ["Hospital"],
                "beds": None,
                "founded": None,
                "source": "mapbox_searchbox",
                "mapbox_id": props.get("mapbox_id"),
            })
        return hospitals
    except Exception:
        return []


async def _geocoding_hospitals(lat: float, lng: float, token: str) -> list[dict]:
    """Fallback: Mapbox Geocoding v5 with multiple queries for broader coverage."""
    # Strict search terms for oncology & hematology to avoid generic POI noise
    queries = ["hospital", "cancer hospital", "oncology center", "hematology clinic"]
    seen_names: set[str] = set()
    all_hospitals: list[dict] = []

    try:
        async with aiohttp.ClientSession() as session:
            tasks = [
                _geocoding_query(session, q, lat, lng, token)
                for q in queries
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        for batch in results:
            if isinstance(batch, Exception) or not batch:
                continue
            for h in batch:
                name = h.get("name", "")
                
                # Strict name filter: only include if the name actually sounds medical
                name_lower = name.lower()
                valid_keywords = ["hospital", "clinic", "medical", "health", "care", "cancer", "oncolog", "hematolog", "diagnostics"]
                if not any(k in name_lower for k in valid_keywords):
                    continue

                if name and name not in seen_names:
                    seen_names.add(name)
                    all_hospitals.append(h)
                if len(all_hospitals) >= 25:
                    break
            if len(all_hospitals) >= 25:
                break

        return all_hospitals
    except Exception:
        return []


async def _geocoding_query(session: aiohttp.ClientSession, query: str, lat: float, lng: float, token: str) -> list[dict]:
    """Run a single geocoding query."""
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json"
    params = {
        "proximity": f"{lng},{lat}",
        "types": "poi",
        "limit": 10,
        "language": "en",
        "access_token": token,
    }
    try:
        async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=8)) as response:
            data = await response.json()

        hospitals = []
        for feature in data.get("features", []):
            geometry = feature.get("geometry", {})
            coords = geometry.get("coordinates", [0, 0])
            place_name = feature.get("place_name", "")
            name = feature.get("text", place_name.split(",")[0])

            # Build address from context
            context = feature.get("context", [])
            address_parts = []
            for ctx in context:
                ctx_id = ctx.get("id", "")
                if any(t in ctx_id for t in ["neighborhood", "place", "district", "region"]):
                    address_parts.append(ctx.get("text", ""))
            address = ", ".join(address_parts) if address_parts else place_name

            hospitals.append({
                "name": name,
                "address": address,
                "rating": None,
                "lat": coords[1] if len(coords) > 1 else None,
                "lng": coords[0] if len(coords) > 0 else None,
                "phone": None,
                "specializations": ["Hospital"],
                "beds": None,
                "founded": None,
                "source": "mapbox_geocoding",
                "mapbox_id": feature.get("id"),
            })
        return hospitals
    except Exception:
        return []


async def search_hospitals_category(lat: float, lng: float, radius: int = 5000) -> list[dict]:
    """Alias kept for backward compat — delegates to main function."""
    return await search_nearby_hospitals(lat, lng, radius)
