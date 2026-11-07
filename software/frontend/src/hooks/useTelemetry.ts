import { useState, useEffect, useCallback } from 'react';
import {
  fetchLatestTelemetry,
  fetchTelemetryHistory,
  fetchSessionStats,
  type TelemetryPacket,
  type SessionStats,
} from '../services/telemetryApi';

export function useTelemetry(pollIntervalMs = 2000) {
  const [latest, setLatest] = useState<TelemetryPacket | null>(null);
  const [history, setHistory] = useState<TelemetryPacket[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pollData = useCallback(async () => {
    try {
      const [latestData, historyData, statsData] = await Promise.all([
        fetchLatestTelemetry(),
        fetchTelemetryHistory(20),
        fetchSessionStats(),
      ]);
      setLatest(latestData);
      setHistory(historyData);
      setStats(statsData);
      setConnected(true);
      setError(null);
    } catch (err: any) {
      setConnected(false);
      setError(err?.message || 'Disconnected from backend');
    }
  }, []);

  useEffect(() => {
    pollData();
    const interval = setInterval(pollData, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollData, pollIntervalMs]);

  return {
    latest,
    history,
    stats,
    connected,
    error,
    refresh: pollData,
  };
}
