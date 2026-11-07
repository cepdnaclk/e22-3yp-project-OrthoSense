# OrthoSense Frontend Web Dashboard

The OrthoSense Frontend is a responsive React + Vite + TypeScript web application designed for clinicians, physical therapists, and patients to monitor knee rehabilitation in real time.

## Architecture

```plaintext
software/frontend/
├── public/                  # Static assets & icons
├── src/
│   ├── assets/              # Logos, theme icons
│   ├── components/          # Reusable dashboard widgets
│   │   ├── AlertBanner.tsx  # Safety boundary violation alerts
│   │   ├── SensorWidget.tsx # Flexion, pressure, IMU & TinyML state cards
│   │   └── TelemetryChart.tsx # SVG real-time trajectory chart
│   ├── hooks/
│   │   └── useTelemetry.ts  # React hook for data polling & socket feeds
│   ├── pages/
│   │   └── DashboardPage.tsx # Master rehabilitation monitoring page
│   ├── services/
│   │   └── telemetryApi.ts  # HTTP client communicating with backend
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example             # Frontend environment variables template
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
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
Ensure `VITE_API_BASE_URL` points to your backend instance (default: `http://localhost:5000/api`).

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
The compiled static assets will be emitted into `dist/`.
