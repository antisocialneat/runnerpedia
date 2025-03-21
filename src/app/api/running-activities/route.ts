import { NextRequest, NextResponse } from 'next/server';
import { getRunningActivities } from '@/app/actions/runningData';

// API endpoint untuk mendapatkan data aktivitas lari
export async function GET(request: NextRequest) {
  try {
    // Ambil parameter dari query
    const searchParams = request.nextUrl.searchParams;
    const runnerId = searchParams.get('runnerId');
    const timeRange = searchParams.get('timeRange') as 'week' | 'month' || 'week';
    
    // Validasi parameter
    if (!runnerId) {
      return NextResponse.json(
        { error: { message: 'Parameter runnerId diperlukan' } },
        { status: 400 }
      );
    }
    
    // Panggil fungsi server action untuk mendapatkan data
    const { data, error } = await getRunningActivities(
      parseInt(runnerId, 10),
      timeRange
    );
    
    // Error handling
    if (error) {
      console.error('Error fetching running activities:', error);
      return NextResponse.json(
        { error: { message: error.message || 'Terjadi kesalahan saat mengambil data' } },
        { status: 500 }
      );
    }
    
    // Kembalikan data dalam format JSON
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      { error: { message: error.message || 'Terjadi kesalahan tak terduga' } },
      { status: 500 }
    );
  }
} 