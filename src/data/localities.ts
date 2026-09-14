export interface LocalityOption {
  value: string;
  label: string;
  ward: string;
  pincode: string;
  lat: number;
  lng: number;
}

export const GANDHIDHAM_LOCALITIES: LocalityOption[] = [
  { value: 'sector-1a', label: 'Sector 1A, Near Community Center', ward: 'Ward 1 (West)', pincode: '370201', lat: 23.0765, lng: 70.1250 },
  { value: 'sector-1', label: 'Sector 1, Old Court Road', ward: 'Ward 1 (West)', pincode: '370201', lat: 23.0780, lng: 70.1280 },
  { value: 'tagore-road', label: 'Tagore Road, Opp. Town Hall', ward: 'Ward 2 (North)', pincode: '370201', lat: 23.0830, lng: 70.1310 },
  { value: 'sector-2', label: 'Sector 2, Commercial Zone', ward: 'Ward 2 (North)', pincode: '370201', lat: 23.0815, lng: 70.1340 },
  { value: 'sector-3', label: 'Sector 3, Bus Station Area', ward: 'Ward 2 (North)', pincode: '370201', lat: 23.0800, lng: 70.1360 },
  { value: 'rotary-circle', label: 'Rotary Circle, Main Highway Junction', ward: 'Ward 4 (Central)', pincode: '370201', lat: 23.0792, lng: 70.1345 },
  { value: 'sector-4', label: 'Sector 4, Main Market & Plaza', ward: 'Ward 4 (Central)', pincode: '370201', lat: 23.0770, lng: 70.1360 },
  { value: 'sector-5', label: 'Sector 5, Grain Market', ward: 'Ward 4 (Central)', pincode: '370201', lat: 23.0750, lng: 70.1380 },
  { value: 'sector-6', label: 'Sector 6, Residential Area', ward: 'Ward 5 (South-Central)', pincode: '370201', lat: 23.0720, lng: 70.1350 },
  { value: 'sector-7', label: 'Sector 7, Near Police Station', ward: 'Ward 5 (South-Central)', pincode: '370201', lat: 23.0700, lng: 70.1330 },
  { value: 'sector-8', label: 'Sector 8, Banking Circle', ward: 'Ward 3 (East)', pincode: '370201', lat: 23.0750, lng: 70.1420 },
  { value: 'sector-9', label: 'Sector 9, Hospital Area', ward: 'Ward 3 (East)', pincode: '370201', lat: 23.0730, lng: 70.1450 },
  { value: 'nu-10', label: 'NU-10, Railway Colony', ward: 'Ward 6 (South)', pincode: '370201', lat: 23.0650, lng: 70.1380 },
  { value: 'adipur-link', label: 'Adipur Link Road, Near Airport Road', ward: 'Ward 7 (Suburban)', pincode: '370205', lat: 23.0890, lng: 70.1050 },
  { value: 'kandla-bypass', label: 'Kandla Free Trade Zone / Bypass', ward: 'Ward 8 (Industrial)', pincode: '370230', lat: 23.0450, lng: 70.1750 },
];

export function findNearestLocality(lat: number, lng: number): LocalityOption {
  let closest = GANDHIDHAM_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of GANDHIDHAM_LOCALITIES) {
    const dLat = loc.lat - lat;
    const dLng = loc.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      closest = loc;
    }
  }

  return closest;
}
