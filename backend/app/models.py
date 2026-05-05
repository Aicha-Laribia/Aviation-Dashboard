from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class Flight(Base):
    __tablename__ = "flights"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    icao24      = Column(String, index=True)
    callsign    = Column(String, nullable=True)
    origin_country = Column(String)
    longitude   = Column(Float)
    latitude    = Column(Float)
    altitude_m  = Column(Float, nullable=True)
    velocity_ms = Column(Float, nullable=True)
    heading     = Column(Float, nullable=True)
    on_ground   = Column(Boolean)
    fetched_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))