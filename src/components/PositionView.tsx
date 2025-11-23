import React, { useState, useEffect, useCallback } from 'react';
import type { TrainPosition, RouteInfo } from '../types';

interface Props {
  route: RouteInfo;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const groupPositionsByDestination = (positions: TrainPosition[]): Record<string, TrainPosition[]> => {
  const grouped: Record<string, TrainPosition[]> = {};
  positions.forEach(pos => {
    const dest = pos.destNm || 'Unknown destination';
    if (!grouped[dest]) grouped[dest] = [];
    grouped[dest].push(pos);
  });
  return grouped;
};

type RouteWithTrain = {
  train?: TrainPosition | TrainPosition[];
};

const PositionsView: React.FC<Props> = ({ route }) => {
  const [positions, setPositions] = useState<TrainPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/positions/${route.id}`);

      if (!res.ok) {
        throw new Error('Server connection failed');
      }

      const data = await res.json();
      const ctatt = data?.ctatt;

      if (ctatt?.errNm) {
        setError(ctatt.errNm);
        setPositions([]);
        return;
      }

      const routeData = ctatt?.route;
      if (!routeData) {
        setPositions([]);
        return;
      }

      const routesArray: RouteWithTrain[] = Array.isArray(routeData)
        ? routeData
        : [routeData];

      const allTrains: TrainPosition[] = [];
      routesArray.forEach(r => {
        const t = r.train;
        if (!t) return;
        if (Array.isArray(t)) {
          allTrains.push(...t);
        } else {
          allTrains.push(t);
        }
      });

      setPositions(allTrains);
    } catch (err) {
      console.error(err);
      setError('Error connecting to server or fetching data.');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [route.id]);

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 15000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6 max-w-6xl mx-auto">
        <p className="font-bold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const grouped = groupPositionsByDestination(positions);
  const destinations = Object.keys(grouped);

  return (
    <div className="mt-6 max-w-6xl mx-auto">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live Positions</h3>
            <p className="text-sm text-slate-500">Currently active trains on the {route.name}</p>
          </div>
          <button
            onClick={fetchPositions}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading && positions.length === 0 && (
          <div className="text-center py-8 text-slate-500">Loading train locations...</div>
        )}

        {positions.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-500 italic">
            No trains currently active on the {route.name}.
          </div>
        )}

        {positions.length > 0 && (
          <div className="space-y-6">
            {destinations.map(dest => (
              <div key={dest} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Direction: <span className="font-bold">{dest}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {grouped[dest].length} active {grouped[dest].length === 1 ? 'train' : 'trains'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${route.color} ${route.textColor}`}
                  >
                    {route.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-4 py-4">
                  {grouped[dest].map((train, index) => (
                    <div
                      key={`${dest}-${train.rn}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Train
                        </span>
                        <span className="text-base font-semibold text-slate-900">
                          {train.rn}
                        </span>
                      </div>
                      <div className="text-sm text-slate-700">
                        <span className="font-medium">Next Stop:</span>{' '}
                        {train.nextStaNm || 'Unknown'}
                      </div>
                      <div className="text-sm text-slate-700">
                        <span className="font-medium">Destination:</span>{' '}
                        {train.destNm || 'Unknown'}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Lat {train.lat}, Lon {train.lon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionsView;
