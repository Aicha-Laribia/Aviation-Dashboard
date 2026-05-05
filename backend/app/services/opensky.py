import httpx

OPENSKY_URL = "https://opensky-network.org/api/states/all"

async def fetch_flights(bbox: dict | None = None) -> list[dict]:
    """
    Fetch live flights from OpenSky. 
    bbox = {"lamin": 27.0, "lomin": -13.0, "lamax": 36.0, "lomax": -1.0} for Morocco
    """
    params = bbox or {}
    
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(OPENSKY_URL, params=params)
        response.raise_for_status()
        data = response.json()
    
    if not data or not data.get("states"):
        return []

    flights = []
    for s in data["states"]:
        if s[5] is None or s[6] is None:  # skip if no position
            continue
        flights.append({
            "icao24":      s[0],
            "callsign":    s[1].strip() if s[1] else None,
            "origin_country": s[2],
            "longitude":   s[5],
            "latitude":    s[6],
            "altitude_m":  s[7],
            "velocity_ms": s[9],
            "heading":     s[10],
            "on_ground":   s[8],
        })
    
    return flights