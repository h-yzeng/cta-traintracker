import React, { useState, useEffect, useCallback } from 'react';
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
      
      if (!res.ok) {
        throw new Error('Server connection failed');
      }
      
      const data = await res.json();

      if (data.ctatt.errNm) {
        setError(data.ctatt.errNm);
        setPositions([]);
      }
      else if (data && data.ctatt && data.ctatt.route) {
        const trainData = data.ctatt.route.train;
        const trainArray = Array.isArray(trainData) ? trainData : (trainData ? [trainData] : []);
        setPositions(trainArray);
      } else {
        setPositions([]);
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server or fetching data.');
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p className="font-bold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Live Positions: {route.name}</h3>
        {/* Simple button to show the user can manually refresh */}
        <button 
          onClick={fetchPositions}
          disabled={loading}
          className="px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && positions.length === 0 && <div className="text-center py-4">Loading train locations...</div>}
      
      {positions.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500 italic">
          No trains currently active on the {route.name}.
        </div>
      )}

      {/* Grid view for train positions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((train, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-sm">
            <p className="font-semibold text-lg">{train.rn}</p>
            <p className="text-sm text-gray-600">
              Destination: <span className="font-medium">{train.destNm}</span>
            </p>
            <p className="text-sm text-gray-600">
              Next Stop: <span className="font-medium">{train.nextStaNm}</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Lat: {train.lat}, Lon: {train.lon}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionsView;