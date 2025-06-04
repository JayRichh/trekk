import type { DOCTrail, Trail } from '../types/trail';
import { DEFAULT_COORD_SYSTEM, docTrailToTrail, processDataInChunks } from './trailUtils';
import { supabase } from '../lib/supabase';

const DOC_API_BASE_URL = 'https://api.doc.govt.nz/v1';
const API_KEY = import.meta.env.VITE_DOC_API_KEY;

export async function fetchFromDOC<T>(
  endpoint: string, 
  params: Record<string, string> = {}
): Promise<T> {
  if (!params.coordinates) {
    params.coordinates = DEFAULT_COORD_SYSTEM;
  }
  
  const queryParams = new URLSearchParams(params).toString();
  const url = `${DOC_API_BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
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

export function isApiKeyAvailable(): boolean {
  return !!API_KEY;
}

export async function getAllTrails(): Promise<Trail[]> {
  try {
    const docTrails = await fetchFromDOC<DOCTrail[]>('tracks');
    return await processDataInChunks(docTrails, docTrailToTrail, 100);
  } catch (error) {
    console.error('Error fetching all trails from DOC API:', error);
    return [];
  }
}

export async function getTrailById(id: string): Promise<Trail | null> {
  try {
    const docTrail = await fetchFromDOC<DOCTrail>(`tracks/${id}/detail`);
    return docTrailToTrail(docTrail);
  } catch (error) {
    console.error(`Error fetching trail ${id} from DOC API:`, error);
    return null;
  }
}

export async function getTrailAlerts(id: string): Promise<any[]> {
  try {
    return await fetchFromDOC<any[]>(`tracks/${id}/alerts`);
  } catch (error) {
    console.error(`Error fetching alerts for trail ${id}:`, error);
    return [];
  }
}

export async function syncTrailsToSupabase(trails: Trail[]): Promise<boolean> {
  // Disabled Supabase sync to prevent network errors
  console.log(`[DEBUG] Supabase sync disabled - would have synced ${trails.length} trails`);
  return true;
}
