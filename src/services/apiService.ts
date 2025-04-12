import type { 
  Trail, 
  DOCTrail, 
  Review, 
  TrailFilters, 
  Region, 
  CoordinateSystem,
  CacheEntry,
  TrailStatistics,
  LengthRange
} from '../types/trail';
import { supabase } from '../lib/supabase';
import { mockTrails, mockRegions } from './mockData';

// Configuration for DOC API calls
const DOC_API_BASE_URL = 'https://api.doc.govt.nz/v1';
const API_KEY = import.meta.env.VITE_DOC_API_KEY;
const DEFAULT_COORD_SYSTEM: CoordinateSystem = 'wgs84';
const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache keys
const CACHE_KEYS = {
  TRAILS: 'doc-trails-cache',
  TRAIL_DETAIL: (id: string) => `doc-trail-${id}-cache`,
  REGIONS: 'doc-regions-cache'
};

/**
 * Calculate trail length based on coordinates using Haversine formula
 * This version handles any array input safely
 */
function calculateTrailLength(coordinates: any[]): number {
  // Safety check
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return 0;
  }
  
  let totalDistance = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i-1];
    const curr = coordinates[i];
    
    // Skip invalid coordinate pairs
    if (!Array.isArray(prev) || prev.length < 2 || !Array.isArray(curr) || curr.length < 2) {
      continue;
    }
    
    // Safely extract coordinates
    const lon1 = typeof prev[0] === 'number' ? prev[0] : 0;
    const lat1 = typeof prev[1] === 'number' ? prev[1] : 0;
    const lon2 = typeof curr[0] === 'number' ? curr[0] : 0;
    const lat2 = typeof curr[1] === 'number' ? curr[1] : 0;
    
    // Skip if any coordinate is invalid
    if (lon1 === 0 && lat1 === 0 && lon2 === 0 && lat2 === 0) {
      continue;
    }
    
    // Haversine formula
    const R = 6371; // Earth radius in km
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

/**
 * Calculate elevation gain from coordinates
 * This version handles any array input safely
 */
function calculateElevationGain(coordinates: any[]): number {
  // Safety check
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return 0;
  }
  
  let totalGain = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i-1];
    const curr = coordinates[i];
    
    // Skip invalid coordinates
    if (!Array.isArray(prev) || prev.length < 3 || !Array.isArray(curr) || curr.length < 3) {
      continue;
    }
    
    // Safely extract elevations
    const elev1 = typeof prev[2] === 'number' ? prev[2] : 0;
    const elev2 = typeof curr[2] === 'number' ? curr[2] : 0;
    
    // Add only positive elevation changes
    const elevDiff = elev2 - elev1;
    if (elevDiff > 0) {
      totalGain += elevDiff;
    }
  }
  
  return Math.round(totalGain);
}

// Maps DOC API difficulty to our app difficulty levels (if available)
function mapDifficulty(docDifficulty?: string): 'easy' | 'moderate' | 'difficult' | 'extreme' {
  if (!docDifficulty) return 'moderate';
  
  const difficulty = docDifficulty.toLowerCase();
  if (difficulty.includes('easiest') || difficulty.includes('easy')) return 'easy';
  if (difficulty.includes('moderate') || difficulty.includes('intermediate')) return 'moderate';
  if (difficulty.includes('difficult') || difficulty.includes('hard')) return 'difficult';
  if (difficulty.includes('expert') || difficulty.includes('extreme')) return 'extreme';
  
  return 'moderate';
}

