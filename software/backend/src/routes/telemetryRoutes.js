/**
 * Telemetry Ingestion and Query Routes
 */

const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

// POST /api/telemetry - Ingest sensor stream from ESP32-S3
router.post('/', telemetryController.ingest);

// GET /api/telemetry/latest - Live sensor status
router.get('/latest', telemetryController.getLatest);

// GET /api/telemetry/history - Sliding window history for charts
router.get('/history', telemetryController.getHistory);

// GET /api/telemetry/stats - Aggregate session stats
router.get('/stats', telemetryController.getStats);

module.exports = router;

