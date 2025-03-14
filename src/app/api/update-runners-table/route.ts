import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API route untuk menambahkan kolom description ke tabel runners dan mengupdate avg_pace
 * Hanya untuk penggunaan satu kali saat setup
 */
export async function GET() {
  try {
    // Cek apakah kolom description sudah ada
    const { data: columnExists, error: columnCheckError } = await supabase
      .from('runners')
      .select('description')
      .limit(1);

    // Jika kolom belum ada, tambahkan kolom description
    if (columnCheckError && columnCheckError.message.includes('column "description" does not exist')) {
      // Tambahkan kolom description
      const { error: alterTableError } = await supabase.rpc('add_description_column');
      
      if (alterTableError) {
        console.error('Error adding description column:', alterTableError);
        return NextResponse.json({ error: alterTableError.message }, { status: 500 });
      }
    }

    // Update semua runner dengan description default dan avg_pace jika belum ada
    const { data: runners, error: runnersError } = await supabase
      .from('runners')
      .select('id, name');
    
    if (runnersError) {
      console.error('Error fetching runners:', runnersError);
      return NextResponse.json({ error: runnersError.message }, { status: 500 });
    }

    // Update setiap runner
    const updatePromises = runners.map(async (runner) => {
      // Generate description berdasarkan nama
      const description = `${runner.name} adalah pelari berdedikasi yang selalu berusaha meningkatkan catatan pribadi dan menikmati perjalanan lari.`;
      
      // Generate avg_pace random antara 4:30 - 6:30
      const minutes = Math.floor(Math.random() * 2) + 4; // 4 atau 5
      const seconds = Math.floor(Math.random() * 60); // 0-59
      const avg_pace = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      
      // Update runner
      const { error: updateError } = await supabase
        .from('runners')
        .update({ 
          description, 
          avg_pace 
        })
        .eq('id', runner.id);
      
      if (updateError) {
        console.error(`Error updating runner ${runner.id}:`, updateError);
        return { id: runner.id, success: false, error: updateError.message };
      }
      
      return { id: runner.id, success: true };
    });
    
    const results = await Promise.all(updatePromises);
    
    return NextResponse.json({ 
      message: 'Runners table updated successfully', 
      results 
    });
    
  } catch (error: any) {
    console.error('Error updating runners table:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 