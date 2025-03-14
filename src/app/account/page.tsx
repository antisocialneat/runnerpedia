"use client";

import Image from "next/image";
import ProfilePhoto from "../../../assets/raka-profile-photo.png";
import InstagramLogo from "../../../assets/instagram-logo.png";
import StravaLogo from "../../../assets/logo-strava.png";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeftIcon, ShareIcon } from "@heroicons/react/24/outline";

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

    // Format tanggal lahir dari umur (contoh sederhana)
    const birthYear = new Date().getFullYear() - parseInt(runner.age);
    const birthDate = `Mar 29,${birthYear}`;

    // Tambahkan fallback untuk gambar profil
    const profilePhoto = runner.profile_photo || "/assets/raka-profile-photo.png";

    return (
        <div className="min-h-screen bg-gray-200 relative overflow-hidden max-w-md mx-auto">

            {/* Header dengan tombol back dan share */}
            <div className="px-4 py-2 flex justify-between items-center">
                <button className="text-black p-2 rounded-full" onClick={() => history.back()}>
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button className="text-black p-2 rounded-full bg-white backdrop-blur-sm shadow-md">
                    <ShareIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Gambar profil utama di sebelah kanan */}
            <div className="absolute right-0 top-16 w-3/5 h-96 z-0">
                <Image
                    src={profilePhoto}
                    alt={runner.name}
                    fill
                    className="object-cover object-right-top"
                    priority
                />
            </div>

            {/* Konten utama dengan padding yang lebih besar */}
            <div className="px-6 pt-4 relative z-10">
                {/* Logo club dan bendera negara */}
                <div className="flex items-center gap-2 mb-4 mt-8">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white">
                        <Image
                            src={runner.crew_logo || "/assets/chelsea-logo.png"}
                            alt={runner.crew_name || "Club"}
                            width={56}
                            height={56}
                            className="object-cover"
                        />
                    </div>
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white">
                        <Image
                            src="/assets/france-flag.png"
                            alt="France"
                            width={56}
                            height={56}
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Nama dan posisi */}
                <h1 className="text-6xl font-bold text-black mb-1">{runner.name}</h1>
                <div className="flex items-center gap-2 mb-14">
                    <span className="bg-white rounded-full px-2 py-1 text-red-500 text-xs font-semibold">{runner.run_type}</span>
                    <span className="bg-white rounded-full px-2 py-1 text-gray-300 text-xs font-semibold">{runner.activity_time}</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Umur */}
                    <div className="bg-transparent backdrop-blur-md hover:bg-yellow-500 p-3 rounded-xl shadow-md">
                        <div className="flex items-center gap-1 mb-6">
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
                    <div className="bg-transparent backdrop-blur-md hover:bg-yellow-500 p-3 rounded-xl shadow-md">
                        <div className="flex items-center gap-1 mb-6">
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
                    <div className="bg-transparent backdrop-blur-md hover:bg-yellow-500 p-3 rounded-xl shadow-md">
                        <div className="flex items-center gap-1 mb-6">
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

            <div className="px-6 pt-4 pb-20 relative z-10 bg-blue-400 rounded-t-[60px]">
                {/* Social Links */}
                <div className="flex justify-center gap-6 mb-8 rounded-full px-4 py-2 bg-transparent backdrop-blur-xl shadow-sm">
                    <button className="text-blue-600 flex items-center justify-center w-6 h-6">
                        <Image
                            src={InstagramLogo}
                            alt="Instagram"
                            width={24}
                            height={24}
                        />
                    </button>
                    <span className="text-xs font-medium">Instagram</span>
                    <button className="text-pink-600 flex items-center justify-center w-6 h-6">
                        <Image
                            src={StravaLogo}
                            alt="Strava"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>

                {/* About Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-white">About</h2>
                    <div className="bg-blue-800/40 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-gray-200 leading-relaxed">The Frenchman joined from Leicester City, where he so memorably played a major part in the Foxes' Premier League triumph the previous season....</p>
                    </div>
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

    );
} 