import { Router } from 'express';
import multer from 'multer';
import { query } from './db.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Simple health check
router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// List POIs (boarding houses)
router.get('/pois', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, address, rate, rating, status, amenities, features, lat, lng FROM boarding_houses ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load POIs' });
  }
});

// Shortest path between two points using pgRouting over OSM roads
// Expects query params: startLat, startLng, endLat, endLng (WGS84)
router.get('/route', async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;
  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  try {
    const sql = `
      WITH
      start_pt AS (
        SELECT ST_SetSRID(ST_Point($1::float8, $2::float8), 4326) AS geom
      ),
      end_pt AS (
        SELECT ST_SetSRID(ST_Point($3::float8, $4::float8), 4326) AS geom
      ),
      start_vid AS (
        SELECT id AS vid
        FROM ways_vertices_pgr
        ORDER BY the_geom <-> (SELECT geom FROM start_pt)
        LIMIT 1
      ),
      end_vid AS (
        SELECT id AS vid
        FROM ways_vertices_pgr
        ORDER BY the_geom <-> (SELECT geom FROM end_pt)
        LIMIT 1
      ),
      d AS (
        SELECT * FROM pgr_dijkstra(
          'SELECT id, source, target, cost, reverse_cost FROM ways',
          (SELECT vid FROM start_vid),
          (SELECT vid FROM end_vid),
          directed := false
        )
      )
      SELECT ST_AsGeoJSON(ST_LineMerge(ST_UnaryUnion(ST_Collect(w.geom)))) AS geojson
      FROM d
      JOIN ways w ON d.edge = w.id
      WHERE d.edge <> -1;
    `;

    const { rows } = await query(sql, [Number(startLng), Number(startLat), Number(endLng), Number(endLat)]);
    const feature = rows[0]?.geojson ? JSON.parse(rows[0].geojson) : null;
    if (!feature) return res.status(404).json({ error: 'No route found' });
    res.json({ type: 'Feature', geometry: feature, properties: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Routing failed' });
  }
});

router.post('/predict', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required for prediction.' });
  }

  const sizeKb = req.file.size / 1024;
  const nameSignal = /clean|safe|accredit|pass|updated/i.test(req.file.originalname) ? 0.08 : 0;
  const sizeSignal = Math.min(Math.log10(sizeKb + 10) * 0.12, 0.25);
  const base = 0.45;
  const likelihood = Math.max(0.05, Math.min(0.95, base + nameSignal + sizeSignal));

  return res.json({
    likelihood,
    label: likelihood >= 0.65 ? 'High confidence' : likelihood >= 0.4 ? 'Moderate confidence' : 'Low confidence',
    explanation: 'This heuristic preview considers filename cues and basic file metrics as placeholders for a trained model.'
  });
});

export default router;

