import { useState } from 'react';
import LineSelector from './components/LineSelector';
import PositionsView from './components/PositionView';
import ArrivalsBoard from './components/ArrivalsBoard';
import { CTA_ROUTES } from './constants';
import type { RouteInfo } from './types';

function App() {
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
  const [viewMode, setViewMode] = useState<'arrivals' | 'positions'>('arrivals');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white border-b-4 border-red-600 shadow-lg">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight">CTA API Demo</h1>
          <p className="text-blue-100 text-sm mt-1">Chicago Transit Authority Real-Time Train Information</p>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="flex-1 flex">
        {/* Left Side - Documentation */}
        <div className="w-1/2 bg-white border-r border-slate-200 overflow-y-auto p-12">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">About the CTA API</h2>
            
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Overview</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                The Chicago Transit Authority (CTA) provides real-time train tracking data through their public API. This application demonstrates how developers can use this API to build tools that display live train information.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Features</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-700 font-bold flex-shrink-0">•</span>
                  <span><strong>Real-Time Arrivals:</strong> View predicted train arrival times at any station</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-700 font-bold flex-shrink-0">•</span>
                  <span><strong>Live Positions:</strong> See the current location and status of active trains on each line</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-700 font-bold flex-shrink-0">•</span>
                  <span><strong>Status Indicators:</strong> Know when trains are approaching or delayed</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-700 font-bold flex-shrink-0">•</span>
                  <span><strong>Multi-Line Support:</strong> Track all major CTA lines in real-time</span>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">API Endpoints</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1">/api/arrivals/{'{mapId}'}</p>
                  <p className="text-slate-600 text-xs">Fetches predicted train arrivals for a specific station, including train number, line, destination, and estimated arrival time.</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1">/api/positions/{'{lineId}'}</p>
                  <p className="text-slate-600 text-xs">Returns the current geographic coordinates and status of trains actively operating on a selected line.</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Side - Interactive Demo */}
        <div className="w-1/2 bg-slate-50 overflow-y-auto p-12">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Live Demo</h2>
            
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
              <button
                onClick={() => setViewMode('arrivals')}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  viewMode === 'arrivals'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Station Arrivals
              </button>
              <button
                onClick={() => setViewMode('positions')}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  viewMode === 'positions'
                    ? 'text-blue-700 border-b-2 border-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Track Lines
              </button>
            </div>

            {viewMode === 'arrivals' && (
              <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
                <ArrivalsBoard />
              </div>
            )}

            {viewMode === 'positions' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">Select a Line</h3>
                  <div className="flex flex-wrap gap-3">
                    {CTA_ROUTES.map((route) => (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(route)}
                        className={`${route.color} ${route.textColor} px-4 py-2 rounded text-xs font-bold uppercase shadow-sm hover:shadow-md transition-shadow`}
                        title={route.name}
                      >
                        {route.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedRoute && (
                  <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
                    <PositionsView route={selectedRoute} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
