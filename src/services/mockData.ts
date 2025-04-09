import type { Trail, DOCTrail, Region } from '../types/trail';

// Generate DOC API compatible line coordinates for a track
function generateTrackLines(startLat: number, startLng: number, length: number): number[][][] {
  const line: number[][] = [];
  const segmentCount = Math.ceil(length * 10); // More segments for longer tracks
  
  // Create a gentle sinusoidal pattern
  for (let i = 0; i <= segmentCount; i++) {
    const ratio = i / segmentCount;
    const lat = startLat + (Math.sin(ratio * Math.PI * 2) * 0.01);
    const lng = startLng + (ratio * 0.03); // Progress eastward
    const elevation = 100 + Math.sin(ratio * Math.PI * 3) * 150; // Vary elevation
    
    line.push([lng, lat, elevation]);
  }
  
  // Return in DOC format which is [line segments][points][coordinates]
  return [line];
}

// Convert our coordinates to the format expected by our Trail type
function generateTrackCoordinates(startLat: number, startLng: number, length: number): [number, number, number][] {
  const lines = generateTrackLines(startLat, startLng, length);
  if (!lines || !lines.length || !lines[0] || !lines[0].length) {
    return []; // Return empty array if no valid coordinates
  }
  
  const line = lines[0];
  return line.map(point => [point[0], point[1], point[2]] as [number, number, number]);
}

// Mock regions for New Zealand
export const mockRegions: Region[] = [
  { id: 'NZ-NTL', name: 'Northland', description: 'The northernmost region of New Zealand', trailCount: 12 },
  { id: 'NZ-AUK', name: 'Auckland', description: 'New Zealand\'s largest city and surrounding areas', trailCount: 15 },
  { id: 'DOC-COR', name: 'Coromandel', description: 'Peninsula with beautiful beaches and native forests', trailCount: 8 },
  { id: 'NZ-WKO', name: 'Waikato', description: 'Region known for its rolling hills and the Waikato River', trailCount: 10 },
  { id: 'NZ-BOP', name: 'Bay of Plenty', description: 'Coastal region with active geothermal areas', trailCount: 12 },
  { id: 'NZ-GIS', name: 'East Coast', description: 'The eastern coastal region of the North Island', trailCount: 7 },
  { id: 'NZ-TKI', name: 'Taranaki', description: 'Region dominated by Mount Taranaki', trailCount: 9 },
  { id: 'NZ-HKB', name: 'Hawke\'s Bay', description: 'Wine region with Art Deco architecture', trailCount: 8 },
  { id: 'NZ-WGN', name: 'Wellington/Kapiti', description: 'New Zealand\'s capital city and surrounding areas', trailCount: 11 },
  { id: 'NZ-NSN', name: 'Nelson/Tasman', description: 'Sunny region with diverse landscapes', trailCount: 13 },
  { id: 'NZ-MBH', name: 'Marlborough', description: 'Known for wine and the Marlborough Sounds', trailCount: 9 },
  { id: 'NZ-WTC', name: 'West Coast', description: 'Rugged coastline with rainforests and glaciers', trailCount: 15 },
  { id: 'NZ-CAN', name: 'Canterbury', description: 'Large region with plains and Southern Alps', trailCount: 17 },
  { id: 'NZ-OTA', name: 'Otago', description: 'Southern region with mountains and lakes', trailCount: 14 },
  { id: 'NZ-STL', name: 'Southland', description: 'Southernmost region of New Zealand', trailCount: 12 },
  { id: 'DOC-FIL', name: 'Fiordland', description: 'Dramatic landscape of fiords, waterfalls and mountains', trailCount: 10 },
  { id: 'DOC-CNI', name: 'Central North Island', description: 'Volcanic plateau with lakes and mountains', trailCount: 14 },
];

// Mock DOCTrail objects to match the API format
export const mockDOCTrails: DOCTrail[] = [
  {
    assetId: 'track-001',
    name: 'Tongariro Alpine Crossing',
    region: ['Central North Island'],
    x: 1827405.6851,  // NZTM coordinates
    y: 5665382.7324,
    line: generateTrackLines(-39.1333, 175.6333, 19.4)
  },
  {
    assetId: 'track-002',
    name: 'Routeburn Track',
    region: ['Fiordland', 'Otago'],
    x: 1243128.3761,
    y: 5025789.8425,
    line: generateTrackLines(-44.7667, 168.1833, 32)
  },
  {
    assetId: 'track-003',
    name: 'Abel Tasman Coast Track',
    region: ['Nelson/Tasman'],
    x: 1601839.5244,
    y: 5471482.1536,
    line: generateTrackLines(-40.9042, 173.0167, 60)
  },
  {
    assetId: 'track-004',
    name: 'Hooker Valley Track',
    region: ['Canterbury'],
    x: 1369512.4872,
    y: 5159742.2387,
    line: generateTrackLines(-43.7333, 170.0958, 10)
  },
  {
    assetId: 'track-005',
    name: 'Milford Track',
    region: ['Fiordland'],
    x: 1182634.8712,
    y: 5019876.5245,
    line: generateTrackLines(-44.9333, 167.8, 53.5)
  }
];

