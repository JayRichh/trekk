// Helper functions for handling Mapbox tokens safely

/**
 * Gets the Mapbox token from environment variables
 * @returns The Mapbox token for API calls
 */
export function getMapboxToken(): string {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  
  if (!token) {
    console.warn('Mapbox token not found in environment variables');
    // Return a placeholder or empty string
    return '';
  }
  
  return token;
}

/**
 * Validates if the Mapbox token exists and is properly formatted
 * @returns Boolean indicating if token is valid
 */
export function hasValidMapboxToken(): boolean {
  const token = getMapboxToken();
  return Boolean(token && token.startsWith('pk.'));
}

/**
 * Returns a safe URL for mapbox resources that requires token
 * @param style The mapbox style URL
 * @returns URL with token appended
 */
export function getMapboxStyleUrl(style: string): string {
  const token = getMapboxToken();
  return `${style}?access_token=${token}`;
}

/**
 * Gets a public URL for a mapbox style
 * This is useful when you need to include the URL in HTML directly
 * @param styleId The style ID (e.g. 'mapbox/outdoors-v11')
 * @returns Complete style URL with token
 */
export function getMapboxPublicStyleUrl(styleId: string): string {
  const token = getMapboxToken();
  return `https://api.mapbox.com/styles/v1/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`;
}
