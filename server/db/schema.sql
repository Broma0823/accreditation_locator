-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgrouting;

-- Points of Interest (boarding houses)
CREATE TABLE IF NOT EXISTS boarding_houses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  rate TEXT,
  rating NUMERIC,
  status TEXT,
  amenities TEXT[],
  features TEXT[],
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED
);

-- Roads: Use osm2pgrouting to populate ways and ways_vertices_pgr
-- Schema expected by pgRouting:
--   ways(id, source, target, cost, reverse_cost, geom)
--   ways_vertices_pgr(id, the_geom)

-- Indexes for speed
CREATE INDEX IF NOT EXISTS idx_bh_geom ON boarding_houses USING GIST ((geom::geometry));