// Mock trails with actual data for New Zealand
export const mockTrails: Trail[] = [
  {
    id: 'track-001',
    name: 'Tongariro Alpine Crossing',
    description: 'One of New Zealand\'s most popular day hikes, crossing a dramatic volcanic landscape with emerald lakes and expansive views.',
    length: 19.4,
    elevationGain: 765,
    estimatedTime: '6-8 hours',
    difficulty: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1589802829710-a6d0e5c7e5e8',
    coordinates: generateTrackCoordinates(-39.1333, 175.6333, 19.4),
    terrainType: 'Volcanic rock and alpine terrain',
    bestTimeToVisit: 'Summer and early autumn (December to April)',
    waterSources: 'Limited. Bring at least 2 liters per person.',
    cellReception: 'Patchy. Download maps before hiking.',
    region: ['Central North Island'],
    reviews: [
      {
        id: 'review-101',
        author: 'Hiking Enthusiast',
        date: '2024-05-10',
        rating: 5,
        text: 'Absolutely stunning hike! The emerald lakes are breathtaking. Start early to avoid crowds.',
        photos: [],
        tips: 'Bring layers as weather can change quickly, even in summer.'
      }
    ],
    rawData: mockDOCTrails[0]
  },
  {
    id: 'track-002',
    name: 'Routeburn Track',
    description: 'A spectacular alpine track traversing meadows, lakes and mountains in Fiordland and Mount Aspiring National Parks.',
    length: 32,
    elevationGain: 1127,
    estimatedTime: '2-4 days',
    difficulty: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1591121213969-ec11b0b3fa5a',
    coordinates: generateTrackCoordinates(-44.7667, 168.1833, 32),
    terrainType: 'Well-maintained track with some rocky sections',
    bestTimeToVisit: 'October to April',
    waterSources: 'Streams along the route, but treatment recommended',
    cellReception: 'None. Emergency hut radios only.',
    region: ['Fiordland', 'Otago'],
    reviews: [
      {
        id: 'review-102',
        author: 'Alpine Trekker',
        date: '2024-03-15',
        rating: 5,
        text: 'World-class track with incredible vistas. The Lake Mackenzie area is sublime.',
        photos: [],
        tips: 'Book huts well in advance during peak season (Dec-Feb).'
      }
    ],
    rawData: mockDOCTrails[1]
  },
  {
    id: 'track-003',
    name: 'Abel Tasman Coast Track',
    description: 'A coastal paradise with golden beaches, turquoise waters, and native forest. One of New Zealand\'s Great Walks.',
    length: 60,
    elevationGain: 220,
    estimatedTime: '3-5 days',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1589483232748-515c025575bc',
    coordinates: generateTrackCoordinates(-40.9042, 173.0167, 60),
    terrainType: 'Well-formed track, mostly gentle terrain',
    bestTimeToVisit: 'Year-round, best from November to April',
    waterSources: 'Water available at campsites and huts',
    cellReception: 'Limited coverage in some areas',
    region: ['Nelson/Tasman'],
    reviews: [
      {
        id: 'review-103',
        author: 'Beach Walker',
        date: '2024-01-22',
        rating: 4,
        text: 'Beautiful coastal scenery and easy walking. Can be busy in summer but worth it.',
        photos: [],
        tips: 'Consider kayaking for part of the journey to add variety.'
      }
    ],
    rawData: mockDOCTrails[2]
  },
  {
    id: 'track-004',
    name: 'Hooker Valley Track',
    description: 'An accessible track providing stunning views of Aoraki/Mount Cook, New Zealand\'s highest mountain.',
    length: 10,
    elevationGain: 124,
    estimatedTime: '3 hours',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1578647038275-9293e3712ae2',
    coordinates: generateTrackCoordinates(-43.7333, 170.0958, 10),
    terrainType: 'Gravel path with boardwalks and swing bridges',
    bestTimeToVisit: 'Year-round, but winter brings snow panoramas',
    waterSources: 'None on trail. Bring water.',
    cellReception: 'Good near the village, limited on the track',
    region: ['Canterbury'],
    reviews: [
      {
        id: 'review-104',
        author: 'Mountain Gazer',
        date: '2024-04-05',
        rating: 5,
        text: 'The most spectacular short hike in NZ. Views of Mt Cook are unparalleled.',
        photos: [],
        tips: 'Go early morning for the best light on the mountains and fewer people.'
      }
    ],
    rawData: mockDOCTrails[3]
  },
  {
    id: 'track-005',
    name: 'Milford Track',
    description: 'Often called the finest walk in the world, traversing rainforests, wetlands, and alpine passes.',
    length: 53.5,
    elevationGain: 1400,
    estimatedTime: '4 days',
    difficulty: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1596387451750-8a6c428eef68',
    coordinates: generateTrackCoordinates(-44.9333, 167.8, 53.5),
    terrainType: 'Well-maintained tracks with some challenging sections',
    bestTimeToVisit: 'October to April (bookings essential)',
    waterSources: 'Abundant, but treat before drinking',
    cellReception: 'None. Emergency hut radios only.',
    region: ['Fiordland'],
    reviews: [
      {
        id: 'review-105',
        author: 'Tramping Enthusiast',
        date: '2024-02-10',
        rating: 5,
        text: 'Truly lives up to the hype. The Clinton Canyon and Mackinnon Pass are magnificent.',
        photos: [],
        tips: 'Book a year in advance for peak season. Be prepared for rain any time of year.'
      }
    ],
    rawData: mockDOCTrails[4]
  }
];
