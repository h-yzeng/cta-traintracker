import { useState } from 'react';
import LineSelector from './components/LineSelector';
import PositionsView from './components/PositionView';
import ArrivalsBoard from './components/ArrivalsBoard';
import type { RouteInfo } from './types';

function App() {
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'arrivals'>('arrivals');

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tighter">CTA Train Tracker</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        
        {/* View Toggles */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setViewMode('arrivals')}
            className={`px-4 py-2 rounded font-medium ${viewMode === 'arrivals' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Station Arrivals
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded font-medium ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Track Lines
          </button>
        </div>

        {viewMode === 'arrivals' && (
          <div className="max-w-2xl mx-auto">
            <ArrivalsBoard />
          </div>
        )}

        {viewMode === 'map' && (
          <div>
            <LineSelector 
              selectedRoute={selectedRoute} 
              onSelect={setSelectedRoute} 
            />
            
            {selectedRoute ? (
              <PositionsView route={selectedRoute} />
            ) : (
              <div className="text-center p-8 bg-white rounded shadow">
                <p className="text-gray-500">Select a line above to see live train positions.</p>
              </div>
            )}
          </div>
        )}

      </main>
      
      <footer className="text-center p-4 text-gray-500 text-xs mt-8">
        Data provided by Chicago Transit Authority
      </footer>
    </div>
  );
}

export default App;