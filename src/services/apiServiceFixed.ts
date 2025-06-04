import type { 
  Trail, 
  TrailFilters, 
  Region, 
  TrailStatistics,
  Review
} from '../types/trail';
import { mockTrails, mockRegions } from './mockData';
import { docTrailToTrail, LENGTH_RANGES, DIFFICULTY_LEVELS, processDataInChunks } from '../utils/trailUtils';
import { 
  isApiKeyAvailable, 
  getAllTrails, 
  getTrailById as getDocTrailById, 
  getTrailAlerts as getDocTrailAlerts,
  syncTrailsToSupabase 
} from '../utils/docApiUtils';
import {
  getTrailsFromSupabase,
  getTrailByIdFromSupabase,
  getRegionsFromSupabase,
  getTrailRatings,
  attachRatingsToTrails,
  submitRating as submitRatingToSupabase
} from '../utils/supabaseUtils';

export const apiService = {
  async getTrailStatistics(): Promise<TrailStatistics> {
    try {
      // Try to get trails from Supabase
      const { data: supabaseTrails, error } = await getTrailsFromSupabase({
        page: 0,
        pageSize: 1000
      });
      
      let trails: Trail[] = [];
      
      if (error || !supabaseTrails || supabaseTrails.length === 0) {
        console.log('Falling back to DOC API or mock data for statistics');
        // If Supabase fails or has no data, try DOC API
        if (isApiKeyAvailable()) {
          try {
            trails = await getAllTrails();
            if (trails.length > 0) {
              await syncTrailsToSupabase(trails);
            } else {
              return this.getMockStatistics();
            }
          } catch (docError) {
            console.error('DOC API failed, using mock data:', docError);
            return this.getMockStatistics();
          }
        } else {
          return this.getMockStatistics();
        }
      } else {
        trails = supabaseTrails;
      }
      
      const stats: TrailStatistics = {
        totalCount: trails.length,
        byRegion: [],
        byDifficulty: [],
        byLength: [],
        totalDistance: 0
      };
      
      stats.totalDistance = trails.reduce((total, trail) => total + trail.length, 0);
      
      // Get regions
      const regions = await this.getRegions();
      const regionMap = new Map<string, Region>();
      regions.forEach((region: Region) => {
        if (region.name) {
          regionMap.set(region.name, region);
        }
      });
      
      // Calculate region statistics
      const regionCounts: Record<string, { id: string, name: string, count: number }> = {};
      
      trails.forEach(trail => {
        if (trail.region && trail.region.length > 0) {
          trail.region.forEach(regionName => {
            if (!regionName) return;
            
            const region = regionMap.get(regionName);
            if (region && region.id) {
              const regionId = region.id as string;
              if (!regionCounts[regionId]) {
                regionCounts[regionId] = { 
                  id: regionId, 
                  name: region.name || 'Unknown', 
                  count: 0 
                };
              }
              
              regionCounts[regionId].count++;
            }
          });
        }
      });
      
      stats.byRegion = Object.values(regionCounts).sort((a, b) => b.count - a.count);
      
      // Calculate difficulty statistics
      const difficultyCounts: Record<string, number> = {
        'easy': 0,
        'moderate': 0,
        'difficult': 0,
        'extreme': 0
      };
      
      trails.forEach(trail => {
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
      
      // Calculate length statistics
      stats.byLength = LENGTH_RANGES.map(range => {
        const count = trails.filter(trail => {
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
    } catch (error) {
      console.error('Error generating trail statistics:', error);
      return this.getMockStatistics();
    }
  },
  
  getMockStatistics(): TrailStatistics {
    const stats: TrailStatistics = {
      totalCount: mockTrails.length,
      byRegion: [],
      byDifficulty: [],
      byLength: [],
      totalDistance: 0
    };
    
    stats.totalDistance = mockTrails.reduce((total, trail) => total + trail.length, 0);
    
    const regionCounts: Record<string, { id: string, name: string, count: number }> = {};
    mockRegions.forEach(region => {
      regionCounts[region.id] = { id: region.id, name: region.name, count: 0 };
    });
    
    mockTrails.forEach(trail => {
      if (trail.region && trail.region.length > 0) {
        trail.region.forEach(regionName => {
          if (!regionName) return;
          
          const region = mockRegions.find(r => r.name === regionName);
          if (region && region.id) {
            const regionId = region.id as string;
            if (!regionCounts[regionId]) {
              regionCounts[regionId] = { 
                id: regionId, 
                name: region.name || 'Unknown', 
                count: 0 
              };
            }
            regionCounts[regionId].count++;
          }
        });
      }
    });
    
    stats.byRegion = Object.values(regionCounts);
    
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
  
  async getTrails(filters?: TrailFilters, options?: { 
    page?: number, 
    pageSize?: number
  }): Promise<{ trails: Trail[], totalCount: number }> {
    try {
      const defaultOptions = { page: 0, pageSize: 20 };
      const { page, pageSize } = { ...defaultOptions, ...options };
      
      console.log(`Fetching trails with page=${page}, pageSize=${pageSize}`);
      
      // Try to get trails from Supabase
      const { data, count, error } = await getTrailsFromSupabase({
        page,
        pageSize,
        filters: filters as any
      });
      
      if (!error && data && data.length > 0) {
        console.log(`Got ${data.length} trails from Supabase, total count: ${count}`);
        const trailIds = data.map(trail => trail.id);
        await attachRatingsToTrails(data, trailIds);
        
        return { 
          trails: data, 
          totalCount: count || 0 
        };
      }
      
      console.log('Falling back to DOC API or mock data for trails');
      
      // Fallback to DOC API if Supabase query fails or returns no data
      if (isApiKeyAvailable()) {
        try {
          // Store all trails in memory for pagination
          let allTrails: Trail[] = [];
          
          // Check if we already have the trails cached
          if (page === 0) {
            // Only fetch all trails on the first page request
            allTrails = await getAllTrails();
            
            // Sync trails to Supabase in the background for future requests
            syncTrailsToSupabase(allTrails);
          } else {
            // For subsequent pages, we need to get all trails first
            // This is inefficient but necessary since the DOC API doesn't support pagination
            allTrails = await getAllTrails();
          }
          
          // Apply filters
          let filteredTrails = allTrails;
          if (filters) {
            filteredTrails = filteredTrails.filter(trail => {
              if (filters.difficulty && filters.difficulty !== 'all' && 
                  trail.difficulty !== filters.difficulty) {
                return false;
              }
              
              if (filters.length) {
                const [min, max] = filters.length.split('-').map(Number);
                if (min && trail.length < min) return false;
                if (max && trail.length > max) return false;
              }
              
              if (filters.elevation) {
                const [min, max] = filters.elevation.split('-').map(Number);
                if (min && trail.elevationGain && trail.elevationGain < min) return false;
                if (max && trail.elevationGain && trail.elevationGain > max) return false;
              }
              
              if (filters.region && filters.region.trim() !== '' && trail.region) {
                return trail.region.some(r => 
                  r.toLowerCase().includes(filters.region!.toLowerCase())
                );
              }
              
              return true;
            });
          }
          
          const totalCount = filteredTrails.length;
          
          // Apply pagination
          const startIdx = page * pageSize;
          let pageTrails: Trail[] = [];
          
          if (startIdx < filteredTrails.length) {
            pageTrails = filteredTrails.slice(startIdx, Math.min(startIdx + pageSize, filteredTrails.length));
          }
          
          console.log(`Returning ${pageTrails.length} trails from DOC API, total count: ${totalCount}`);
          
          if (pageTrails.length > 0) {
            const trailIds = pageTrails.map(trail => trail.id);
            await attachRatingsToTrails(pageTrails, trailIds);
          }
          
          return { 
            trails: pageTrails, 
            totalCount 
          };
        } catch (error) {
          console.error('API request failed, using mock data:', error);
          return this.getMockTrails(filters, options);
        }
      } else {
        console.warn('API_KEY not found, using mock data');
        return this.getMockTrails(filters, options);
      }
    } catch (error) {
      console.error('Error fetching trails:', error);
      return { trails: [], totalCount: 0 };
    }
  },
  
  getMockTrails(filters?: TrailFilters, options?: { 
    page?: number, 
    pageSize?: number
  }): { trails: Trail[], totalCount: number } {
    const defaultOptions = { page: 0, pageSize: 20 };
    const { page, pageSize } = { ...defaultOptions, ...options };
    
    let filteredTrails = mockTrails;
    
    if (filters) {
      filteredTrails = filteredTrails.filter(trail => {
        if (filters.difficulty && filters.difficulty !== 'all' && 
            trail.difficulty !== filters.difficulty) {
          return false;
        }
        
        if (filters.length) {
          const [min, max] = filters.length.split('-').map(Number);
          if (min && trail.length < min) return false;
          if (max && trail.length > max) return false;
        }
        
        if (filters.elevation) {
          const [min, max] = filters.elevation.split('-').map(Number);
          if (min && trail.elevationGain && trail.elevationGain < min) return false;
          if (max && trail.elevationGain && trail.elevationGain > max) return false;
        }
        
        if (filters.region && filters.region.trim() !== '' && trail.region) {
          return trail.region.some(r => 
            r.toLowerCase().includes(filters.region!.toLowerCase())
          );
        }
        
        return true;
      });
    }
    
    const totalCount = filteredTrails.length;
    
    const startIdx = page * pageSize;
    let pageTrails: Trail[] = [];
    
    if (startIdx < filteredTrails.length) {
      pageTrails = filteredTrails.slice(startIdx, Math.min(startIdx + pageSize, filteredTrails.length));
    }
    
    return { 
      trails: pageTrails, 
      totalCount 
    };
  },
  
  async getTrailById(id: string): Promise<Trail> {
    try {
      // Try to get trail from Supabase
      const { data, error } = await getTrailByIdFromSupabase(id);
      
      if (!error && data) {
        // Get ratings for this trail
        const { data: ratings } = await getTrailRatings(id);
        if (ratings) {
          data.reviews = ratings;
        }
        
        return data;
      }
      
      // Fallback to DOC API
      if (isApiKeyAvailable()) {
        try {
          const trail = await getDocTrailById(id);
          
          if (trail) {
            // Get ratings for this trail
            const { data: ratings } = await getTrailRatings(id);
            if (ratings) {
              trail.reviews = ratings;
            }
            
            return trail;
          }
        } catch (error) {
          console.warn(`API request failed for trail ${id}, using mock data:`, error);
        }
      }
      
      // Fallback to mock data
      const trail = mockTrails.find(t => t.id === id);
      if (!trail) {
        throw new Error(`Trail with ID ${id} not found`);
      }
      return trail;
    } catch (error) {
      console.error(`Error fetching trail ${id}:`, error);
      throw error;
    }
  },
  
  async getTrailAlerts(id: string): Promise<any[]> {
    if (isApiKeyAvailable()) {
      try {
        return await getDocTrailAlerts(id);
      } catch (error) {
        console.warn(`API request failed for trail alerts for ${id}:`, error);
      }
    }
    return [];
  },
  
  async getRegions(): Promise<Region[]> {
    try {
      // Try to get regions from Supabase
      const { data, error } = await getRegionsFromSupabase();
      
      if (!error && data && data.length > 0) {
        return data;
      }
      
      console.log('Falling back to DOC API or mock data for regions');
      
      // Fallback to DOC API
      if (isApiKeyAvailable()) {
        try {
          const trails = await getAllTrails();
          
          const regionSet = new Set<string>();
          trails.forEach(trail => {
            if (trail.region) {
              trail.region.forEach(r => {
                if (r) regionSet.add(r);
              });
            }
          });
          
          return Array.from(regionSet).map((name, index) => ({
            id: `region-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            description: '',
            trailCount: trails.filter(t => t.region && t.region.includes(name)).length
          }));
        } catch (error) {
          console.warn('API request failed for regions, using mock data:', error);
        }
      }
      
      // Fallback to mock data
      return mockRegions;
    } catch (error) {
      console.error('Error fetching regions:', error);
      return mockRegions;
    }
  },
  
  async submitRating(
    trailId: string, 
    rating: number, 
    comment?: string,
    tips?: string,
    photos?: string[]
  ): Promise<boolean> {
    const { success } = await submitRatingToSupabase(
      trailId,
      rating,
      comment,
      tips,
      photos
    );
    
    return success;
  },
  
  async getTrailRatings(trailId: string): Promise<Review[]> {
    const { data } = await getTrailRatings(trailId);
    return data || [];
  }
};
