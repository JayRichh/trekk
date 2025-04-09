import type { 
  Trail, 
  DOCTrail, 
  Review, 
  TrailFilters, 
  Region, 
  CoordinateSystem,
  CacheEntry
} from '../types/trail';
import { supabase } from '../lib/supabase';
import { mockTrails, mockRegions } from './mockData';

// Configuration for DOC API calls
const DOC_API_BASE_URL = 'https://api.doc.govt.nz/v1';
const API_KEY = import.meta.env.VITE_DOC_API_KEY;
const DEFAULT_COORD_SYSTEM: CoordinateSystem = 'wgs84';
const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Azure API Service URL for backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7285';
const API_ENDPOINTS = {
  TRAILS: `${API_BASE_URL}/api/trails`,
  TRAIL: (id: string) => `${API_BASE_URL}/api/trails/${id}`,
  SEARCH: `${API_BASE_URL}/api/trails/search`,
  REVIEW: (trailId: string) => `${API_BASE_URL}/api/trails/${trailId}/reviews`
};

// Cache keys
const CACHE_KEYS = {
  TRAILS: 'doc-trails-cache',
  TRAIL_DETAIL: (id: string) => `doc-trail-${id}-cache`,
  REGIONS: 'doc-regions-cache'
};

// All core functionality remains the same - keeping functions to maintain compatibility

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
  
  // Then apply the maxTrails limit if specified
  if (filters.maxTrails && filters.maxTrails > 0) {
    filteredTrails = filteredTrails.slice(0, filters.maxTrails);
  }
  
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

// This function gets authorization headers for API requests
async function getAuthHeaders() {
  // Get the current session
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export const apiService = {
  // Get all trails with optional filtering
  async getTrails(filters?: TrailFilters): Promise<Trail[]> {
    try {
      // For production, we'll try the .NET backend first
      try {
        // Prepare request URL with query params for filtering
        let url = API_ENDPOINTS.TRAILS;
        
        if (filters) {
          const params = new URLSearchParams();
          
          if (filters.difficulty && filters.difficulty !== 'all') {
            params.append('difficulty', filters.difficulty);
          }
          
          if (filters.length) {
            const [min, max] = filters.length.split('-').map(Number);
            if (min) params.append('minLength', min.toString());
            if (max) params.append('maxLength', max.toString());
          }
          
          if (filters.region) {
            params.append('term', filters.region);
          }
          
          if (params.toString()) {
            url = `${API_ENDPOINTS.SEARCH}?${params.toString()}`;
          }
        }
        
        // Make request to .NET backend
        const response = await fetch(url, {
          headers: await getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status}`);
        }
        
        const trails = await response.json();
        
        // Apply any frontend-only filters
        const filteredTrails = filterTrails(trails, {
          ...filters,
          // Clear filters that were already applied on the backend
          difficulty: undefined,
          length: undefined,
          region: undefined
        });
        
        return filteredTrails;
      } catch (error) {
        console.warn('Backend request failed, falling back to DOC API:', error);
        
        // Fallback to original DOC API logic
        let trails: Trail[] = [];
        
        if (API_KEY) {
          try {
            // Try to get from cache first
            const cachedTrails = getCachedData<DOCTrail[]>(CACHE_KEYS.TRAILS);
            let docTrails: DOCTrail[];
            
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
            
            // Convert to our Trail format
            trails = docTrails.map(docTrailToTrail);
          } catch (error) {
            console.warn('API request failed, using mock data:', error);
            trails = mockTrails;
          }
        } else {
          console.warn('API_KEY not found, using mock data');
          trails = mockTrails;
        }
        
        // Apply filters if provided
        if (filters) {
          trails = filterTrails(trails, filters);
        }
        
        // Get ratings for each trail from Supabase if we have trails
        if (trails.length > 0) {
          const trailIds = trails.map(trail => trail.id);
          await attachRatingsToTrails(trails, trailIds);
        }
        
        return trails;
      }
    } catch (error) {
      console.error('Error fetching trails:', error);
      return [];
    }
  },
  
  // Get a specific trail by ID
  async getTrailById(id: string): Promise<Trail> {
    try {
      // For production, try the .NET backend first
      try {
        const response = await fetch(API_ENDPOINTS.TRAIL(id), {
          headers: await getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.warn(`Backend request failed for trail ${id}, falling back to DOC API:`, error);
        
        // Fallback to original DOC API logic
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
      // First try to submit via the .NET backend
      try {
        const response = await fetch(API_ENDPOINTS.REVIEW(trailId), {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            rating,
            comment,
            tips,
            photos
          })
        });
        
        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status}`);
        }
        
        return true;
      } catch (backendError) {
        console.warn('Backend request failed for submitting rating, falling back to Supabase:', backendError);
        
        // Fallback to direct Supabase interaction
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User must be logged in to submit ratings');
        }
        
        // Insert the rating
        const { error: supabaseError } = await supabase
          .from('trail_ratings')
          .insert({
            user_id: user.id,
            trail_id: trailId,
            rating,
            comment,
            tips,
            photos
          });
        
        if (supabaseError) throw supabaseError;
        return true;
      }
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
