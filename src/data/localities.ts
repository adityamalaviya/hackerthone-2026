export interface LocalityOption {
  value: string;
  label: string;
  ward: string;
  pincode: string;
}

export const GANDHIDHAM_LOCALITIES: LocalityOption[] = [
  { value: 'sector-1a', label: 'Sector 1A, Near Community Center', ward: 'Ward 1 (West)', pincode: '370201' },
  { value: 'sector-1', label: 'Sector 1, Old Court Road', ward: 'Ward 1 (West)', pincode: '370201' },
  { value: 'tagore-road', label: 'Tagore Road, Opp. Town Hall', ward: 'Ward 2 (North)', pincode: '370201' },
  { value: 'sector-2', label: 'Sector 2, Commercial Zone', ward: 'Ward 2 (North)', pincode: '370201' },
  { value: 'sector-3', label: 'Sector 3, Bus Station Area', ward: 'Ward 2 (North)', pincode: '370201' },
  { value: 'rotary-circle', label: 'Rotary Circle, Main Highway Junction', ward: 'Ward 4 (Central)', pincode: '370201' },
  { value: 'sector-4', label: 'Sector 4, Main Market & Plaza', ward: 'Ward 4 (Central)', pincode: '370201' },
  { value: 'sector-5', label: 'Sector 5, Grain Market', ward: 'Ward 4 (Central)', pincode: '370201' },
  { value: 'sector-6', label: 'Sector 6, Residential Area', ward: 'Ward 5 (South-Central)', pincode: '370201' },
  { value: 'sector-7', label: 'Sector 7, Near Police Station', ward: 'Ward 5 (South-Central)', pincode: '370201' },
  { value: 'sector-8', label: 'Sector 8, Banking Circle', ward: 'Ward 3 (East)', pincode: '370201' },
  { value: 'sector-9', label: 'Sector 9, Hospital Area', ward: 'Ward 3 (East)', pincode: '370201' },
  { value: 'nu-10', label: 'NU-10, Railway Colony', ward: 'Ward 6 (South)', pincode: '370201' },
  { value: 'adipur-link', label: 'Adipur Link Road, Near Airport Road', ward: 'Ward 7 (Suburban)', pincode: '370205' },
  { value: 'kandla-bypass', label: 'Kandla Free Trade Zone / Bypass', ward: 'Ward 8 (Industrial)', pincode: '370230' },
];
