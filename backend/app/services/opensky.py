import os
import httpx
import logging

logger = logging.getLogger(__name__)

# URL de l'API OpenSky
OPENSKY_URL = "https://opensky-network.org/api/states/all"

# RÉCUPÉRATION SÉCURISÉE
# Sur Hugging Face, crée des "Secrets" nommés OPENSKY_CLIENT_ID et OPENSKY_CLIENT_SECRET
CLIENT_ID = os.getenv("OPENSKY_CLIENT_ID")
CLIENT_SECRET = os.getenv("OPENSKY_CLIENT_SECRET")

async def get_oauth_token():
    """
    Récupère un jeton OAuth2 (Norme 2026).
    """
    if not CLIENT_ID or not CLIENT_SECRET:
        logger.warning("⚠️ Identifiants manquants. Passage en mode anonyme (limité).")
        return None
    
    auth_url = "https://opensky-network.org/auth/realms/opensky/protocol/openid-connect/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(auth_url, data=data)
            resp.raise_for_status()
            return resp.json().get("access_token")
    except Exception as e:
        logger.error(f"❌ Erreur d'authentification OAuth2 : {e}")
        return None

async def fetch_flights(bbox: dict):
    """
    Récupère les vols en direct via l'API OpenSky.
    """
    token = await get_oauth_token()
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            # On passe la bbox en paramètres (lamin, lomin, lamax, lomax)
            response = await client.get(OPENSKY_URL, params=bbox, headers=headers)
            
            if response.status_code == 429:
                logger.error("🚫 OpenSky : Trop de requêtes (Rate Limit).")
                return []
                
            response.raise_for_status()
            data = response.json()

        states = data.get("states") or []
        flights = []
        
        for s in states:
            # On ignore les avions sans position GPS (indices 5 et 6)
            if s[5] is None or s[6] is None:
                continue
                
            flights.append({
                "icao24":         s[0],
                "callsign":       s[1].strip() if s[1] else "N/A",
                "origin_country": s[2],
                "longitude":      s[5],
                "latitude":       s[6],
                "altitude_m":     s[7],
                "velocity_ms":    s[9],
                "heading":        s[10],
                "on_ground":      s[8],
            })

        logger.info(f"✅ {len(flights)} vols récupérés.")
        return flights

    except Exception as e:
        logger.error(f"❌ Erreur API OpenSky : {e}")
        return []