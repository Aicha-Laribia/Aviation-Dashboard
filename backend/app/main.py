from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.services.opensky import fetch_flights
from app.database import init_db, get_db
from app.models import Flight
from app.scheduler import scheduler, collect_morocco_flights

app = FastAPI(title="Aviation Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    init_db()  # create tables if they don't exist
    
    # Add the job: run collect_morocco_flights every 60 seconds
    scheduler.add_job(
        collect_morocco_flights,
        trigger="interval",
        seconds=60,
        id="collect_flights",  # unique name so we don't add it twice
    )
    
    scheduler.start()
    
    # Run once immediately so you don't wait 60s for first data
    await collect_morocco_flights()

@app.on_event("shutdown")
def shutdown():
    scheduler.shutdown()  # clean stop when you kill the server

@app.get("/")
def root():
    return {"status": "ok", "message": "Aviation API running"}

@app.get("/flights/morocco")
async def get_morocco_flights(db: Session = Depends(get_db)):
    # Now this just reads from DB instead of calling OpenSky every time
    flights = db.query(Flight)\
                .order_by(Flight.fetched_at.desc())\
                .limit(50)\
                .all()
    return {"count": len(flights), "flights": [
        {
            "icao24": f.icao24,
            "callsign": f.callsign,
            "origin_country": f.origin_country,
            "longitude": f.longitude,
            "latitude": f.latitude,
            "altitude_m": f.altitude_m,
            "velocity_ms": f.velocity_ms,
            "heading": f.heading,
            "on_ground": f.on_ground,
            "fetched_at": str(f.fetched_at),
        } for f in flights
    ]}

@app.get("/flights/history")
def get_history(db: Session = Depends(get_db)):
    flights = db.query(Flight)\
                .order_by(Flight.fetched_at.desc())\
                .limit(200)\
                .all()
    return {"count": len(flights), "flights": [
        {
            "icao24": f.icao24,
            "callsign": f.callsign,
            "origin_country": f.origin_country,
            "longitude": f.longitude,
            "latitude": f.latitude,
            "altitude_m": f.altitude_m,
            "fetched_at": str(f.fetched_at),
        } for f in flights
    ]}

@app.get("/flights/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Flight).count()
    unique_aircraft = db.query(Flight.icao24).distinct().count()
    countries = db.query(Flight.origin_country).distinct().all()
    
    return {
        "total_records": total,
        "unique_aircraft": unique_aircraft,
        "countries_seen": [c[0] for c in countries],
    }