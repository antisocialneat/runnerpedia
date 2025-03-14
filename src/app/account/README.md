# Halaman Akun Runner

Halaman ini menampilkan profil runner dengan data dari Supabase, termasuk:
- Foto profil
- Nama
- Tipe lari (run_type) dan waktu aktivitas (activity_time)
- Statistik: umur, total kilometer, dan rata-rata pace
- Deskripsi runner
- Berita terbaru

## Implementasi

Halaman ini menggunakan:
- Next.js dengan Server-Side Rendering (SSR)
- TailwindCSS v4 untuk styling
- Supabase untuk mengambil data runner
- Heroicons untuk ikon

## Data yang Dibutuhkan

Halaman ini membutuhkan data dari tabel `runners` di Supabase dengan kolom:
- `id`: ID unik runner
- `name`: Nama runner
- `profile_photo`: URL foto profil
- `age`: Umur runner
- `run_type`: Tipe lari (misalnya "Endurance", "Sprint", dll)
- `activity_time`: Waktu aktivitas (misalnya "Early Bird", "Night Owl", dll)
- `total_km`: Total jarak lari dalam kilometer
- `avg_pace`: Rata-rata pace dalam format "M:SS" (misalnya "4:35")
- `description`: Deskripsi tentang runner
- `crew_id`: ID crew yang diikuti runner

Juga membutuhkan data dari tabel `crews` dengan kolom:
- `id`: ID unik crew
- `name`: Nama crew
- `logo_url`: URL logo crew
- `description`: Deskripsi crew

## Cara Menambahkan Kolom yang Belum Ada

Jika kolom `description` atau `avg_pace` belum ada di tabel `runners`, jalankan SQL script yang ada di README utama di Supabase SQL Editor.

## Komponen Utama

1. **Header**: Menampilkan foto profil, nama, dan tipe lari
2. **Stats Cards**: Menampilkan umur, total kilometer, dan rata-rata pace
3. **Social Links**: Tombol untuk media sosial
4. **About Section**: Menampilkan deskripsi runner
5. **Latest News**: Menampilkan berita terbaru tentang runner

## Pengembangan Selanjutnya

- Menambahkan fitur edit profil
- Menampilkan riwayat lari
- Integrasi dengan media sosial
- Menampilkan badge dan pencapaian 