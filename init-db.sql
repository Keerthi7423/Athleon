-- initialization script for Athleon Database --

-- 1. Auth Service Tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Fatigue / Analytics Tables
CREATE TABLE IF NOT EXISTS player_match_stats (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50),
    match_date DATE NOT NULL DEFAULT CURRENT_DATE,
    distance_covered_km DECIMAL(5,2),
    high_intensity_sprints INTEGER,
    heart_rate_avg INTEGER,
    minutes_played INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMI Event Tables
CREATE TABLE IF NOT EXISTS match_events (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NOT NULL,
    player_id VARCHAR(50),
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
