'use server';

import { createClient } from '@/utils/supabase/server';

// Tipe untuk aktivitas lari
export type RunningActivity = {
  id: number;
  activity_date: string;
  distance_km: number;
  run_type: string;
  duration_minutes: number;
  elevation_gain?: number;
  avg_pace?: string;
  steps?: number;
};

// Fungsi untuk mendapatkan data aktivitas lari berdasarkan runner_id
export async function getRunningActivities(
  runnerId: number,
  timeRange: 'week' | 'month' = 'week'
): Promise<{ data: RunningActivity[] | null; error: any }> {
  try {
    const supabase = await createClient();
    
    // Tentukan tanggal awal berdasarkan timeRange
    const now = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      // Set ke 7 hari yang lalu
      startDate.setDate(now.getDate() - 7);
    } else {
      // Set ke 30 hari yang lalu
      startDate.setDate(now.getDate() - 30);
    }
    
    // Query data dari Supabase
    const { data, error } = await supabase
      .from('running_activities')
      .select('*')
      .eq('runner_id', runnerId)
      .gte('activity_date', startDate.toISOString())
      .lte('activity_date', now.toISOString())
      .order('activity_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching running activities:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error };
  }
} 