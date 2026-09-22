/**
 * SIH NER Smart Logistics Platform - Supabase Client & Resilient Data Layer
 * 
 * Safely reads environment variables via import.meta.env without hardcoding.
 * If credentials are not set or connection fails, seamlessly falls back
 * to local simulated storage with clear DEMO DATA MODE labeling.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '';

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

/**
 * Fetch official user profile from Supabase profiles table
 */
export async function getProfile(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch profile from profiles table:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Profile fetch exception:', err);
    return null;
  }
}

/**
 * Upsert official user profile to Supabase profiles table
 */
export async function upsertProfile(profile) {
  if (!isSupabaseConfigured || !supabase || !profile?.id) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Could not upsert profile into profiles table:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Profile upsert exception:', err);
    return null;
  }
}
