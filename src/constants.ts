import type { RouteInfo } from './types';

export const CTA_ROUTES: RouteInfo[] = [
  { id: 'Red', name: 'Red Line', color: 'bg-red-600', textColor: 'text-white' },
  { id: 'Blue', name: 'Blue Line', color: 'bg-blue-600', textColor: 'text-white' },
  { id: 'Brn', name: 'Brown Line', color: 'bg-yellow-800', textColor: 'text-white' },
  { id: 'G', name: 'Green Line', color: 'bg-green-600', textColor: 'text-white' },
  { id: 'Org', name: 'Orange Line', color: 'bg-orange-500', textColor: 'text-white' },
  { id: 'P', name: 'Purple Line', color: 'bg-purple-800', textColor: 'text-white' },
  { id: 'Pink', name: 'Pink Line', color: 'bg-pink-400', textColor: 'text-white' },
  { id: 'Y', name: 'Yellow Line', color: 'bg-yellow-400', textColor: 'text-black' },
];

export const POPULAR_STATIONS = [
  { name: '35th-Bronzeville-IIT (Green)', mapId: '41120' },
  { name: 'Sox-35th (Red)', mapId: '40190' },
  { name: 'Cermak-Chinatown (Red)', mapId: '41000' },
  { name: 'Cermak-McCormick Place (Green)', mapId: '41690' },
  { name: 'Indiana (Green)', mapId: '40300' },
  { name: '43rd (Green)', mapId: '41270' },
  { name: '47th (Green)', mapId: '41080' },
  { name: '47th (Red)', mapId: '41230' },

  { name: 'Lake (Red)', mapId: '41660' },
  { name: 'O\'Hare (Blue)', mapId: '40890' },
  { name: 'Clark/Lake (All)', mapId: '40380' },
  { name: 'Fullerton (Red/Brn/Pur)', mapId: '41220' },
  { name: 'Roosevelt (Red/Org/Grn)', mapId: '41400' },
];
