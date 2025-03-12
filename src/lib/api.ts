import { supabase } from './supabase';
import { RunType, ActivityTime } from '../types';

export type Runner = {
  id: string;
  name: string;
  profilePic: string;
  totalKm: number;
  crew: string;
  rank?: number;
  runType: RunType;
  activityTime: ActivityTime;
  avgPace?: number;
};

export type CrewData = {
  id: string;
  name: string;
  logo_url: string;
  description?: string;
};

// Fungsi untuk mengambil data runners dari Supabase
export async function getRunners(filter: 'weekly' | 'monthly' | 'all-time' = 'weekly') {
  try {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Attempting to fetch runners with filter:', filter);
    
    // Cek koneksi Supabase
    const { data: healthCheck, error: healthError } = await supabase.from('runners').select('count');
    if (healthError) {
      console.error('Supabase connection error:', healthError);
      return [];
    }
    
    console.log('Supabase connection successful, health check:', healthCheck);
    
    // Mengambil data dari tabel runners dengan join ke tabel crews
    const { data, error } = await supabase
      .from('runners')
      .select(`
        id,
        name,
        profile_photo,
        total_km,
        run_type,
        activity_time,
        avg_pace,
        crew_id,
        crews (
          id,
          name
        )
      `)
      .order('total_km', { ascending: false });

    if (error) {
      console.error('Error fetching runners:', error);
      return [];
    }

    console.log('Raw data from Supabase:', data);

    // Transformasi data dari format Supabase ke format yang digunakan aplikasi
    const runners: Runner[] = data.map((runner: any) => ({
      id: runner.id.toString(),
      name: runner.name || 'Unknown Runner',
      // Pastikan URL gambar tidak kosong, gunakan gambar default jika kosong
      profilePic: runner.profile_photo && runner.profile_photo.trim() !== '' 
        ? runner.profile_photo 
        : `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
      totalKm: runner.total_km || 0,
      crew: runner.crews?.name || 'No Crew',
      runType: (runner.run_type as RunType) || 'Easy Run',
      activityTime: (runner.activity_time as ActivityTime) || 'Early Bird',
      avgPace: runner.avg_pace || null,
    }));

    console.log('Transformed runners data:', runners);
    return runners;
  } catch (error) {
    console.error('Error in getRunners:', error);
    return [];
  }
}

// Fungsi untuk mengambil data crews dari Supabase
export async function getCrews() {
  try {
    const { data, error } = await supabase
      .from('crews')
      .select('*');

    if (error) {
      console.error('Error fetching crews:', error);
      return [];
    }

    return data as CrewData[];
  } catch (error) {
    console.error('Error in getCrews:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan logo crew
export function getCrewLogo(crewName: string) {
  switch (crewName) {
    case "Hummingbird":
      return "https://api.dicebear.com/7.x/shapes/svg?seed=hummingbird&backgroundColor=amber";
    case "Skeleton":
      return "https://api.dicebear.com/7.x/shapes/svg?seed=skeleton&backgroundColor=red";
    case "Speed Demons":
      return "https://api.dicebear.com/7.x/shapes/svg?seed=demons&backgroundColor=purple";
    case "Road Warriors":
      return "https://api.dicebear.com/7.x/shapes/svg?seed=warriors&backgroundColor=blue";
    default:
      return "https://api.dicebear.com/7.x/shapes/svg?seed=default";
  }
} 