// Convert DOC Trail to our Trail format
function docTrailToTrail(docTrail: DOCTrail): Trail {
  // Extract coordinates from line property
  const coordinates: [number, number, number][] = [];
  
  // Safely extract and convert coordinates
  if (docTrail.line && docTrail.line.length > 0) {
    // Get the first line segment (most DOC trails have only one)
    const firstLine = docTrail.line[0];
    
    if (firstLine && firstLine.length > 0) {
      // Convert to our format [lng, lat, elev]
      for (const point of firstLine) {
        if (point && point.length >= 2) {
          // Ensure we have at least longitude and latitude
          const lon = Number(point[0]);
          const lat = Number(point[1]);
          // Use elevation if available, otherwise default to 0
          const elev = point.length > 2 && point[2] !== undefined ? Number(point[2]) : 0;
          
          // Only add valid coordinates
          if (!isNaN(lon) && !isNaN(lat)) {
            coordinates.push([lon, lat, elev]);
          }
        }
      }
    }
  }
  
  // Calculate length and elevation gain from coordinates
  const length = calculateTrailLength(coordinates);
  const elevationGain = calculateElevationGain(coordinates);
  
  // Create a trail object
  const trail: Trail = {
    id: docTrail.assetId,
    name: docTrail.name,
    description: '',  // Not provided by DOC API
    length,
    elevationGain,
    estimatedTime: '',  // Not provided by DOC API
    difficulty: 'moderate', // Default
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306', // Default
    coordinates,
    terrainType: '',  // Not provided by DOC API
    bestTimeToVisit: '',  // Not provided by DOC API
    waterSources: '',  // Not provided by DOC API
    cellReception: '',  // Not provided by DOC API
    reviews: [],
    region: docTrail.region,
    rawData: docTrail  // Store original data for reference
  };
  
  return trail;
}

// Get cached data from localStorage
function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp }: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

// Set cached data in localStorage
function setCachedData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to cache data:', e);
  }
}

