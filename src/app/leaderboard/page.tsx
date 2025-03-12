import { RunType, ActivityTime, FilterType } from "../../types";
import { getRunners } from "../../lib/api";
import { Suspense } from "react";
import LeaderboardUI from "./LeaderboardUI";

declare module './LeaderboardUI';

// Using static metadata to avoid the searchParams issue
export const dynamic = 'force-dynamic'; // Memastikan halaman selalu dirender ulang pada setiap request
export const fetchCache = 'force-no-store'; // Memastikan data selalu diambil ulang

// Fungsi untuk mendapatkan gambar default jika gambar tidak tersedia
function getDefaultProfilePic(id: string) {
    const gender = parseInt(id) % 2 === 0 ? 'men' : 'women';
    const number = parseInt(id) % 100 || 1;
    return `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
}

// Fungsi untuk memastikan URL gambar valid
function getValidImageUrl(url: string | null | undefined, id: string) {
    if (!url || url.trim() === '') {
        return getDefaultProfilePic(id);
    }
    return url;
}

// Helper function untuk mendapatkan warna background berdasarkan jenis lari
function getRunTypeColor(type: RunType) {
    switch (type) {
        case "Easy Run":
            return "bg-green-100 text-green-800";
        case "Fun Run":
            return "bg-blue-100 text-blue-800";
        case "Strength & Speed":
            return "bg-red-100 text-red-800";
        case "Hill":
            return "bg-orange-100 text-orange-800";
        case "Endurance":
            return "bg-purple-100 text-purple-800";
        case "Race":
            return "bg-yellow-100 text-yellow-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

// Helper function untuk mendapatkan icon dan warna untuk waktu aktivitas
function getActivityTimeStyle(time: ActivityTime) {
    if (time === "Early Bird") {
        return {
            icon: "🌅",
            class: "bg-amber-100 text-amber-800"
        };
    }
    return {
        icon: "🌙",
        class: "bg-indigo-100 text-indigo-800"
    };
}

// Helper function untuk memformat pace
function formatPace(pace?: number) {
    if (!pace) return "";
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
}

// Fungsi untuk mendapatkan label filter
function getFilterLabel(filter: FilterType) {
    switch (filter) {
        case "weekly":
            return "Weekly";
        case "monthly":
            return "Monthly";
        case "all-time":
            return "All Time Best";
        default:
            return "Weekly";
    }
}

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function LeaderboardPage() {
    // Fetch data for all filter types at once
    const weeklyRunners = await getRunners("weekly");
    const monthlyRunners = await getRunners("monthly");
    const allTimeRunners = await getRunners("all-time");
    
    // Process runners data with rankings
    const processRunners = (runners: any[] | null) => {
        if (!runners || runners.length === 0) {
            return [];
        }
        return runners.map((runner, index) => ({
            ...runner,
            rank: index + 1,
        }));
    };
    
    const runnersData = {
        weekly: processRunners(weeklyRunners),
        monthly: processRunners(monthlyRunners),
        "all-time": processRunners(allTimeRunners)
    };
    
    // Create dummy data for when no real data is available
    const dummyRunners = [
        {
            id: "1",
            name: "lilyonetwothree",
            profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
            totalKm: 146,
            crew: "Hummingbird",
            runType: "Endurance" as RunType,
            activityTime: "Early Bird" as ActivityTime,
            avgPace: 5.2,
            rank: 1
        },
        {
            id: "2",
            name: "josheleven",
            profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
            totalKm: 105,
            crew: "Skeleton",
            runType: "Strength & Speed" as RunType,
            activityTime: "Night Owl" as ActivityTime,
            avgPace: 4.5,
            rank: 2
        },
        {
            id: "3",
            name: "herotaylor",
            profilePic: "https://randomuser.me/api/portraits/men/68.jpg",
            totalKm: 99,
            crew: "Speed Demons",
            runType: "Hill" as RunType,
            activityTime: "Early Bird" as ActivityTime,
            avgPace: 6.8,
            rank: 3
        },
    ];
    
    // Pass all data to the client component
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
            <LeaderboardUI 
                runnersData={runnersData}
                dummyRunners={dummyRunners}
                hasData={{
                    weekly: weeklyRunners && weeklyRunners.length > 0,
                    monthly: monthlyRunners && monthlyRunners.length > 0,
                    "all-time": allTimeRunners && allTimeRunners.length > 0
                }}
            />
        </Suspense>
    );
} 