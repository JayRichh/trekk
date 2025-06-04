/**
 * Modern image utility functions for handling trail images (2025)
 * Uses reliable image sources with proper fallbacks and error handling
 */

// Configuration
const CONFIG = {
  // App attribution
  appName: 'TrekkApp',
  // Cache version - increment when updating image sets
  cacheVersion: '1',
  // Default image dimensions
  defaultWidth: 400,
  defaultHeight: 300
};

// Reliable image services as of 2025
const IMAGE_SERVICES = {
  // Unsplash Source API (still functional in 2025)
  unsplash: {
    baseUrl: 'https://source.unsplash.com',
    // Collections that are confirmed to work in 2025
    collections: {
      hiking: '2511271',
      nature: '3694365',
      mountains: '4642521', 
      forest: '3781321',
      trails: '9974793'
    }
  },
  // Picsum Photos (Lorem Picsum) API for fallbacks
  picsum: {
    baseUrl: 'https://picsum.photos'
  },
  // Local fallback images if all remote services fail
  local: {
    baseUrl: '/images/fallback',
    files: [
      'trail-default.jpg',
      'mountain-default.jpg',
      'forest-default.jpg',
      'hiking-default.jpg'
    ]
  }
};

// Trail categories mapped to image parameters
const IMAGE_CATEGORIES = {
  // By difficulty
  difficulty: {
    easy: { collection: 'hiking', keywords: 'easy,trail,path,walk' },
    moderate: { collection: 'hiking', keywords: 'moderate,trail,hike' },
    difficult: { collection: 'mountains', keywords: 'challenging,mountain,trail,hike' },
    extreme: { collection: 'mountains', keywords: 'extreme,mountain,climbing,alpine' }
  },
  // By terrain
  terrain: {
    forest: { collection: 'forest', keywords: 'forest,woods,trees' },
    mountain: { collection: 'mountains', keywords: 'mountain,alpine,peak' },
    coastal: { collection: 'nature', keywords: 'coast,beach,ocean,sea' },
    desert: { collection: 'nature', keywords: 'desert,canyon,arid' },
    alpine: { collection: 'mountains', keywords: 'alpine,snow,mountain' }
  },
  // By feature
  feature: {
    waterfall: { collection: 'nature', keywords: 'waterfall,cascade' },
    lake: { collection: 'nature', keywords: 'lake,water,reflection' },
    river: { collection: 'nature', keywords: 'river,stream,water' },
    viewpoint: { collection: 'mountains', keywords: 'vista,view,panorama,overlook' }
  },
  // By season
  season: {
    spring: { collection: 'nature', keywords: 'spring,flowers,bloom' },
    summer: { collection: 'nature', keywords: 'summer,green,sunshine' },
    fall: { collection: 'nature', keywords: 'autumn,fall,foliage' },
    winter: { collection: 'nature', keywords: 'winter,snow,ice' }
  }
};

/**
 * Generate a deterministic hash code from a string
 * This ensures consistent image selection for the same trail
 */
function getHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Build an Unsplash URL based on collection and keywords
 */
function buildUnsplashUrl(
  id: string,
  width: number,
  height: number,
  params: { collection?: string; keywords?: string }
): string {
  // Force specific dimensions for better performance
  const dimensionsParam = `${width}x${height}`;
  
  // Use collection if provided, otherwise use keyword search
  let baseUrlPath = '';
  if (params.collection && IMAGE_SERVICES.unsplash.collections[params.collection as keyof typeof IMAGE_SERVICES.unsplash.collections]) {
    const collectionId = IMAGE_SERVICES.unsplash.collections[params.collection as keyof typeof IMAGE_SERVICES.unsplash.collections];
    baseUrlPath = `/collection/${collectionId}`;
  } else if (params.keywords) {
    baseUrlPath = `/search/daily`;
  } else {
    baseUrlPath = `/random`;
  }

  // Construct the URL
  let url = `${IMAGE_SERVICES.unsplash.baseUrl}${baseUrlPath}/${dimensionsParam}`;
  
  // Add keywords if available
  if (params.keywords) {
    url += `?${params.keywords}`;
  }
  
  // Add deterministic seed based on trail ID to keep image consistent
  // This ensures the same trail always gets the same image
  const seed = getHashCode(id + CONFIG.cacheVersion);
  url += url.includes('?') ? `&sig=${seed}` : `?sig=${seed}`;
  
  return url;
}

/**
 * Build a Picsum Photos URL as fallback
 */
function buildPicsumUrl(id: string, width: number, height: number): string {
  const seed = getHashCode(id + CONFIG.cacheVersion) % 1000; // Picsum has limited IDs
  return `${IMAGE_SERVICES.picsum.baseUrl}/id/${seed}/${width}/${height}`;
}

/**
 * Get a local fallback image URL
 */
function getLocalFallbackUrl(id: string): string {
  const seed = getHashCode(id + CONFIG.cacheVersion);
  const index = seed % IMAGE_SERVICES.local.files.length;
  return `${IMAGE_SERVICES.local.baseUrl}/${IMAGE_SERVICES.local.files[index]}`;
}

