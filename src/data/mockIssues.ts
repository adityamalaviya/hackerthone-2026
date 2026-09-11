export interface CivicIssue {
  id: string;
  title: string;
  category: 'Pothole' | 'Streetlight' | 'Garbage' | 'Water Leakage' | 'Drainage' | 'Other';
  description: string;
  status: 'Reported' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Closed';
  latitude: number;
  longitude: number;
  locationName: string;
  reportedAt: string;
  ward: string;
  votes: number;
}

export const MOCK_ISSUES: CivicIssue[] = [
  {
    id: 'CF-2026-081',
    title: 'Severe road depression & pothole cluster',
    category: 'Pothole',
    description: 'Deep road damage creating traffic snarls near Rotary Circle during evening rush hour.',
    status: 'In Progress',
    latitude: 23.0792,
    longitude: 70.1345,
    locationName: 'Rotary Circle, Main Highway Junction',
    reportedAt: '3 hours ago',
    ward: 'Ward 4 (Central)',
    votes: 42,
  },
  {
    id: 'CF-2026-079',
    title: 'High-mast streetlight flickering off',
    category: 'Streetlight',
    description: 'Multiple streetlights non-operational, dark blind spot at pedestrian crossing.',
    status: 'Reported',
    latitude: 23.0825,
    longitude: 70.1310,
    locationName: 'Tagore Road, Opp. Town Hall',
    reportedAt: '45 mins ago',
    ward: 'Ward 2 (North)',
    votes: 19,
  },
  {
    id: 'CF-2026-074',
    title: 'Main pipeline water leakage',
    category: 'Water Leakage',
    description: 'Fresh water gushing into road shoulder, causing localized water-logging and loss.',
    status: 'Acknowledged',
    latitude: 23.0738,
    longitude: 70.1265,
    locationName: 'Sector 1A, Near Community Center',
    reportedAt: '5 hours ago',
    ward: 'Ward 1 (West)',
    votes: 31,
  },
  {
    id: 'CF-2026-068',
    title: 'Commercial waste bin overflow',
    category: 'Garbage',
    description: 'Uncollected organic and plastic debris spilled across pedestrian walkway.',
    status: 'Resolved',
    latitude: 23.0850,
    longitude: 70.1410,
    locationName: 'Oslo Circle Market Lane',
    reportedAt: 'Yesterday',
    ward: 'Ward 3 (East)',
    votes: 56,
  },
  {
    id: 'CF-2026-063',
    title: 'Storm drain blockage before monsoon outlet',
    category: 'Drainage',
    description: 'Silt and construction debris clogging culvert opening next to railway crossing.',
    status: 'In Progress',
    latitude: 23.0695,
    longitude: 70.1380,
    locationName: 'Railway Colony Road',
    reportedAt: '1 day ago',
    ward: 'Ward 5 (South)',
    votes: 27,
  },
  {
    id: 'CF-2026-059',
    title: 'Damaged storm drain cover',
    category: 'Drainage',
    description: 'Concrete slab shattered, hazardous hole for two-wheelers and pedestrians.',
    status: 'Resolved',
    latitude: 23.0760,
    longitude: 70.1450,
    locationName: 'GIDC Industrial Phase 1',
    reportedAt: '2 days ago',
    ward: 'Ward 6 (Industrial)',
    votes: 64,
  }
];

export const CATEGORIES = [
  {
    id: 'pothole',
    name: 'Pothole & Road Damage',
    description: 'Craters, road cave-ins, and dangerous asphalt cuts.',
    count: 24,
    icon: 'RoadHorizon'
  },
  {
    id: 'streetlight',
    name: 'Streetlight Outage',
    description: 'Non-functional poles, blackouts, or blinking high-masts.',
    count: 18,
    icon: 'Lightbulb'
  },
  {
    id: 'garbage',
    name: 'Garbage Overflow',
    description: 'Full municipal bins, open dumping, and neglected pickups.',
    count: 32,
    icon: 'Trash'
  },
  {
    id: 'water',
    name: 'Water Leakage',
    description: 'Broken supply mains, contaminated lines, or tap leaks.',
    count: 15,
    icon: 'Drop'
  },
  {
    id: 'drainage',
    name: 'Drainage & Sewage',
    description: 'Sewage backflow, open culverts, and blocked storm drains.',
    count: 21,
    icon: 'Waves'
  },
  {
    id: 'other',
    name: 'Other Public Utility',
    description: 'Fallen branches, stray cattle hazard, damaged public signs.',
    count: 9,
    icon: 'DotsThreeCircle'
  }
] as const;
