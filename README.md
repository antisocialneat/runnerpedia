# RunnerPedia

RunnerPedia adalah aplikasi web untuk pelari yang menampilkan leaderboard, acara lari, dan profil pelari. Aplikasi ini dibangun dengan Next.js dan Tailwind CSS v4.

## Fitur

- **Leaderboard**: Menampilkan peringkat pelari berdasarkan jarak tempuh dalam kilometer
- **Podium**: Menampilkan 3 pelari teratas dengan tampilan podium yang menarik
- **Filter**: Filter leaderboard berdasarkan periode waktu (mingguan, bulanan, sepanjang masa)
- **Acara**: Melihat acara lari yang akan datang dan yang telah berlalu
- **Profil**: Melihat profil pelari dengan statistik lari

## Teknologi

- Next.js 15
- Tailwind CSS v4
- NextAuth.js untuk autentikasi Google
- TypeScript

## Cara Menjalankan

1. Clone repositori ini
2. Install dependensi dengan `npm install`
3. Buat file `.env.local` dengan kredensial Google OAuth:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```
4. Jalankan server pengembangan dengan `npm run dev`
5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

## Struktur Proyek

- `/src/app`: Komponen dan halaman utama
- `/src/app/components`: Komponen yang dapat digunakan kembali
- `/src/app/api`: API routes termasuk autentikasi
- `/src/types`: Tipe TypeScript

## Pengembangan Selanjutnya

- Implementasi backend untuk menyimpan data pelari
- Fitur sosial untuk berinteraksi dengan pelari lain
- Integrasi dengan aplikasi pelacakan lari
- Versi desktop yang lebih lengkap