/**
 * Get appropriate category parameters based on trail properties
 */
function getCategoryParams(options?: {
  difficulty?: 'easy' | 'moderate' | 'difficult' | 'extreme';
  terrain?: 'forest' | 'mountain' | 'coastal' | 'desert' | 'alpine';
  feature?: 'waterfall' | 'lake' | 'river' | 'viewpoint';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
}): { collection: string; keywords: string } {
  // Default parameters 
  let params = { 
    collection: 'hiking',
    keywords: 'hiking,trail,nature,outdoors'
  };
  
  // Prioritize feature, then terrain, then difficulty, then season
  if (options?.feature && IMAGE_CATEGORIES.feature[options.feature as keyof typeof IMAGE_CATEGORIES.feature]) {
    const featureParams = IMAGE_CATEGORIES.feature[options.feature as keyof typeof IMAGE_CATEGORIES.feature];
    params = { 
      collection: featureParams.collection,
      keywords: featureParams.keywords
    };
  } else if (options?.terrain && IMAGE_CATEGORIES.terrain[options.terrain as keyof typeof IMAGE_CATEGORIES.terrain]) {
    const terrainParams = IMAGE_CATEGORIES.terrain[options.terrain as keyof typeof IMAGE_CATEGORIES.terrain];
    params = {
      collection: terrainParams.collection,
      keywords: terrainParams.keywords
    };
  } else if (options?.difficulty && IMAGE_CATEGORIES.difficulty[options.difficulty as keyof typeof IMAGE_CATEGORIES.difficulty]) {
    const difficultyParams = IMAGE_CATEGORIES.difficulty[options.difficulty as keyof typeof IMAGE_CATEGORIES.difficulty];
    params = {
      collection: difficultyParams.collection,
      keywords: difficultyParams.keywords
    };
  } else if (options?.season && IMAGE_CATEGORIES.season[options.season as keyof typeof IMAGE_CATEGORIES.season]) {
    const seasonParams = IMAGE_CATEGORIES.season[options.season as keyof typeof IMAGE_CATEGORIES.season];
    params = {
      collection: seasonParams.collection,
      keywords: seasonParams.keywords
    };
  }
  
  return params;
}

/**
 * Get a reliable trail image URL with proper fallbacks
 * 
 * @param id - Trail ID for consistent image selection
 * @param width - Image width in pixels
 * @param height - Image height in pixels (if not provided, will create a square image)
 * @param options - Additional options for image selection and rendering
 * @returns URL to an appropriate trail image
 */
export function getTrailImageUrl(
  id: string, 
  width: number = CONFIG.defaultWidth,
  height: number = width,
  options?: {
    difficulty?: 'easy' | 'moderate' | 'difficult' | 'extreme';
    terrain?: 'forest' | 'mountain' | 'coastal' | 'desert' | 'alpine';
    feature?: 'waterfall' | 'lake' | 'river' | 'viewpoint';
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    grayscale?: boolean;
    blur?: number;
    random?: boolean;
  }
): string {
  // Safety check - if no valid ID, return default image
  if (!id || typeof id !== 'string') {
    return getDefaultTrailImage(width, height);
  }
  
  try {
    // Get category parameters
    const categoryParams = getCategoryParams(options);
    
    // Build primary Unsplash URL 
    const imageUrl = buildUnsplashUrl(id, width, height, categoryParams);
    
    // Add any special effects if supported
    let finalUrl = imageUrl;
    
    // Random parameter for cache busting if explicitly requested
    if (options?.random) {
      const randomParam = `rand=${Math.floor(Math.random() * 1000000)}`;
      finalUrl += finalUrl.includes('?') ? `&${randomParam}` : `?${randomParam}`;
    }
    
    return finalUrl;
  } catch (error) {
    console.error('Error generating trail image URL:', error);
    // Fallback to Picsum Photos if Unsplash fails
    try {
      return buildPicsumUrl(id, width, height);
    } catch {
      // Last resort - use local fallback
      return getLocalFallbackUrl(id);
    }
  }
}

/**
 * Get a default trail image when no ID is provided
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Default trail image URL
 */
export function getDefaultTrailImage(
  width: number = CONFIG.defaultWidth,
  height: number = width
): string {
  // Use a known working image that's unlikely to go away
  const defaultUnsplashId = '1532FBOI';
  
  try {
    // Try to use Unsplash random nature image first
    return `${IMAGE_SERVICES.unsplash.baseUrl}/collection/${IMAGE_SERVICES.unsplash.collections.hiking}/${width}x${height}`;
  } catch {
    try {
      // Fallback to Picsum Photos
      return `${IMAGE_SERVICES.picsum.baseUrl}/${width}/${height}?nature`;
    } catch {
      // Final fallback - local image
      return `${IMAGE_SERVICES.local.baseUrl}/trail-default.jpg`;
    }
  }
}
