-- Script untuk menambahkan kolom description ke tabel runners dan mengupdate avg_pace
-- Jalankan script ini di Supabase SQL Editor

-- 1. Tambahkan kolom description jika belum ada
ALTER TABLE runners ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Update semua runner yang belum memiliki description
UPDATE runners
SET description = name || ' adalah pelari berdedikasi yang selalu berusaha meningkatkan catatan pribadi dan menikmati perjalanan lari.'
WHERE description IS NULL;

-- 3. Update semua runner yang belum memiliki avg_pace
-- Kita akan menggunakan format string untuk avg_pace (misalnya '4:35')
-- Karena ini adalah contoh, kita akan menggunakan nilai acak antara 4:00 - 5:59

-- Fungsi untuk menghasilkan avg_pace acak
CREATE OR REPLACE FUNCTION random_pace() RETURNS TEXT AS $$
DECLARE
  minutes INTEGER;
  seconds INTEGER;
BEGIN
  -- Menghasilkan angka acak antara 4-5 untuk menit
  minutes := floor(random() * 2 + 4);
  
  -- Menghasilkan angka acak antara 0-59 untuk detik
  seconds := floor(random() * 60);
  
  -- Format menjadi string 'M:SS'
  RETURN minutes || ':' || LPAD(seconds::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Update avg_pace untuk semua runner yang belum memiliki nilai
UPDATE runners
SET avg_pace = random_pace()
WHERE avg_pace IS NULL;

-- Hapus fungsi temporary
DROP FUNCTION IF EXISTS random_pace();

-- Tampilkan hasil
SELECT id, name, avg_pace, description FROM runners; 