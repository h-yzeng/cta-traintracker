import React, { useState, useEffect } from 'react';
import { POPULAR_STATIONS, CTA_ROUTES } from '../constants';
import type { TrainArrival } from '../types';

const ArrivalsBoard: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState(POPULAR_STATIONS[0].mapId);
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cta_fav_station');
    if (saved) setSelectedStation(saved);
  }, []);

  const fetchArrivals = async (mapId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/arrivals/${mapId}`);
      const data = await res.json();
      
      if (data && data.ctatt && data.ctatt.eta) {
        setArrivals(data.ctatt.eta);
      } else {
        setArrivals([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStation) {
      fetchArrivals(selectedStation);
      localStorage.setItem('cta_fav_station', selectedStation);
    }
  }, [selectedStation]);

  const formatTime = (isoString: string) => {
    const arrival = new Date(isoString);
    const now = new Date();
    const diffMs = arrival.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins <= 0) return 'Due';
    return `${diffMins} min`;
  };

  const getRouteColor = (rtObj: string) => {
    const found = CTA_ROUTES.find(r => 
      r.name.toLowerCase().includes(rtObj.toLowerCase()) || 
      r.id.toLowerCase() === rtObj.toLowerCase()
    );
    return found ? `${found.color} ${found.textColor}` : 'bg-gray-500 text-white';
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Station Arrivals</h2>
      
      <select 
        value={selectedStation} 
        onChange={(e) => setSelectedStation(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
        title="Station Selector"
      >
        {POPULAR_STATIONS.map(st => (
          <option key={st.mapId} value={st.mapId}>{st.name}</option>
        ))}
      </select>

      {loading ? (
        <div className="text-center py-4">Loading predictions...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dest</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {arrivals.map((arr, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getRouteColor(arr.rt)}`}>
                      {arr.rt}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{arr.destNm}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {arr.isDly === '1' ? <span className="text-red-500">Dly</span> : formatTime(arr.arrT)}
                  </td>
                </tr>
              ))}
              {arrivals.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                    No scheduled arrivals in the next hour.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArrivalsBoard;