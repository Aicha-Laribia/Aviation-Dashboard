import pandas as pd
import numpy as np
import os

np.random.seed(42)
N = 80_000  # 80k flights — enough for solid ML

# -------------------------------------------------------
# REAL RAM ROUTES with realistic frequencies
# Format: (origin, destination, airline, avg_duration_min)
# Frequencies reflect actual RAM network importance
# -------------------------------------------------------
ROUTES = [
    # CMN hub — Europe (highest traffic)
    ("CMN", "CDG", "RAM", 165),  # Casablanca → Paris Charles de Gaulle
    ("CDG", "CMN", "RAM", 175),
    ("CMN", "LHR", "RAM", 185),  # Casablanca → London
    ("LHR", "CMN", "RAM", 195),
    ("CMN", "MAD", "RAM", 120),  # Casablanca → Madrid
    ("MAD", "CMN", "RAM", 125),
    ("CMN", "BCN", "RAM", 130),  # Casablanca → Barcelona
    ("BCN", "CMN", "RAM", 135),
    ("CMN", "AMS", "RAM", 195),  # Casablanca → Amsterdam
    ("CMN", "FCO", "RAM", 175),  # Casablanca → Rome
    ("CMN", "BRU", "RAM", 185),  # Casablanca → Brussels
    ("CMN", "FRA", "RAM", 190),  # Casablanca → Frankfurt
    ("CMN", "GVA", "RAM", 180),  # Casablanca → Geneva
    ("CMN", "MRS", "RAM", 150),  # Casablanca → Marseille
    ("CMN", "LYS", "RAM", 155),  # Casablanca → Lyon

    # CMN hub — North America (long haul)
    ("CMN", "JFK", "RAM", 435),  # Casablanca → New York
    ("JFK", "CMN", "RAM", 420),
    ("CMN", "YUL", "RAM", 450),  # Casablanca → Montreal
    ("CMN", "IAD", "RAM", 440),  # Casablanca → Washington

    # CMN hub — Africa
    ("CMN", "DKR", "RAM", 195),  # Casablanca → Dakar
    ("CMN", "ABJ", "RAM", 265),  # Casablanca → Abidjan
    ("CMN", "CMN", "RAM", 0),    # placeholder removed below
    ("CMN", "TUN", "RAM", 110),  # Casablanca → Tunis
    ("CMN", "ALG", "RAM", 105),  # Casablanca → Algiers
    ("CMN", "CAI", "RAM", 210),  # Casablanca → Cairo
    ("CMN", "NBO", "RAM", 420),  # Casablanca → Nairobi
    ("CMN", "LOS", "RAM", 330),  # Casablanca → Lagos

    # RAK — Tourist airport (Marrakech) mostly European low cost
    ("RAK", "CDG", "RAM", 175),
    ("CDG", "RAK", "RAM", 185),
    ("RAK", "LHR", "RAM", 195),
    ("LHR", "RAK", "RAM", 205),
    ("RAK", "MAD", "RAM", 130),
    ("RAK", "BCN", "RAM", 140),
    ("RAK", "ORY", "RAM", 170),  # Paris Orly
    ("ORY", "RAK", "RAM", 180),
    ("RAK", "CDG", "RYR", 175),  # Ryanair on Marrakech routes
    ("RAK", "STN", "RYR", 200),  # Ryanair London Stansted
    ("STN", "RAK", "RYR", 210),
    ("RAK", "BCN", "VLG", 140),  # Vueling
    ("RAK", "FCO", "RYR", 190),

    # AGA — Agadir (beach tourism)
    ("AGA", "CDG", "RAM", 185),
    ("CDG", "AGA", "RAM", 195),
    ("AGA", "LHR", "RAM", 200),
    ("AGA", "ORY", "RAM", 180),
    ("AGA", "STN", "RYR", 215),
    ("STN", "AGA", "RYR", 225),

    # FEZ — Fes (cultural tourism + Moroccan diaspora)
    ("FEZ", "CDG", "RAM", 170),
    ("CDG", "FEZ", "RAM", 180),
    ("FEZ", "ORY", "RAM", 165),
    ("FEZ", "BCN", "VLG", 135),
    ("FEZ", "MAD", "IBE", 125),
    ("FEZ", "BRU", "RAM", 190),

    # TNG — Tangier
    ("TNG", "CDG", "RAM", 155),
    ("TNG", "MAD", "RAM", 105),
    ("TNG", "BCN", "RYR", 130),

    # RBA — Rabat (domestic + some international)
    ("RBA", "CDG", "RAM", 160),
    ("CDG", "RBA", "RAM", 170),
    ("RBA", "MAD", "RAM", 110),

    # Domestic routes
    ("CMN", "RAK", "RAM", 45),
    ("RAK", "CMN", "RAM", 45),
    ("CMN", "FEZ", "RAM", 50),
    ("FEZ", "CMN", "RAM", 50),
    ("CMN", "AGA", "RAM", 55),
    ("AGA", "CMN", "RAM", 55),
    ("CMN", "TNG", "RAM", 50),
    ("CMN", "OUD", "RAM", 65),  # Oujda
    ("CMN", "NDR", "RAM", 70),  # Nador
]

# Remove the placeholder
ROUTES = [(o, d, a, dur) for o, d, a, dur in ROUTES if o != d]

# -------------------------------------------------------
# ROUTE WEIGHTS — more popular routes appear more often
# -------------------------------------------------------
ROUTE_WEIGHTS = []
for o, d, a, dur in ROUTES:
    w = 1.0
    if "CMN" in (o, d) and any(x in (o, d) for x in ["CDG", "LHR", "MAD"]):
        w = 4.0   # most popular routes
    elif "CMN" in (o, d) and any(x in (o, d) for x in ["JFK", "YUL", "IAD"]):
        w = 2.0   # long haul
    elif "RAK" in (o, d) or "AGA" in (o, d):
        w = 2.5   # tourist airports busy
    elif o in ("CMN", "RAK") and d in ("CMN", "RAK"):
        w = 3.0   # domestic CMN-RAK very frequent
    ROUTE_WEIGHTS.append(w)

total_w = sum(ROUTE_WEIGHTS)
ROUTE_WEIGHTS = [w / total_w for w in ROUTE_WEIGHTS]

# -------------------------------------------------------
# SAMPLE ROUTES
# -------------------------------------------------------
route_indices = np.random.choice(len(ROUTES), size=N, p=ROUTE_WEIGHTS)
origins      = [ROUTES[i][0] for i in route_indices]
destinations = [ROUTES[i][1] for i in route_indices]
airlines     = [ROUTES[i][2] for i in route_indices]
durations    = [ROUTES[i][3] for i in route_indices]

# -------------------------------------------------------
# TIME FEATURES
# -------------------------------------------------------
# Month: realistic distribution — summer peak (Jul/Aug),
# holiday peak (Dec), Ramadan dip varies by year
month_weights = [0.06, 0.06, 0.07, 0.08, 0.09, 0.09,
                 0.11, 0.11, 0.09, 0.08, 0.07, 0.09]
month_weights = np.array(month_weights)
month_weights = month_weights / month_weights.sum()
months = np.random.choice(range(1, 13), size=N, p=month_weights)

dow_weights = [0.13, 0.11, 0.12, 0.13, 0.16, 0.19, 0.16]
dow_weights = np.array(dow_weights)
dow_weights = dow_weights / dow_weights.sum()
days_of_week = np.random.choice(range(7), size=N, p=dow_weights)


# Hour of departure: bimodal — morning bank (6-9) and evening bank (17-21)
hour_weights = [0.01, 0.01, 0.01, 0.01, 0.02, 0.04,
                0.06, 0.07, 0.06, 0.05, 0.04, 0.04,
                0.04, 0.04, 0.04, 0.05, 0.06, 0.08,
                0.08, 0.07, 0.06, 0.05, 0.04, 0.02]
# Normalize to guarantee sum = 1
hour_weights = np.array(hour_weights)
hour_weights = hour_weights / hour_weights.sum()
dep_hours = np.random.choice(range(24), size=N, p=hour_weights)

# -------------------------------------------------------
# DELAY PROBABILITY — built from real patterns
#
# Base rate: ~28% delayed (consistent with RAM ~72% OTP)
# Each factor adjusts the probability up or down
# -------------------------------------------------------

def compute_delay_prob(origin, destination, airline, duration,
                       month, dow, hour):
    p = 0.28  # base delay rate

    # --- SEASONAL EFFECTS ---
    # July/August: peak summer, airports saturated
    if month in (7, 8):
        p += 0.18
    # December: Christmas/New Year rush
    elif month == 12:
        p += 0.12
    # June/September: shoulder season, slightly elevated
    elif month in (6, 9):
        p += 0.06
    # February/March: quietest, fewer delays
    elif month in (2, 3):
        p -= 0.06

    # --- DAY OF WEEK EFFECTS ---
    # Friday: Moroccan diaspora + weekend travelers, very busy
    if dow == 4:   # Friday
        p += 0.10
    # Saturday: still busy outbound tourists
    elif dow == 5:
        p += 0.06
    # Tuesday/Wednesday: quietest days
    elif dow in (1, 2):
        p -= 0.05

    # --- TIME OF DAY EFFECTS ---
    # Late evening: cascade delays from earlier in the day
    if hour >= 20:
        p += 0.12
    elif hour >= 17:
        p += 0.07
    # Early morning: aircraft fresh, fewer cascades
    elif hour <= 8:
        p -= 0.06

    # --- ROUTE EFFECTS ---
    # Long haul: more exposure to disruptions
    if duration > 360:   # >6h
        p += 0.08
    elif duration > 180: # >3h
        p += 0.03
    # Domestic: short, more predictable
    elif duration < 60:
        p -= 0.08

    # --- AIRPORT CONGESTION ---
    # RAK and AGA: tourist airports, overwhelmed in summer
    if origin in ("RAK", "AGA") and month in (6, 7, 8, 9):
        p += 0.10
    # CMN: hub congestion, especially with connections
    if origin == "CMN" and duration > 180:
        p += 0.04  # connecting hub effect

    # --- AIRLINE EFFECTS ---
    # RAM slightly more delay-prone than European carriers on same routes
    # (consistent with FlightStats data)
    if airline == "RAM":
        p += 0.03
    elif airline == "RYR":  # Ryanair: aggressive turnarounds, can go either way
        p += 0.02

    # Clamp between 5% and 90%
    return float(np.clip(p, 0.05, 0.90))

delay_probs = [
    compute_delay_prob(origins[i], destinations[i], airlines[i],
                       durations[i], months[i], days_of_week[i],
                       dep_hours[i])
    for i in range(N)
]

# Generate binary label with some noise (real data is never perfect)
delayed = np.array([
    np.random.binomial(1, p) for p in delay_probs
])

# -------------------------------------------------------
# BUILD DATAFRAME
# -------------------------------------------------------
df = pd.DataFrame({
    "origin":       origins,
    "destination":  destinations,
    "airline":      airlines,
    "duration_min": durations,
    "month":        months,
    "day_of_week":  days_of_week,
    "dep_hour":     dep_hours,
    "delayed":      delayed,
})

# Add small noise to duration (real flights vary ±10%)
df["duration_min"] = (df["duration_min"] *
    np.random.uniform(0.92, 1.08, size=N)).astype(int)

# -------------------------------------------------------
# REPORT
# -------------------------------------------------------
print(f"Dataset: {len(df)} flights")
print(f"Delayed: {delayed.sum()} ({delayed.mean()*100:.1f}%)")
print(f"On time: {(1-delayed).sum()} ({(1-delayed).mean()*100:.1f}%)")
print(f"\nDelay rate by month:")
for m in range(1, 13):
    mask = df["month"] == m
    rate = df.loc[mask, "delayed"].mean()
    print(f"  Month {m:2d}: {rate*100:.1f}%")
print(f"\nDelay rate by day of week (0=Mon):")
days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
for d in range(7):
    mask = df["day_of_week"] == d
    rate = df.loc[mask, "delayed"].mean()
    print(f"  {days[d]}: {rate*100:.1f}%")
print(f"\nDelay rate by airline:")
for a in df["airline"].unique():
    mask = df["airline"] == a
    rate = df.loc[mask, "delayed"].mean()
    print(f"  {a}: {rate*100:.1f}% ({mask.sum()} flights)")
print(f"\nTop 10 routes by volume:")
top = df.groupby(["origin","destination"]).size()\
        .sort_values(ascending=False).head(10)
print(top)

# -------------------------------------------------------
# SAVE
# -------------------------------------------------------
os.makedirs("data", exist_ok=True)
df.to_csv("data/morocco_flights.csv", index=False)
print(f"\nSaved to data/morocco_flights.csv")