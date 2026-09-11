/**
 * Mock Staff Issues Dataset for Gandhidham Municipal Corporation
 * 
 * Access restriction requirement:
 * // TODO: backend must enforce department-scoping server-side, not just hide in UI
 */

import { StaffIssue, StaffDepartment } from './types';

// Anchor date: Current relative timestamps
const now = Date.now();
const hour = 3600 * 1000;

export const INITIAL_MOCK_STAFF_ISSUES: StaffIssue[] = [
  // ==========================================
  // DEPARTMENT: Roads & Infrastructure
  // ==========================================
  {
    id: 'CF-2026-081',
    category: 'Pothole',
    department: 'Roads & Infrastructure',
    severity: 'Critical',
    shortDescription: 'Deep road depression & hazardous crater cluster',
    citizenDescription: 'Deep road damage creating traffic snarls and high accident hazard near Rotary Circle during evening rush hour. Two-wheeler riders slipping on loose gravel.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    locationName: 'Rotary Circle, Main Highway Junction',
    ward: 'Ward 4 (Central)',
    latitude: 23.0792,
    longitude: 70.1345,
    assignedDate: new Date(now - 14 * hour).toISOString(),
    slaDeadline: new Date(now - 2 * hour).toISOString(), // Overdue by 2 hours
    status: 'In Progress',
    internalRemarks: [
      {
        id: 'rem-1',
        staffId: 'STF-402',
        staffName: 'R. K. Sharma (Assistant Engineer)',
        text: 'Inspected site at 11:30 AM. Cold mix asphalt patch truck requested from Central Yard.',
        timestamp: new Date(now - 8 * hour).toISOString(),
      },
      {
        id: 'rem-2',
        staffId: 'STF-108',
        staffName: 'Devang Joshi (Site Supervisor)',
        text: 'Traffic police alerted to place temporary cones around crater perimeter.',
        timestamp: new Date(now - 5 * hour).toISOString(),
      },
    ],
  },
  {
    id: 'CF-2026-084',
    category: 'Pothole',
    department: 'Roads & Infrastructure',
    severity: 'High',
    shortDescription: 'Asphalt rutting & road trench outside school zone',
    citizenDescription: 'Water pipeline trench left unpaved after dig by contractor, creating steep 8-inch ledge on main carriageway right outside St. Xavier school.',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    locationName: 'Tagore Road, Opp. Town Hall',
    ward: 'Ward 2 (North)',
    latitude: 23.0825,
    longitude: 70.1310,
    assignedDate: new Date(now - 6 * hour).toISOString(),
    slaDeadline: new Date(now + 4 * hour).toISOString(), // Due in 4 hours
    status: 'Acknowledged',
    internalRemarks: [
      {
        id: 'rem-3',
        staffId: 'STF-402',
        staffName: 'R. K. Sharma (Assistant Engineer)',
        text: 'Contractor notice issued under municipal clause 14B. Compaction team dispatched.',
        timestamp: new Date(now - 2 * hour).toISOString(),
      },
    ],
  },
  {
    id: 'CF-2026-088',
    category: 'Drainage',
    department: 'Roads & Infrastructure',
    severity: 'Medium',
    shortDescription: 'Broken curbstone and sidewalk cave-in',
    citizenDescription: 'Pedestrian curb stones shattered by heavy container truck reversing onto pavement. Pavement blocks destabilized.',
    photoUrl: 'https://images.unsplash.com/photo-1584463699039-4467c6999966?auto=format&fit=crop&w=800&q=80',
    locationName: 'Oslo Circle Market Lane',
    ward: 'Ward 3 (East)',
    latitude: 23.0850,
    longitude: 70.1410,
    assignedDate: new Date(now - 3 * hour).toISOString(),
    slaDeadline: new Date(now + 18 * hour).toISOString(),
    status: 'Reported',
    internalRemarks: [],
  },
  {
    id: 'CF-2026-092',
    category: 'Pothole',
    department: 'Roads & Infrastructure',
    severity: 'Low',
    shortDescription: 'Minor surface hairline cracking & edge erosion',
    citizenDescription: 'Erosion on shoulder of residential lane near Community Center.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    locationName: 'Sector 1A, Near Community Center',
    ward: 'Ward 1 (West)',
    latitude: 23.0738,
    longitude: 70.1265,
    assignedDate: new Date(now - 24 * hour).toISOString(),
    slaDeadline: new Date(now - 1 * hour).toISOString(),
    status: 'Reported',
    flag: {
      isFlagged: true,
      reason: 'Reported location is inside a private housing society compound, beyond municipal road boundary.',
      flaggedAt: new Date(now - 10 * hour).toISOString(),
      flaggedByStaffId: 'STF-402',
      flaggedByStaffName: 'R. K. Sharma',
    },
    internalRemarks: [
      {
        id: 'rem-4',
        staffId: 'STF-402',
        staffName: 'R. K. Sharma',
        text: 'Flagged for Admin review: jurisdiction check needed before committing municipal material.',
        timestamp: new Date(now - 10 * hour).toISOString(),
      },
    ],
  },
  {
    id: 'CF-2026-075',
    category: 'Pothole',
    department: 'Roads & Infrastructure',
    severity: 'High',
    shortDescription: 'Culvert slab fractured before monsoon drain',
    citizenDescription: 'Slab cracked under wheel load, danger of total collapse for crossing vehicles.',
    photoUrl: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=800&q=80',
    locationName: 'Railway Colony Road',
    ward: 'Ward 5 (South)',
    latitude: 23.0695,
    longitude: 70.1380,
    assignedDate: new Date(now - 30 * hour).toISOString(),
    slaDeadline: new Date(now - 6 * hour).toISOString(),
    status: 'Resolved',
    resolution: {
      proofPhotoUrl: 'https://images.unsplash.com/photo-1584463699039-4467c6999966?auto=format&fit=crop&w=800&q=80',
      notes: 'Steel-reinforced precast slab fitted and mortar sealed. Tested with 12-ton load test at 4 PM.',
      resolvedAt: new Date(now - 4 * hour).toISOString(),
      resolvedByStaffId: 'STF-402',
    },
    internalRemarks: [
      {
        id: 'rem-5',
        staffId: 'STF-402',
        staffName: 'R. K. Sharma',
        text: 'Replaced with 200mm M30 precast concrete slab. Barricades removed.',
        timestamp: new Date(now - 4 * hour).toISOString(),
      },
    ],
  },

  // ==========================================
  // DEPARTMENT: Electrical & Lighting
  // ==========================================
  {
    id: 'CF-2026-079',
    category: 'Streetlight',
    department: 'Electrical & Lighting',
    severity: 'Critical',
    shortDescription: 'High-mast light cluster completely dark',
    citizenDescription: 'Six 400W sodium vapor lamps not turning on. Major safety concern for night shift workers near port gate.',
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    locationName: 'Kandla Port Link Highway',
    ward: 'Ward 6 (Industrial)',
    latitude: 23.0880,
    longitude: 70.1550,
    assignedDate: new Date(now - 8 * hour).toISOString(),
    slaDeadline: new Date(now + 2 * hour).toISOString(), // Due in 2 hours
    status: 'In Progress',
    internalRemarks: [
      {
        id: 'rem-6',
        staffId: 'STF-210',
        staffName: 'Vikram Mehta (Electrical Wing)',
        text: 'Control timer box tripped due to surge. Bucket truck dispatched for luminaire test.',
        timestamp: new Date(now - 3 * hour).toISOString(),
      },
    ],
  },
  {
    id: 'CF-2026-083',
    category: 'Streetlight',
    department: 'Electrical & Lighting',
    severity: 'High',
    shortDescription: 'Exposed wire hanging from junction box on pole',
    citizenDescription: 'Open live wire within reach of pedestrians walking dog in public garden.',
    photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    locationName: 'Gandhidham Public Park, Sector 5',
    ward: 'Ward 4 (Central)',
    latitude: 23.0765,
    longitude: 70.1330,
    assignedDate: new Date(now - 2 * hour).toISOString(),
    slaDeadline: new Date(now + 6 * hour).toISOString(),
    status: 'Acknowledged',
    internalRemarks: [],
  },

  // ==========================================
  // DEPARTMENT: Sanitation & Waste
  // ==========================================
  {
    id: 'CF-2026-068',
    category: 'Garbage',
    department: 'Sanitation & Waste',
    severity: 'High',
    shortDescription: 'Commercial 4.5 cubic meter container overflowing',
    citizenDescription: 'Neglected garbage container spilling wet vegetable debris into storm channel and roadway.',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    locationName: 'Grain Market Main Gate',
    ward: 'Ward 3 (East)',
    latitude: 23.0840,
    longitude: 70.1425,
    assignedDate: new Date(now - 5 * hour).toISOString(),
    slaDeadline: new Date(now + 3 * hour).toISOString(),
    status: 'In Progress',
    internalRemarks: [
      {
        id: 'rem-7',
        staffId: 'STF-501',
        staffName: 'Prakash Solanki (Sanitation Inspector)',
        text: 'Compactor truck GJ-12-AZ-4410 rerouted to site. Expected clearance 1:30 PM.',
        timestamp: new Date(now - 1 * hour).toISOString(),
      },
    ],
  },

  // ==========================================
  // DEPARTMENT: Water & Sewage
  // ==========================================
  {
    id: 'CF-2026-074',
    category: 'Water Leakage',
    department: 'Water & Sewage',
    severity: 'Critical',
    shortDescription: '150mm distribution pipeline burst',
    citizenDescription: 'Treated drinking water bursting through road shoulder at 30 PSI, eroding sub-base and flooding two adjacent storefronts.',
    photoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    locationName: 'Sector 2B, Near Post Office',
    ward: 'Ward 2 (North)',
    latitude: 23.0815,
    longitude: 70.1290,
    assignedDate: new Date(now - 10 * hour).toISOString(),
    slaDeadline: new Date(now - 1 * hour).toISOString(),
    status: 'In Progress',
    internalRemarks: [
      {
        id: 'rem-8',
        staffId: 'STF-303',
        staffName: 'Anil Makwana (Hydraulic Eng.)',
        text: 'Isolated isolation valve V-12 at 9:00 AM. Clamp repair ongoing.',
        timestamp: new Date(now - 6 * hour).toISOString(),
      },
    ],
  },
];

/**
 * Filter issues strictly by staff member's department.
 * 
 * Access restriction requirement:
 * Staff must never see issues outside their own department, even in mock data.
 * // TODO: backend must enforce department-scoping server-side, not just hide in UI
 */
export function getMockIssuesForDepartment(
  allIssues: StaffIssue[],
  department: StaffDepartment
): StaffIssue[] {
  // TODO: backend must enforce department-scoping server-side, not just hide in UI
  return allIssues.filter((issue) => issue.department === department);
}
