# OrthoSense Software Backend

The OrthoSense Backend is a modular Node.js / Express application layer responsible for IoT telemetry ingestion from ESP32-S3 wearable devices, real-time safety boundary monitoring, historical aggregation, and serving RESTful APIs to the React rehabilitation dashboard.

## Architecture

```plaintext
software/backend/
├── src/
│   ├── controllers/
│   │   └── telemetryController.js   # HTTP Request/Response handling
│   ├── models/
│   │   └── telemetryModel.js        # Multimodal sensor data schemas
│   ├── routes/
│   │   └── telemetryRoutes.js       # Express route definitions
│   ├── services/
│   │   └── telemetryService.js      # Telemetry ingestion, validation & safety alerts
│   └── app.js                       # Express app bootstrap & middleware
├── .env.example                     # Environment template
└── package.json                     # Node project manifest & dependencies
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure ports and CORS origins align with your local frontend development server (`http://localhost:5173`).

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status and uptime |
| `POST` | `/api/telemetry` | Ingest new sensor packet from ESP32-S3 |
| `GET` | `/api/telemetry/latest` | Retrieve latest recorded sensor state |
| `GET` | `/api/telemetry/history?limit=50` | Sliding window of recent data for charting |
| `GET` | `/api/telemetry/stats` | Session aggregate metrics (peak angle, avg load, alerts) |

