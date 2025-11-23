import React from 'react';
import { CTA_ROUTES } from '../constants';
import type { RouteInfo } from '../types';

interface Props {
  onSelect: (route: RouteInfo) => void;
  selectedRoute: RouteInfo | null;
}

const LineSelector: React.FC<Props> = ({ onSelect, selectedRoute }) => {
  return (
    <div className="p-4 bg-white shadow rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Select a Line</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CTA_ROUTES.map((route) => (
          <button
            key={route.id}
            onClick={() => onSelect(route)}
            className={`
              ${route.color} ${route.textColor} 
              p-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-transform hover:scale-105
              ${selectedRoute?.id === route.id ? 'ring-4 ring-offset-2 ring-gray-400' : ''}
            `}
          >
            {route.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LineSelector;