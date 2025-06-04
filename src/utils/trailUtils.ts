import type { 
  Trail, 
  DOCTrail, 
  CoordinateSystem,
  LengthRange
} from '../types/trail';

export const DEFAULT_COORD_SYSTEM: CoordinateSystem = 'wgs84';

export const LENGTH_RANGES: LengthRange[] = [
  { id: '0-5', label: 'Short (< 5km)', min: 0, max: 5 },
  { id: '5-15', label: 'Medium (5-15km)', min: 5, max: 15 },
  { id: '15-30', label: 'Long (15-30km)', min: 15, max: 30 },
  { id: '30-100', label: 'Very Long (> 30km)', min: 30, max: null }
];

export const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'difficult', label: 'Difficult' },
  { id: 'extreme', label: 'Extreme' }
];

export function calculateTrailLength(coordinates: any[]): number {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return 0;
  }
  
  let totalDistance = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i-1];
    const curr = coordinates[i];
    
    if (!Array.isArray(prev) || prev.length < 2 || !Array.isArray(curr) || curr.length < 2) {
      continue;
    }
    
    const lon1 = typeof prev[0] === 'number' ? prev[0] : 0;
    const lat1 = typeof prev[1] === 'number' ? prev[1] : 0;
    const lon2 = typeof curr[0] === 'number' ? curr[0] : 0;
    const lat2 = typeof curr[1] === 'number' ? curr[1] : 0;
    
    if (lon1 === 0 && lat1 === 0 && lon2 === 0 && lat2 === 0) {
      continue;
    }
    
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    totalDistance += distance;
  }
  
  return Number(totalDistance.toFixed(2));
}

export function calculateElevationGain(coordinates: any[]): number {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return 0;
  }
  
  let totalGain = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i-1];
    const curr = coordinates[i];
    
    if (!Array.isArray(prev) || prev.length < 3 || !Array.isArray(curr) || curr.length < 3) {
      continue;
    }
    
    const elev1 = typeof prev[2] === 'number' ? prev[2] : 0;
    const elev2 = typeof curr[2] === 'number' ? curr[2] : 0;
    
    const elevDiff = elev2 - elev1;
    if (elevDiff > 0) {
      totalGain += elevDiff;
    }
  }
  
  return Math.round(totalGain);
}

export function mapDifficulty(docDifficulty?: string): 'easy' | 'moderate' | 'difficult' | 'extreme' {
  if (!docDifficulty) return 'moderate';
  
  const difficulty = docDifficulty.toLowerCase();
  if (difficulty.includes('easiest') || difficulty.includes('easy')) return 'easy';
  if (difficulty.includes('moderate') || difficulty.includes('intermediate')) return 'moderate';
  if (difficulty.includes('difficult') || difficulty.includes('hard')) return 'difficult';
  if (difficulty.includes('expert') || difficulty.includes('extreme')) return 'extreme';
  
  return 'moderate';
}

export function docTrailToTrail(docTrail: DOCTrail): Trail {
  const coordinates: [number, number, number][] = [];
  
  if (docTrail.line && docTrail.line.length > 0) {
    const firstLine = docTrail.line[0];
    
    if (firstLine && firstLine.length > 0) {
      for (const point of firstLine) {
        if (point && point.length >= 2) {
          const lon = Number(point[0]);
          const lat = Number(point[1]);
          const elev = point.length > 2 && point[2] !== undefined ? Number(point[2]) : 0;
          
          if (!isNaN(lon) && !isNaN(lat)) {
            coordinates.push([lon, lat, elev]);
          }
        }
      }
    }
  }
  
  const length = calculateTrailLength(coordinates);
  const elevationGain = calculateElevationGain(coordinates);
  
  const trail: Trail = {
    id: docTrail.assetId,
    name: docTrail.name,
    description: '',
    length,
    elevationGain,
    estimatedTime: '',
    difficulty: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
    coordinates,
    terrainType: '',
    bestTimeToVisit: '',
    waterSources: '',
    cellReception: '',
    reviews: [],
    region: docTrail.region,
    rawData: docTrail
  };
  
  return trail;
}

export async function processDataInChunks<T, U>(
  items: T[],
  processFn: (item: T) => U,
  chunkSize: number = 50
): Promise<U[]> {
  const results: U[] = [];
  const totalItems = items.length;
  
  for (let i = 0; i < totalItems; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await new Promise(resolve => {
      setTimeout(() => {
        const processedChunk = chunk.map(processFn);
        results.push(...processedChunk);
        resolve(null);
      }, 0);
    });
  }
  
  return results;
}
