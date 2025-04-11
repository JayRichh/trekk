// DOC API Trail type definition based on their API structure
export interface DOCTrail {
  assetId: string;          // Unique ID (e.g. "0c3b4ce6-4c56-412c-9bb8-87a78524c45b")
  name: string;             // Trail name (e.g. "A Frame Hut & Takapari Road Track")
  region: string[];         // Regions array (e.g. ["Hawke's Bay"])
  x: number;                // X coordinate (NZTM format, e.g. 1857590.9413)
  y: number;                // Y coordinate (NZTM format, e.g. 5555115.2545)
  line: number[][][];       // Array of line segments, each an array of coordinate pairs/triples
}

// Our application's Trail model extended with additional properties
export interface Trail {
  id: string;               // Same as DOCTrail.assetId
  name: string;             // Trail name
  description?: string;     // Additional description
  length: number;           // Trail length in kilometers
  elevationGain?: number;   // Elevation gain in meters
  estimatedTime?: string;   // Estimated time to complete
  difficulty: 'easy' | 'moderate' | 'difficult' | 'extreme';
  imageUrl?: string;        // URL to trail image
  coordinates: [number, number, number][]; // [longitude, latitude, elevation]
  terrainType?: string;     // Type of terrain
  bestTimeToVisit?: string; // Best season/time to visit
  waterSources?: string;    // Information about water sources
  cellReception?: string;   // Cell reception information
  reviews?: Review[];       // User reviews
  region?: string[];        // Regions this trail belongs to
  duration?: string;        // Duration (may be the same as estimatedTime)
  status?: string;          // Trail status (open, closed, etc.)
  
  // Original DOC data
  rawData?: DOCTrail;       // Keep original data for reference if needed
}

// Review model for user-submitted trail reviews
export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  trailId?: string;
  photos?: string[];
  tips?: string;
}

// Region model
export interface Region {
  id: string;
  name: string;
  description?: string;
  trailCount?: number;
}

// Coordinate systems supported by DOC API
export type CoordinateSystem = 'nztm' | 'wgs84' | 'nzgd2000';

// Filters for trail search
export interface TrailFilters {
  difficulty?: string;
  length?: string;
  elevation?: string;
  region?: string;
  maxTrails?: number;  // Maximum number of trails to return
}

// Cache structure for local storage
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Statistics for trails
export interface TrailStatistics {
  totalCount: number;
  byRegion: Array<{ id: string; name: string; count: number }>;
  byDifficulty: Array<{ difficulty: string; count: number }>;
  byLength: Array<{ 
    range: string; 
    label: string;
    count: number;
    min: number;
    max: number | null;
  }>;
  totalDistance: number;
}

// Length range definition
export interface LengthRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}
