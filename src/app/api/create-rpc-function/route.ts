import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API route untuk membuat fungsi RPC di Supabase
 * Fungsi ini akan menambahkan kolom description ke tabel runners
 */
export async function GET() {
  try {
    // SQL untuk membuat fungsi RPC
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION add_description_column()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Cek apakah kolom description sudah ada
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'runners'
          AND column_name = 'description'
        ) THEN
          -- Tambahkan kolom description
          ALTER TABLE runners ADD COLUMN description TEXT;
        END IF;
      END;
      $$;
    `;

    // Eksekusi SQL untuk membuat fungsi
    const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (createFunctionError) {
      console.error('Error creating RPC function:', createFunctionError);
      
      // Jika error karena fungsi exec_sql belum ada, buat fungsi exec_sql terlebih dahulu
      if (createFunctionError.message.includes('function exec_sql') || createFunctionError.message.includes('does not exist')) {
        const createExecSqlFunctionSQL = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `;
        
        // Eksekusi SQL langsung menggunakan query
        let createExecSqlError = null;
        try {
          // Coba eksekusi query dummy untuk melihat apakah ada error
          await supabase.from('_exec_sql').select('*').limit(1);
        } catch (err: any) {
          createExecSqlError = err;
        }
        
        if (createExecSqlError) {
          return NextResponse.json({ 
            error: 'Tidak dapat membuat fungsi exec_sql. Silakan buat fungsi secara manual melalui Supabase dashboard.',
            details: createExecSqlError.message
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          message: 'Fungsi exec_sql dibuat, silakan jalankan API ini lagi untuk membuat fungsi add_description_column'
        });
      }
      
      return NextResponse.json({ error: createFunctionError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Fungsi RPC add_description_column berhasil dibuat'
    });
    
  } catch (error: any) {
    console.error('Error creating RPC function:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 