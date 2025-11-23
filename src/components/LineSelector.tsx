import React from 'react';
import { CTA_ROUTES } from '../constants';
import type { RouteInfo } from '../types';

interface Props {
  onSelect: (route: RouteInfo) => void;
  selectedRoute: RouteInfo | null;
}

const LineSelector: React.FC<Props> = ({ onSelect, selectedRoute }) => {
  return (
    <div>
      <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-4 border-b-2 border-blue-700 pb-2">Choose a Line</h2>
      <div className="grid grid-cols-4 gap-3">
        {CTA_ROUTES.map((route) => (
          <button
            key={route.id}
            onClick={() => onSelect(route)}
            className={`
              ${route.color} ${route.textColor}
              px-4 py-3 rounded font-bold text-xs uppercase transition-all shadow-sm hover:shadow-md
              ${selectedRoute?.id === route.id ? 'ring-2 ring-offset-2 ring-blue-700' : ''}
            `}
          >
            {route.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LineSelector;