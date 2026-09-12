/**
 * SIH NER Smart Logistics Platform - Supabase Client & Resilient Data Layer
 * 
 * Safely reads environment variables via import.meta.env without hardcoding.
 * If credentials are not set or connection fails, seamlessly falls back
 * to local simulated storage with clear DEMO DATA MODE labeling.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 10
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Resilient table fetch helper with graceful demo data fallback
 */
export async function fetchWithFallback(tableName, fallbackData) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: fallbackData,
      isDemoMode: true,
      source: 'DEMO DATA MODE'
    };
  }

  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error || !data || data.length === 0) {
      console.warn(`Supabase query for ${tableName} returned error or empty, using fallback:`, error);
      return {
        data: fallbackData,
        isDemoMode: true,
        source: 'DEMO DATA MODE (DB Empty)'
      };
    }
    return {
      data,
      isDemoMode: false,
      source: 'LIVE • SUPABASE'
    };
  } catch (err) {
    console.warn(`Supabase connection failed for ${tableName}, falling back to demo data:`, err);
    return {
      data: fallbackData,
      isDemoMode: true,
      source: 'DEMO DATA MODE'
    };
  }
}
