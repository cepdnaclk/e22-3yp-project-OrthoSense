/**
 * Telemetry Controller
 * Exposes API endpoints for receiving ESP32-S3 sensor data
 * and serving real-time status to the React Dashboard.
 */

const telemetryService = require('../services/telemetryService');

/**
 * POST /api/telemetry
 * Ingest new sensor reading packet
 */
function ingest(req, res) {
  try {
    const result = telemetryService.ingestTelemetry(req.body);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * GET /api/telemetry/latest
 * Retrieve the most recent reading
 */
function getLatest(req, res) {
  try {
    const data = telemetryService.getLatestTelemetry();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * GET /api/telemetry/history?limit=50
 * Retrieve sliding window historical packets for charts
 */
function getHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const history = telemetryService.getTelemetryHistory(limit);
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * GET /api/telemetry/stats
 * Aggregate session metrics (peak angle, avg load, alerts count)
 */
function getStats(req, res) {
  try {
    const stats = telemetryService.getTelemetryStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

module.exports = {
  ingest,
  getLatest,
  getHistory,
  getStats,
};

