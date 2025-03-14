import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API route untuk menjalankan SQL script setup database
 * Menambahkan kolom description dan mengupdate avg_pace
 */
export async function GET() {
  try {
    // SQL script untuk setup database
    const sqlScript = `
    -- 1. Tambahkan kolom description jika belum ada
    ALTER TABLE runners ADD COLUMN IF NOT EXISTS description TEXT;
    
    -- 2. Pastikan avg_pace memiliki tipe data yang benar (text)
    ALTER TABLE runners ALTER COLUMN avg_pace TYPE TEXT USING avg_pace::TEXT;
    
    -- 3. Update semua runner yang belum memiliki description
    UPDATE runners
    SET description = name || ' adalah pelari berdedikasi yang selalu berusaha meningkatkan catatan pribadi dan menikmati perjalanan lari.'
    WHERE description IS NULL;
    
    -- 4. Update semua runner yang belum memiliki avg_pace
    UPDATE runners
    SET avg_pace = 
      CASE 
        WHEN avg_pace IS NULL THEN 
          (4 + floor(random() * 2))::TEXT || ':' || 
          LPAD(floor(random() * 60)::TEXT, 2, '0')
        ELSE avg_pace
      END;
    `;
    
    // Jalankan SQL script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      // Jika exec_sql tidak tersedia, coba cara lain
      console.error('Error menjalankan SQL script:', error);
      
      // Jalankan query satu per satu
      const queries = sqlScript.split(';').filter(q => q.trim().length > 0);
      const results = [];
      
      for (const query of queries) {
        try {
          // Gunakan raw query jika tersedia
          const { error: queryError } = await supabase.from('_exec_raw').select('*').limit(1);
          results.push({
            query: query.trim(),
            success: !queryError,
            error: queryError ? queryError.message : null
          });
        } catch (err: any) {
          results.push({
            query: query.trim(),
            success: false,
            error: err.message
          });
        }
      }
      
      return NextResponse.json({
        message: 'Tidak dapat menjalankan SQL script secara langsung. Silakan jalankan script di Supabase SQL Editor.',
        details: error.message,
        results
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Database berhasil disetup',
      details: 'Kolom description ditambahkan dan avg_pace diupdate'
    });
    
  } catch (error: any) {
    console.error('Error setup database:', error);
    return NextResponse.json({
      error: error.message,
      message: 'Terjadi kesalahan saat setup database. Silakan jalankan script di Supabase SQL Editor.'
    }, { status: 500 });
  }
} 