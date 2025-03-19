"use client";

import Image from "next/image";
import ProfilePhoto from "../../../assets/raka-profile-photo.png";
import InstagramLogo from "../../../assets/instagram-logo.png";
import StravaLogo from "../../../assets/logo-strava.png";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeftIcon, ShareIcon } from "@heroicons/react/24/outline";
import { Poppins } from "next/font/google";
import RunningActivityChart from "../components/ui/LineChart";

// Konfigurasi font Poppins
const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

// Tipe data untuk runner
type Runner = {
    id: string;
    name: string;
    profile_photo: string;
    age: string;
    run_type: string;
    activity_time: string;
    total_km: number;
    avg_pace: string | null;
    description: string | null;
    crew_id: string;
    crew_name?: string;
    crew_logo?: string;
};

export default function AccountPage() {
    // State untuk menyimpan data runner
    const [runner, setRunner] = useState<Runner | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi untuk mengambil data runner dari Supabase
    useEffect(() => {
        async function fetchRunnerData() {
            try {
                setLoading(true);
                console.log("Mengambil data runner...");

                // Mengambil data runner (untuk contoh kita ambil runner pertama)
                const { data: runnerData, error: runnerError } = await supabase
                    .from('runners')
                    .select('*')
                    .limit(1)
                    .single();

                if (runnerError) {
                    console.error("Error mengambil data runner:", runnerError);
                    throw runnerError;
                }

                console.log("Data runner berhasil diambil:", runnerData);

                // Mengambil data crew jika crew_id ada
                if (runnerData.crew_id) {
                    console.log("Mengambil data crew dengan ID:", runnerData.crew_id);

                    // Ubah query untuk tidak menggunakan .single() dan tangani hasilnya dengan benar
                    const { data: crewData, error: crewError } = await supabase
                        .from('crews')
                        .select('name, logo_url, description')
                        .eq('id', runnerData.crew_id);

                    if (crewError) {
                        console.error("Error mengambil data crew:", crewError);
                        // Tidak throw error, hanya log saja
                    } else if (crewData && crewData.length > 0) {
                        // Menggabungkan data runner dengan data crew jika ditemukan
                        console.log("Data crew berhasil diambil:", crewData[0]);
                        runnerData.crew_name = crewData[0].name;
                        runnerData.crew_logo = crewData[0].logo_url;
                    } else {
                        console.log("Crew tidak ditemukan");
                    }
                }

                // Jika avg_pace belum ada, kita set default
                if (runnerData.avg_pace === null) {
                    runnerData.avg_pace = "5:30";
                }

                // Jika description belum ada, kita set default
                if (!runnerData.description) {
                    runnerData.description = "Passionate runner dedicated to improving personal records and enjoying the journey.";
                }

                setRunner(runnerData);
            } catch (error: any) {
                console.error("Error fetching runner data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchRunnerData();
    }, []);

    // Tampilan loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex items-center justify-center">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    // Tampilan error
    if (error || !runner) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex items-center justify-center">
                <p className="text-white text-xl">Error: {error || "Data tidak ditemukan"}</p>
            </div>
        );
    }

    // Tambahkan fallback untuk gambar profil
    const profilePhoto = runner.profile_photo || "/assets/raka-profile-photo.png";

    // Ambil hanya 4 huruf pertama dari nama runner jika nama terlalu panjang
    const displayName = runner.name ? (runner.name.length > 4 ? runner.name.substring(0, 4) : runner.name) : "Runner";

    return (
        <div className={`min-h-screen bg-black relative overflow-hidden max-w-md mx-auto ${poppins.className}`}>

            {/* Header dengan tombol back dan share */}
            <div className="py-2 flex justify-between items-center">
                <button className="text-white p-2" onClick={() => history.back()}>
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button className="text-white p-2">
                    <ShareIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="max-w-[500px] mx-auto px-4 pb-20">
                {/* Konten utama dengan grid layout untuk membagi menjadi dua kolom */}
                <div className="grid grid-cols-2 gap-2 py-4 relative">
                    {/* Kolom kiri: Logo crew dan nama */}
                    <div className="flex flex-col justify-start items-start gap-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                            <Image
                                src={runner.crew_logo || "/assets/chelsea-logo.png"}
                                alt={runner.crew_name || "Club"}
                                width={56}
                                height={56}
                                className="object-cover"
                            />
                        </div>
                        {/* Nama dan posisi */}
                        <h1 className="text-4xl font-bold text-white mb-1">{displayName}</h1>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-[#cad96b] rounded-full px-2 py-1 text-black text-xs font-semibold">{runner.run_type}</span>
                            <span className="bg-[#cad96b] rounded-full px-2 py-1 text-black text-xs font-semibold">{runner.activity_time}</span>
                        </div>
                    </div>

                    {/* Kolom kanan: Foto profil */}
                    <div className="flex justify-center items-center">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#cad96b]">
                            <Image
                                src={profilePhoto}
                                alt={runner.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Cards - posisi absolute agar bisa berada di antara dua div */}
                <div className="py-4">
                    <div className="grid grid-cols-3 gap-3 h-[100px]">
                        {/* Umur */}
                        <div className="bg-[#cad96b] backdrop-blur-md p-3 rounded-xl shadow-md justify-between flex flex-col">
                            <div className="flex items-center gap-1 mb-2">
                                <div className="bg-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xs text-black font-black">Age</h3>
                            </div>
                            <p className="text-xl font-bold text-black">{runner.age} y</p>
                        </div>
                        {/* Total KM */}
                        <div className="bg-[#cad96b] backdrop-blur-md p-3 rounded-xl shadow-md justify-between flex flex-col">
                            <div className="flex items-center gap-1 mb-2">
                                <div className="bg-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xs text-black font-black">Total KM</h3>
                            </div>
                            <p className="text-xl font-bold text-black">{runner.total_km}</p>
                        </div>
                        {/* Average Pace */}
                        <div className="bg-[#cad96b] backdrop-blur-md p-3 rounded-xl shadow-md justify-between flex flex-col">
                            <div className="flex items-center gap-1 mb-2">
                                <div className="bg-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xs text-black font-black">Avg Pace</h3>
                            </div>
                            <p className="text-xl font-bold text-black">{runner.avg_pace}</p>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Running Activity Chart */}
                    <div className="mb-8">
                        <RunningActivityChart
                            runnerId={runner.id}
                        />
                    </div>

                    {/* Social Links */}
                    <div className="px-8">
                        <div className="flex justify-center items-center gap-8 mb-8 bg-[#cad96b]/40 backdrop-blur-md rounded-full py-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-white backdrop-blur-sm rounded-full p-1 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-white">Instagram</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="bg-white backdrop-blur-sm rounded-full p-1 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-white">Strava</span>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3 text-white">About</h2>
                        <p className="text-gray-250 leading-relaxed">
                            {runner.description}
                        </p>
                    </div>

                    {/* Latest Player News */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3 text-white">Latest Player News</h2>
                        <div className="bg-blue-800/40 rounded-xl shadow-lg overflow-hidden">
                            <div className="relative h-48">
                                <Image
                                    src={ProfilePhoto}
                                    alt="Runner News"
                                    width={100}
                                    height={100}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                                    <h3 className="text-xl font-bold text-white">Summer 2022 Transfers & News</h3>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
} 