// Direct fetch from DOC API
async function fetchFromDOC<T>(
  endpoint: string, 
  params: Record<string, string> = {}
): Promise<T> {
  // Add coordinates parameter if not present
  if (!params.coordinates) {
    params.coordinates = DEFAULT_COORD_SYSTEM;
  }
  
  // Build query string
  const queryParams = new URLSearchParams(params).toString();
  const url = `${DOC_API_BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  // Make request with API key header
  const response = await fetch(url, {
    headers: {
      'x-api-key': API_KEY,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Helper function to filter trails based on criteria
function filterTrails(trails: Trail[], filters?: TrailFilters): Trail[] {
  if (!filters) return trails;
  
  // First apply all the standard filters
  let filteredTrails = trails.filter(trail => {
    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'all' && 
        trail.difficulty !== filters.difficulty) {
      return false;
    }
    
    // Filter by length
    if (filters.length) {
      const [min, max] = filters.length.split('-').map(Number);
      if (min && trail.length < min) return false;
      if (max && trail.length > max) return false;
    }
    
    // Filter by elevation
    if (filters.elevation) {
      const [min, max] = filters.elevation.split('-').map(Number);
      if (min && trail.elevationGain && trail.elevationGain < min) return false;
      if (max && trail.elevationGain && trail.elevationGain > max) return false;
    }
    
    // Filter by region
    if (filters.region && trail.region) {
      return trail.region.some(r => 
        r.toLowerCase().includes(filters.region!.toLowerCase())
      );
    }
    
    return true;
  });
  
  // REMOVED: maxTrails limit to allow all trails to be returned
  // Original code:
  // if (filters.maxTrails && filters.maxTrails > 0) {
  //   filteredTrails = filteredTrails.slice(0, filters.maxTrails);
  // }
  
  return filteredTrails;
}

// Helper to attach ratings from Supabase to trails
async function attachRatingsToTrails(trails: Trail[], trailIds: string[]): Promise<void> {
  try {
    // Direct query for all ratings at once - no batching
    const { data, error } = await supabase
      .from('trail_ratings_with_users')
      .select(`
        id, 
        trail_id, 
        rating, 
        comment, 
        created_at, 
        photos, 
        tips,
        user_id,
        display_name,
        avatar_url
      `)
      .in('trail_id', trailIds);
    
    if (error) throw error;
    
    // Group ratings by trail ID
    const ratingsByTrailId: Record<string, Review[]> = {};
    
    // Process the data
    (data || []).forEach(item => {
      const trailId = item.trail_id;
      if (!ratingsByTrailId[trailId]) {
        ratingsByTrailId[trailId] = [];
      }
      
      // Create a review object
      ratingsByTrailId[trailId].push({
        id: item.id,
        author: item.display_name || 'Anonymous',
        date: new Date(item.created_at).toLocaleDateString(),
        rating: item.rating,
        text: item.comment || '',
        trailId: trailId,
        photos: item.photos || [],
        tips: item.tips || ''
      });
    });
    
    // Attach ratings to trails
    trails.forEach(trail => {
      trail.reviews = ratingsByTrailId[trail.id] || [];
    });
  } catch (error) {
    console.error('Error attaching ratings to trails:', error);
  }
}

// Process data in smaller chunks to avoid blocking the main thread
async function processDataInChunks<T, U>(
  items: T[],
  processFn: (item: T) => U,
  chunkSize: number = 50
): Promise<U[]> {
  const results: U[] = [];
  const totalItems = items.length;
  
  for (let i = 0; i < totalItems; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    // Use setTimeout to allow the UI thread to breathe between chunks
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

// Standard length ranges used for filtering and statistics
const LENGTH_RANGES: LengthRange[] = [
  { id: '0-5', label: 'Short (< 5km)', min: 0, max: 5 },
  { id: '5-15', label: 'Medium (5-15km)', min: 5, max: 15 },
  { id: '15-30', label: 'Long (15-30km)', min: 15, max: 30 },
  { id: '30-100', label: 'Very Long (> 30km)', min: 30, max: null }
];

// Difficulty levels with their display labels
const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'difficult', label: 'Difficult' },
  { id: 'extreme', label: 'Extreme' }
];

export const apiService = {
  // Get trail statistics (counts by category)
  async getTrailStatistics(): Promise<TrailStatistics> {
    try {
      let docTrails: DOCTrail[] = [];
      let allTrails: Trail[] = [];
      
      // Try to get from cache first to avoid re-fetching
      const cachedTrails = getCachedData<DOCTrail[]>(CACHE_KEYS.TRAILS);
      
      if (cachedTrails) {
        console.log('Using cached trails data for statistics');
        docTrails = cachedTrails;
      } else {
        // Fetch from API if not in cache
        console.log('Fetching trails from DOC API for statistics');
        if (API_KEY) {
          docTrails = await fetchFromDOC<DOCTrail[]>('tracks');
          // Cache the results
          setCachedData(CACHE_KEYS.TRAILS, docTrails);
        } else {
          // Use mock data if no API key
          return this.getMockStatistics();
        }
      }
      
      // We need all trails for statistics, but we can process them in chunks
      allTrails = await processDataInChunks(docTrails, docTrailToTrail, 100);
      
      // Calculate statistics
      const stats: TrailStatistics = {
        totalCount: allTrails.length,
        byRegion: [],
        byDifficulty: [],
        byLength: [],
        totalDistance: 0
      };
      
      // Calculate total distance of all trails
      stats.totalDistance = allTrails.reduce((total, trail) => total + trail.length, 0);
      
      // Count by region
      const regionCounts: Record<string, { id: string, name: string, count: number }> = {};
      
      // Get regions data
      const regions = await this.getRegions();
      const regionMap = new Map<string, Region>();
      regions.forEach(region => regionMap.set(region.name, region));
      
      // Count trails by region
      allTrails.forEach(trail => {
        if (trail.region && trail.region.length > 0) {
          trail.region.forEach(regionName => {
            const region = regionMap.get(regionName);
            if (region && region.id) {
              if (!regionCounts[region.id]) {
                regionCounts[region.id] = { id: region.id, name: region.name, count: 0 };
              }
              
              // Ensure it exists before incrementing
              if (regionCounts[region.id]) {
                regionCounts[region.id].count++;
              }
            }
          });
        }
      });
      
      stats.byRegion = Object.values(regionCounts).sort((a, b) => b.count - a.count);
      
      // Count by difficulty
      const difficultyCounts: Record<string, number> = {
        'easy': 0,
        'moderate': 0,
        'difficult': 0,
        'extreme': 0
      };
      
      allTrails.forEach(trail => {
        if (difficultyCounts[trail.difficulty] !== undefined) {
          difficultyCounts[trail.difficulty]++;
        } else {
          // Default to moderate for unknown difficulties
          difficultyCounts['moderate']++;
        }
      });
      
      stats.byDifficulty = DIFFICULTY_LEVELS.map(level => ({
        difficulty: level.id,
        count: difficultyCounts[level.id] || 0
      }));
      
      // Count by length range
      const lengthCounts = LENGTH_RANGES.map(range => {
        const count = allTrails.filter(trail => {
          if (range.max === null) {
            return trail.length >= range.min;
          }
          return trail.length >= range.min && trail.length < range.max;
        }).length;
        
        return {
          range: range.id,
          label: range.label,
          count,
          min: range.min,
          max: range.max
        };
      });
      
      stats.byLength = lengthCounts;
      
      return stats;
    } catch (error) {
      console.error('Error generating trail statistics:', error);
      return this.getMockStatistics();
    }
  },
  
  // Fallback mock statistics if API fails
  getMockStatistics(): TrailStatistics {
    const stats: TrailStatistics = {
      totalCount: mockTrails.length,
      byRegion: [],
      byDifficulty: [],
      byLength: [],
      totalDistance: 0
    };
    
    // Calculate total distance
    stats.totalDistance = mockTrails.reduce((total, trail) => total + trail.length, 0);
    
    // Count by region
    const regionCounts: Record<string, { id: string, name: string, count: number }> = {};
    mockRegions.forEach(region => {
      regionCounts[region.id] = { id: region.id, name: region.name, count: 0 };
    });
    
    mockTrails.forEach(trail => {
      if (trail.region && trail.region.length > 0) {
        trail.region.forEach(regionName => {
          const region = mockRegions.find(r => r.name === regionName);
          if (region && region.id && regionCounts[region.id]) {
            regionCounts[region.id].count++;
          }
        });
      }
    });
    
    stats.byRegion = Object.values(regionCounts);
    
    // Count by difficulty
    const difficultyCounts: Record<string, number> = {
      'easy': 0,
      'moderate': 0,
      'difficult': 0,
      'extreme': 0
    };
    
    mockTrails.forEach(trail => {
      if (difficultyCounts[trail.difficulty] !== undefined) {
        difficultyCounts[trail.difficulty]++;
      } else {
        difficultyCounts['moderate']++;
      }
    });
    
    stats.byDifficulty = DIFFICULTY_LEVELS.map(level => ({
      difficulty: level.id,
      count: difficultyCounts[level.id] || 0
    }));
    
    // Count by length
    stats.byLength = LENGTH_RANGES.map(range => {
      const count = mockTrails.filter(trail => {
        if (range.max === null) {
          return trail.length >= range.min;
        }
        return trail.length >= range.min && trail.length < range.max;
      }).length;
      
      return {
        range: range.id,
        label: range.label,
        count,
        min: range.min,
        max: range.max
      };
    });
    
    return stats;
  },
  
  // Get all trails with optional filtering and pagination
  async getTrails(filters?: TrailFilters, options?: { 
    page?: number, 
    pageSize?: number, 
    loadAll?: boolean, 
    largePageSize?: boolean,
    bypassPagination?: boolean
  }): Promise<{ trails: Trail[], totalCount: number }> {
    try {
      const defaultOptions = { page: 1, pageSize: 20, loadAll: false };
      const { page, pageSize, loadAll } = { ...defaultOptions, ...options };
      
      let allTrails: Trail[] = [];
      let docTrails: DOCTrail[] = [];
      
      // Check if we have API key
      if (API_KEY) {
        try {
          // Try to get from cache first
          const cachedTrails = getCachedData<DOCTrail[]>(CACHE_KEYS.TRAILS);
          
          if (cachedTrails) {
            console.log('Using cached trails data');
            docTrails = cachedTrails;
          } else {
            // Fetch from API if not in cache
            console.log('Fetching trails from DOC API');
            docTrails = await fetchFromDOC<DOCTrail[]>('tracks');
            // Cache the results
            setCachedData(CACHE_KEYS.TRAILS, docTrails);
          }
          
          // Apply filters early if possible to reduce processing
          if (filters && filters.region) {
            docTrails = docTrails.filter(trail => 
              trail.region && trail.region.some(r => 
                r.toLowerCase().includes(filters.region!.toLowerCase())
              )
            );
          }
          
          // For map views, we need to process all data upfront
          if (loadAll) {
            allTrails = await processDataInChunks(docTrails, docTrailToTrail, 100);
          } else {
            // For regular views, we process just what we need for initial display
            const initialProcessSize = Math.min(pageSize * 2, docTrails.length);
            const initialBatch = docTrails.slice(0, initialProcessSize);
            
            // Convert to our Trail format - but only process what we need immediately
            allTrails = await processDataInChunks(initialBatch, docTrailToTrail);
            
            // Store the remaining unprocessed trails for later
            if (docTrails.length > initialProcessSize) {
              // We don't process these now, but we'll make them available for future processing
              const remainingTrails = docTrails.slice(initialProcessSize);
              console.log(`${remainingTrails.length} trails ready for on-demand processing`);
            }
          }
        } catch (error) {
          console.warn('API request failed, using mock data:', error);
          allTrails = mockTrails;
        }
      } else {
        console.warn('API_KEY not found, using mock data');
        allTrails = mockTrails;
      }
      
      // Apply remaining filters
      let filteredTrails = allTrails;
      if (filters) {
        filteredTrails = filterTrails(allTrails, filters);
      }
      
      // Calculate total count (used for pagination UI)
      const totalCount = filteredTrails.length;
      
  // Get the requested page - check for special flag to bypass pagination
  let pageTrails = filteredTrails;
  if (!loadAll && !options?.bypassPagination) {
    // Use a much larger pageSize when requested
    const effectivePageSize = options?.largePageSize ? 500 : pageSize;
    const startIdx = (page - 1) * effectivePageSize;
    pageTrails = filteredTrails.slice(startIdx, startIdx + effectivePageSize);
    console.log(`Pagination: Page ${page}, showing ${startIdx} to ${startIdx + effectivePageSize} of ${filteredTrails.length} trails`);
  } else {
    console.log(`Returning all ${filteredTrails.length} trails without pagination`);
  }
      
      // Get ratings for trails on this page
      if (pageTrails.length > 0) {
        const trailIds = pageTrails.map(trail => trail.id);
        await attachRatingsToTrails(pageTrails, trailIds);
      }
      
      return { 
        trails: pageTrails, 
        totalCount 
      };
    } catch (error) {
      console.error('Error fetching trails:', error);
      return { trails: [], totalCount: 0 };
    }
  },
  
  // Get a specific trail by ID
  async getTrailById(id: string): Promise<Trail> {
    try {
      if (API_KEY) {
        try {
          // Try to get from cache first
          const cacheKey = CACHE_KEYS.TRAIL_DETAIL(id);
          const cachedTrail = getCachedData<DOCTrail>(cacheKey);
          let docTrail: DOCTrail;
          
          if (cachedTrail) {
            console.log(`Using cached trail data for ${id}`);
            docTrail = cachedTrail;
          } else {
            // Fetch from API if not in cache
            console.log(`Fetching trail ${id} from DOC API`);
            docTrail = await fetchFromDOC<DOCTrail>(`tracks/${id}/detail`);
            
            // Cache the results
            setCachedData(cacheKey, docTrail);
          }
          
          // Convert to our Trail format
          const trail = docTrailToTrail(docTrail);
          
          // Get ratings for this trail from Supabase
          await attachRatingsToTrails([trail], [id]);
          
          return trail;
        } catch (error) {
          console.warn(`API request failed for trail ${id}, using mock data:`, error);
          // Fallback to mock data
          const trail = mockTrails.find(t => t.id === id);
          if (!trail) {
            throw new Error(`Trail with ID ${id} not found`);
          }
          return trail;
        }
      } else {
        console.warn('API_KEY not found for trail detail, using mock data');
        const trail = mockTrails.find(t => t.id === id);
        if (!trail) {
          throw new Error(`Trail with ID ${id} not found`);
        }
        return trail;
      }
    } catch (error) {
      console.error(`Error fetching trail ${id}:`, error);
      throw error;
    }
  },
  
  // Get alerts for a specific trail
  async getTrailAlerts(id: string): Promise<any[]> {
    try {
      if (API_KEY) {
        try {
          return await fetchFromDOC<any[]>(`tracks/${id}/alerts`);
        } catch (error) {
          console.warn(`API request failed for trail alerts for ${id}:`, error);
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching alerts for trail ${id}:`, error);
      return [];
    }
  },
  
  // Get regions from the DOC API
  async getRegions(): Promise<Region[]> {
    try {
      if (API_KEY) {
        try {
          // Try to get from cache first
          const cachedRegions = getCachedData<any[]>(CACHE_KEYS.REGIONS);
          let regionsData: any[];
          
          if (cachedRegions) {
            console.log('Using cached regions data');
            regionsData = cachedRegions;
          } else {
            // This is a placeholder - DOC API doesn't have a direct regions endpoint
            // We would extract unique regions from trails instead
            
            // Get all trails 
            const docTrails = await fetchFromDOC<DOCTrail[]>('tracks');
            
            // Extract unique regions
            const regionSet = new Set<string>();
            docTrails.forEach(trail => {
              if (trail.region) {
                trail.region.forEach(r => regionSet.add(r));
              }
            });
            
            regionsData = Array.from(regionSet).map((name, index) => ({
              id: `region-${index}`,
              name
            }));
            
            // Cache the results
            setCachedData(CACHE_KEYS.REGIONS, regionsData);
          }
          
          return regionsData.map(r => ({
            id: r.id || r.name,
            name: r.name,
            description: r.description || '',
            trailCount: r.trailCount || 0
          }));
        } catch (error) {
          console.warn('API request failed for regions, using mock data:', error);
          return mockRegions;
        }
      } else {
        console.warn('API_KEY not found for regions, using mock data');
        return mockRegions;
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      return mockRegions;
    }
  },
  
  // Submit a rating for a trail
  async submitRating(
    trailId: string, 
    rating: number, 
    comment?: string,
    tips?: string,
    photos?: string[]
  ): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be logged in to submit ratings');
      }
      
      // Insert the rating
      const { error } = await supabase
        .from('trail_ratings')
        .insert({
          user_id: user.id,
          trail_id: trailId,
          rating,
          comment,
          tips,
          photos
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      return false;
    }
  },
  
  // Get ratings for a trail
  async getTrailRatings(trailId: string): Promise<Review[]> {
    try {
      // Use the view directly with a filter
      const { data, error } = await supabase
        .from('trail_ratings_with_users')
        .select(`
          id, 
          trail_id, 
          rating, 
          comment, 
          created_at, 
          photos, 
          tips,
          user_id,
          display_name,
          avatar_url
        `)
        .eq('trail_id', trailId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to our Review format
      return (data || []).map((item: any) => {
        return {
          id: item.id,
          author: item.display_name || 'Anonymous',
          date: new Date(item.created_at).toLocaleDateString(),
          rating: item.rating,
          text: item.comment || '',
          trailId: trailId,
          photos: item.photos || [],
          tips: item.tips || ''
        };
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }
  }
};
