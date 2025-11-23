import React, { useState, useEffect, useCallback } from 'react';
import { POPULAR_STATIONS, CTA_ROUTES } from '../constants';
import type { TrainArrival } from '../types';

const FAVORITE_STATION_KEY = 'cta_fav_station';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
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
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Station Arrivals</h2>

        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-blue-500 focus:border-blue-500"
          title="Station Selector"
        >
          {POPULAR_STATIONS.map(st => (
            <option key={st.mapId} value={st.mapId}>{st.name}</option>
          ))}
        </select>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <p className="font-bold">API Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && <div className="text-center py-4">Loading predictions...</div>}

        {!loading && destinationNames.length === 0 && !error && (
          <div className="text-center py-4 text-gray-500 italic">
            No scheduled arrivals in the next hour for this station.
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-2">
            {destinationNames.map(destName => (
              <div key={destName} className="border border-gray-200 rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold bg-blue-50 text-blue-800 p-3 flex justify-between items-center">
                  <span>{destName} Bound</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293a1 1 0 00-1.414-1.414L10 10.586 7.707 8.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3z" clipRule="evenodd" />
                  </svg>
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/4">Line</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/2">Next Stop Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groupedArrivals[destName].map((arr, idx) => {
                        const routeDetails = getRouteDetails(arr.rt);
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${routeDetails.colorClass}`}>
                                {routeDetails.name}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              <div className="font-semibold">
                                {arr.staNm || arr.stpDe || 'Unknown station'}
                              </div>
                              {arr.stpDe && arr.stpDe !== arr.staNm && (
                                <div className="text-xs text-gray-500">
                                  {arr.stpDe}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm font-bold">
                              {arr.isApp === '1' ? (
                                <span className="text-green-600 font-extrabold">Approaching</span>
                              ) : arr.isDly === '1' ? (
                                <span className="text-red-500 font-extrabold">Delayed</span>
                              ) : (
                                <span className="text-gray-900">{formatTime(arr.arrT)}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArrivalsBoard;
