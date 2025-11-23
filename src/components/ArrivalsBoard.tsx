import React, { useState, useEffect, useCallback } from 'react';
import { POPULAR_STATIONS, CTA_ROUTES } from '../constants';
import type { TrainArrival } from '../types';

const FAVORITE_STATION_KEY = 'cta_fav_station';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const REFRESH_INTERVAL_MS = 30000;

const formatTime = (isoString: string | undefined) => {
  if (!isoString) return 'Unknown';
  const arrival = new Date(isoString);
  if (Number.isNaN(arrival.getTime())) return 'Unknown';
  const now = new Date();
  const diffMs = arrival.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins <= 0) return 'Due';
  if (diffMins > 60) return '60+ min';
  return `${diffMins} min`;
};

const getRouteDetails = (rtObj: string) => {
  const norm = rtObj.toLowerCase().trim();
  const found = CTA_ROUTES.find(
    r =>
      r.name.toLowerCase().includes(norm) ||
      r.id.toLowerCase() === norm
  );
  return {
    name: found ? found.name : rtObj,
    colorClass: found ? `${found.color} ${found.textColor}` : 'bg-gray-500 text-white',
  };
};

const groupArrivalsByDestination = (trains: TrainArrival[]): Record<string, TrainArrival[]> => {
  const trainsArray = Array.isArray(trains) ? trains : [];
  const grouped = trainsArray.reduce((acc, arrival) => {
    const dest = arrival.destNm || 'Unknown destination';
    if (!acc[dest]) acc[dest] = [];
    acc[dest].push(arrival);
    return acc;
  }, {} as Record<string, TrainArrival[]>);

  Object.keys(grouped).forEach(dest => {
    grouped[dest].sort(
      (a, b) => new Date(a.arrT).getTime() - new Date(b.arrT).getTime()
    );
  });

  return grouped;
};

const ArrivalsBoard: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState(POPULAR_STATIONS[0].mapId);
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(FAVORITE_STATION_KEY);
    if (saved) setSelectedStation(saved);
  }, []);

  const fetchArrivals = useCallback(async (mapId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/arrivals/${mapId}`);

      if (!res.ok) {
        let message = 'Server connection failed';
        try {
          const errorBody = await res.json();
          if (errorBody?.details) message = errorBody.details;
        } catch {
        throw new Error(message);
        }
      }

      const data = await res.json();

      if (data?.ctatt?.errNm) {
        setError(data.ctatt.errNm);
        setArrivals([]);
      } else if (data?.ctatt?.eta) {
        const etaData = Array.isArray(data.ctatt.eta) ? data.ctatt.eta : [data.ctatt.eta];
        setArrivals(etaData);
      } else {
        setArrivals([]);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to or parse data from server. Check your console for details.');
      setArrivals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedStation) return;
    fetchArrivals(selectedStation);
    localStorage.setItem(FAVORITE_STATION_KEY, selectedStation);
    const interval = setInterval(() => fetchArrivals(selectedStation), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedStation, fetchArrivals]);

  const groupedArrivals = groupArrivalsByDestination(arrivals);
  const destinationNames = Object.keys(groupedArrivals);

  return (
    <div className="w-full">
      <div className="mb-8">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
          Station
        </label>
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
          title="Station Selector"
        >
          {POPULAR_STATIONS.map(st => (
            <option key={st.mapId} value={st.mapId}>{st.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-6 text-sm">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {loading && <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>}

      {!loading && destinationNames.length === 0 && !error && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No arrivals available
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {destinationNames.map(destName => (
            <div key={destName}>
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 border-b-2 border-blue-700 pb-2">
                {destName}
              </h3>
              <div className="space-y-1.5">
                {groupedArrivals[destName].map((arr, idx) => {
                  const routeDetails = getRouteDetails(arr.rt);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded flex-shrink-0 ${routeDetails.colorClass}`}>
                          {routeDetails.name}
                        </span>
                        <span className="text-sm text-slate-700 truncate">
                          {arr.staNm || arr.stpDe || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        {arr.isApp === '1' ? (
                          <span className="text-xs font-bold text-green-600">Arriving</span>
                        ) : arr.isDly === '1' ? (
                          <span className="text-xs font-bold text-red-600">Delayed</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-600">{formatTime(arr.arrT)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArrivalsBoard;
