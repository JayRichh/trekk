/**
 * Utility functions for handling images in the application
 */

/**
 * Generates a Lorem Picsum URL for placeholders with consistent seeds based on trail IDs
 * 
 * @param id - Trail ID or any unique identifier to use as seed
 * @param width - Image width in pixels
 * @param height - Image height in pixels (if not provided, will create a square image)
 * @param options - Additional options like grayscale, blur, etc.
 * @returns Formatted Lorem Picsum URL
 */
export function getTrailImageUrl(
  id: string, 
  width: number,
  height?: number,
  options?: {
    grayscale?: boolean;
    blur?: number;
    random?: boolean;
  }
): string {
  // Use trail ID as seed for consistent images per trail
  let url = `https://picsum.photos/seed/${id.substring(0, 8)}`;
  
  // Add dimensions
  if (height) {
    url += `/${width}/${height}`;
  } else {
    url += `/${width}`;
  }
  
  // Add options as query parameters if provided
  const queryParams: string[] = [];
  
  if (options?.grayscale) {
    queryParams.push('grayscale');
  }
  
  if (options?.blur && options.blur >= 1 && options.blur <= 10) {
    queryParams.push(`blur=${options.blur}`);
  }
  
  // Add random parameter to prevent caching if needed
  if (options?.random) {
    queryParams.push(`random=${Math.floor(Math.random() * 1000)}`);
  }
  
  // Append query parameters to URL
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  return url;
}

/**
 * Fallback function for when a trail image URL is missing or invalid
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Generic placeholder URL
 */
export function getDefaultTrailImage(width: number, height: number = width): string {
  // Use a generic hiking/nature image seed
  return `https://picsum.photos/seed/trail/${width}/${height}`;
}
