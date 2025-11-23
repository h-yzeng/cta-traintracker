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
      <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg mt-6 max-w-6xl mx-auto">
        <p className="font-bold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const grouped = groupPositionsByDestination(positions);
  const destinations = Object.keys(grouped);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-blue-700">Live Trains</h3>
          <p className="text-xs text-slate-600 mt-1">{route.name}</p>
        </div>
        <button
          onClick={fetchPositions}
          disabled={loading}
          className="px-3 py-1.5 rounded text-xs font-medium border border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && positions.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
      )}

      {positions.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500 text-sm">No active trains</div>
      )}

      {positions.length > 0 && (
        <div className="space-y-6">
          {destinations.map(dest => (
            <div key={dest}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide border-b-2 border-blue-700 pb-1">{dest}</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${route.color} ${route.textColor}`}>
                  {grouped[dest].length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[dest].map((train, index) => (
                  <div
                    key={`${dest}-${train.rn}-${index}`}
                    className="border border-slate-200 rounded p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
                      Train {train.rn}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>
                        <div className="text-slate-500">Next</div>
                        <div className="text-slate-700 font-medium">{train.nextStaNm || '—'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Destination</div>
                        <div className="text-slate-700 font-medium">{train.destNm || '—'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PositionsView;