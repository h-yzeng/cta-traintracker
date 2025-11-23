import React, { useEffect, useState, useCallback } from 'react';
import type { TrainPosition, RouteInfo } from '../types';

interface Props {
  route: RouteInfo;
}

const PositionsView: React.FC<Props> = ({ route }) => {
  const [positions, setPositions] = useState<TrainPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/positions/${route.id}`);
      const data = await res.json();

      if (data && data.ctatt && data.ctatt.route) {
        const trainData = data.ctatt.route[0].train;
        const trainsArray = Array.isArray(trainData) ? trainData : (trainData ? [trainData] : []);
        setPositions(trainsArray);
      } else {
        setPositions([]);
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [route]);

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 15000);
    return () => clearInterval(interval);
  }, [fetchPositions]); 

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Live Positions: {route.name}</h3>
        <button 
          onClick={fetchPositions}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-500">Locating trains...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && positions.length === 0 && !error && (
        <p className="text-gray-500 italic">No trains currently active on this line.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {positions.map((train, idx) => (
          <div key={`${train.rn}-${idx}`} className="border border-gray-200 rounded p-3 flex flex-col">
            <div className="flex justify-between items-start">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${route.color} ${route.textColor}`}>
                Run #{train.rn}
              </span>
              {train.isDly === '1' && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Delayed</span>
              )}
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500">Heading to</p>
              <p className="font-bold text-gray-800">{train.destNm}</p>
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-500">Next Stop</p>
              <p className="font-medium">{train.nextStaNm}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
               <span>Lat: {train.lat}</span>
               <span>Lon: {train.lon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionsView;