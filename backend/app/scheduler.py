from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.opensky import fetch_flights
from app.database import SessionLocal
from app.models import Flight
import logging

# This sets up logging so you can see in the terminal when data is collected
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the scheduler object — think of it as the alarm clock
scheduler = AsyncIOScheduler()

async def collect_morocco_flights():
    """
    This function runs automatically every 60 seconds.
    It fetches flights and saves them to the database.
    """
    bbox = {"lamin": 27.0, "lomin": -13.0, "lamax": 36.0, "lomax": -1.0}
    
    try:
        flights = await fetch_flights(bbox=bbox)
        
        # We open a database session manually here
        # (we can't use Depends() outside of a route)
        db = SessionLocal()
        
        for f in flights:
            db.add(Flight(**f))
        
        db.commit()
        db.close()
        
        logger.info(f"Collected {len(flights)} flights over Morocco")
    
    except Exception as e:
        # If OpenSky is down or rate-limits us, just log it and move on
        logger.error(f"Failed to collect flights: {e}")