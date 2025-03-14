import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API route untuk menambahkan kolom description ke tabel runners dan mengupdate avg_pace
 * Pendekatan yang lebih sederhana dengan menggunakan SQL langsung
 */
export async function GET() {
  try {
    // 1. Cek apakah kolom description sudah ada
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'runners')
      .eq('column_name', 'description');
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return NextResponse.json({ error: columnsError.message }, { status: 500 });
    }
    
    // 2. Jika kolom description belum ada, tambahkan
    if (!columns || columns.length === 0) {
      // Tambahkan kolom description
      const { error: alterError } = await supabase
        .rpc('execute_sql', { 
          sql_query: 'ALTER TABLE runners ADD COLUMN IF NOT EXISTS description TEXT' 
        });
      
      if (alterError) {
        console.error('Error adding description column:', alterError);
        return NextResponse.json({ 
          error: 'Tidak dapat menambahkan kolom description. Silakan tambahkan secara manual melalui Supabase dashboard.',
          details: alterError.message 
        }, { status: 500 });
      }
    }
    
    // 3. Update semua runner dengan description default dan avg_pace jika belum ada
    const { data: runners, error: runnersError } = await supabase
      .from('runners')
      .select('id, name, avg_pace, description');
    
    if (runnersError) {
      console.error('Error fetching runners:', runnersError);
      return NextResponse.json({ error: runnersError.message }, { status: 500 });
    }
    
    // 4. Update setiap runner
    const updateResults = [];
    
    for (const runner of runners) {
      // Hanya update jika avg_pace atau description belum ada
      if (runner.avg_pace === null || !runner.description) {
        // Generate description berdasarkan nama jika belum ada
        const description = runner.description || 
          `${runner.name} adalah pelari berdedikasi yang selalu berusaha meningkatkan catatan pribadi dan menikmati perjalanan lari.`;
        
        // Generate avg_pace random antara 4:30 - 6:30 jika belum ada
        let avg_pace = runner.avg_pace;
        if (avg_pace === null) {
          const minutes = Math.floor(Math.random() * 2) + 4; // 4 atau 5
          const seconds = Math.floor(Math.random() * 60); // 0-59
          avg_pace = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
        
        // Update runner
        const { error: updateError } = await supabase
          .from('runners')
          .update({ description, avg_pace })
          .eq('id', runner.id);
        
        updateResults.push({
          id: runner.id,
          success: !updateError,
          error: updateError ? updateError.message : null
        });
      } else {
        updateResults.push({
          id: runner.id,
          success: true,
          message: 'Tidak perlu diupdate'
        });
      }
    }
    
    return NextResponse.json({ 
      message: 'Database berhasil diupdate', 
      results: updateResults 
    });
    
  } catch (error: any) {
    console.error('Error updating database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 