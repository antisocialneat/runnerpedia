import Image from "next/image";
import clsx from "clsx";
import { RunType, ActivityTime, FilterType } from "../../types";
import { getRunners, getCrewLogo } from "../../lib/api";
import ClientSideLeaderboard from "./ClientSideLeaderboard";

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

export default async function LeaderboardPage({
    searchParams
}: {
    searchParams: { filter?: string }
}) {
    // Mendapatkan filter dari query params atau default ke "weekly"
    const filterParam = searchParams.filter;
    const filter = (filterParam as FilterType) || "weekly";

    console.log("Filter yang digunakan:", filter);

    // Mengambil data runners dari Supabase
    const runners = await getRunners(filter);

    console.log("Data runners yang diambil:", runners);

    // Jika tidak ada data, gunakan data dummy
    if (!runners || runners.length === 0) {
        console.log("Tidak ada data, menggunakan data dummy");
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
            },
        ];

        // Menambahkan peringkat ke setiap runner
        const runnersWithRank = dummyRunners.map((runner, index) => ({
            ...runner,
            rank: index + 1,
        }));

        // Mendapatkan top 3 runners untuk podium
        const podiumRunners = runnersWithRank.slice(0, 3);

        // Mendapatkan runners lainnya
        const otherRunners = runnersWithRank.slice(3);

        return (
            <div className="min-h-screen bg-black text-white">
                <header className="bg-transparent backdrop-blur-sm sticky top-0 py-4 z-10">
                    <div className="flex items-center px-4 max-w-[500px] mx-auto">
                        <h1 className="text-xl font-semibold text-center flex-1">Leaderboard (Dummy Data)</h1>
                    </div>
                </header>

                <div className="max-w-[500px] mx-auto px-4 pb-20">
                    {/* Client-side Filter Component */}
                    <ClientSideLeaderboard currentFilter={filter} />

                    {/* Podium Section */}
                    <div className="relative h-96 mb-6">
                        {/* Profile Pictures Above Podium */}
                        <div className="flex justify-center items-start mb-12">
                            {podiumRunners.map((runner, index) => {
                                const position = index + 1;
                                let positionClass = "";
                                let badgeClass = "";

                                if (position === 1) {
                                    positionClass = "mx-4";
                                    badgeClass = "bg-yellow-400 text-yellow-800";
                                } else if (position === 2) {
                                    positionClass = "mx-4";
                                    badgeClass = "bg-gray-300 text-gray-800";
                                } else {
                                    positionClass = "mx-4";
                                    badgeClass = "bg-orange-400 text-orange-800";
                                }

                                return (
                                    <div key={runner.id} className={`flex flex-col items-center ${positionClass}`}>
                                        <div className="relative mb-2">
                                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                                                <Image
                                                    src={getValidImageUrl(runner.profilePic, runner.id)}
                                                    alt={runner.name || `Runner ${position}`}
                                                    width={80}
                                                    height={80}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className={`absolute -right-1 -bottom-1 ${badgeClass} rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold`}>
                                                {position}
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-center">
                                            {runner.name}
                                        </span>
                                        <div className="flex items-center mt-1 bg-purple-800 rounded-full px-2 py-1">
                                            <span className="text-purple-300 mr-1 font-bold">T</span>
                                            <span className="text-white font-bold text-sm">
                                                {runner.totalKm}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Podium Platforms */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end h-40">
                            {/* 2nd Place */}
                            <div className="w-1/3 h-32 bg-gray-600 mx-1 rounded-t-lg flex flex-col items-center justify-end">
                                <span className="text-6xl font-bold mb-2 text-gray-400">2</span>
                            </div>

                            {/* 1st Place */}
                            <div className="w-1/3 h-40 bg-gray-500 mx-1 rounded-t-lg flex flex-col items-center justify-end">
                                <span className="text-6xl font-bold mb-2 text-gray-300">1</span>
                            </div>

                            {/* 3rd Place */}
                            <div className="w-1/3 h-24 bg-gray-600 mx-1 rounded-t-lg flex flex-col items-center justify-end">
                                <span className="text-6xl font-bold mb-2 text-gray-400">3</span>
                            </div>
                        </div>
                    </div>

                    {/* Other Runners List */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {otherRunners.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                Tidak ada data runner lainnya
                            </div>
                        ) : (
                            otherRunners.map((runner) => (
                                <div
                                    key={runner.id}
                                    className="flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="relative">
                                        {/* Profile Picture */}
                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200">
                                            <Image
                                                src={getValidImageUrl(runner.profilePic, runner.id)}
                                                alt={runner.name}
                                                width={56}
                                                height={56}
                                                className="object-cover w-full h-full rounded-full"
                                            />
                                        </div>
                                        {/* Rank Badge */}
                                        <div className="absolute -left-1 top-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">
                                            {runner.rank}
                                        </div>
                                    </div>

                                    <div className="flex-1 ml-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-sm">{runner.name}</h3>
                                            <div className="flex items-center gap-1.5 rounded-full bg-amber-100 pl-1 pr-2.5 py-0.5">
                                                <div className="w-4 h-4 rounded-full overflow-hidden">
                                                    <Image
                                                        src={getCrewLogo(runner.crew)}
                                                        alt={`${runner.crew} logo`}
                                                        width={16}
                                                        height={16}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-amber-800">
                                                    {runner.crew}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={clsx(
                                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                                getRunTypeColor(runner.runType)
                                            )}>
                                                {runner.runType}
                                            </span>
                                            <span className={clsx(
                                                "rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1",
                                                getActivityTimeStyle(runner.activityTime).class
                                            )}>
                                                <span>{getActivityTimeStyle(runner.activityTime).icon}</span>
                                                <span>{runner.activityTime}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1.5 bg-purple-100 rounded-full px-2.5 py-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-purple-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                            </svg>
                                            <span className="text-purple-900 font-bold text-sm">
                                                {runner.totalKm}
                                            </span>
                                        </div>
                                        {runner.avgPace && (
                                            <div className="flex items-center gap-1.5 bg-blue-100 rounded-full px-2.5 py-1 mt-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-blue-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                                <span className="text-blue-900 font-bold text-xs">
                                                    {formatPace(runner.avgPace)} /km
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Menambahkan peringkat ke setiap runner
    const runnersWithRank = runners.map((runner, index) => ({
        ...runner,
        rank: index + 1,
    }));

    // Mendapatkan top 3 runners untuk podium
    const podiumRunners = runnersWithRank.slice(0, 3);

    // Mendapatkan runners lainnya
    const otherRunners = runnersWithRank.slice(3);

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="bg-transparent backdrop-blur-sm sticky top-0 py-4 z-10">
                <div className="flex items-center px-4 max-w-[500px] mx-auto">
                    <h1 className="text-xl font-semibold text-center flex-1">Leaderboard</h1>
                </div>
            </header>

            <div className="max-w-[500px] mx-auto px-4 pb-20">
                {/* Client-side Filter Component */}
                <ClientSideLeaderboard currentFilter={filter} />

                {/* Podium Section */}
                <div className="relative h-96 mb-6">
                    {/* Profile Pictures Above Podium */}
                    <div className="flex justify-center items-start mb-12">
                        {/* 2nd Place - Left */}
                        {podiumRunners.length > 1 && (
                            <div className="flex flex-col items-center mx-4">
                                <div className="relative mb-2">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                                        <Image
                                            src={getValidImageUrl(podiumRunners[1]?.profilePic, podiumRunners[1]?.id || '2')}
                                            alt={podiumRunners[1]?.name || "Runner 2"}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 bg-gray-300 text-gray-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                                        2
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-center">
                                    {podiumRunners[1]?.name || "Runner 2"}
                                </span>
                                <div className="flex items-center mt-1 bg-purple-800 rounded-full px-2 py-1">
                                    <span className="text-purple-300 mr-1 font-bold">T</span>
                                    <span className="text-white font-bold text-sm">
                                        {podiumRunners[1]?.totalKm || 0}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 1st Place - Center */}
                        {podiumRunners.length > 0 && (
                            <div className="flex flex-col items-center mx-4">
                                <div className="relative mb-2">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                                        <Image
                                            src={getValidImageUrl(podiumRunners[0]?.profilePic, podiumRunners[0]?.id || '1')}
                                            alt={podiumRunners[0]?.name || "Runner 1"}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 bg-yellow-400 text-yellow-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                                        1
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-center">
                                    {podiumRunners[0]?.name || "Runner 1"}
                                </span>
                                <div className="flex items-center mt-1 bg-purple-800 rounded-full px-2 py-1">
                                    <span className="text-purple-300 mr-1 font-bold">T</span>
                                    <span className="text-white font-bold text-sm">
                                        {podiumRunners[0]?.totalKm || 0}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place - Right */}
                        {podiumRunners.length > 2 && (
                            <div className="flex flex-col items-center mx-4">
                                <div className="relative mb-2">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                                        <Image
                                            src={getValidImageUrl(podiumRunners[2]?.profilePic, podiumRunners[2]?.id || '3')}
                                            alt={podiumRunners[2]?.name || "Runner 3"}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 bg-orange-400 text-orange-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                                        3
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-center">
                                    {podiumRunners[2]?.name || "Runner 3"}
                                </span>
                                <div className="flex items-center mt-1 bg-purple-800 rounded-full px-2 py-1">
                                    <span className="text-purple-300 mr-1 font-bold">T</span>
                                    <span className="text-white font-bold text-sm">
                                        {podiumRunners[2]?.totalKm || 0}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Podium Platforms */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end h-40">
                        {/* 2nd Place */}
                        <div className="w-1/3 h-32 bg-gray-600 mx-1 rounded-t-lg flex flex-col items-center justify-end">
                            <span className="text-6xl font-bold mb-2 text-gray-400">2</span>
                        </div>

                        {/* 1st Place */}
                        <div className="w-1/3 h-40 bg-gray-500 mx-1 rounded-t-lg flex flex-col items-center justify-end">
                            <span className="text-6xl font-bold mb-2 text-gray-300">1</span>
                        </div>

                        {/* 3rd Place */}
                        <div className="w-1/3 h-24 bg-gray-600 mx-1 rounded-t-lg flex flex-col items-center justify-end">
                            <span className="text-6xl font-bold mb-2 text-gray-400">3</span>
                        </div>
                    </div>
                </div>

                {/* Other Runners List */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {otherRunners.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Tidak ada data runner lainnya
                        </div>
                    ) : (
                        otherRunners.map((runner) => (
                            <div
                                key={runner.id}
                                className="flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="relative">
                                    {/* Profile Picture */}
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200">
                                        <Image
                                            src={getValidImageUrl(runner.profilePic, runner.id)}
                                            alt={runner.name}
                                            width={56}
                                            height={56}
                                            className="object-cover w-full h-full rounded-full"
                                        />
                                    </div>
                                    {/* Rank Badge */}
                                    <div className="absolute -left-1 top-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">
                                        {runner.rank}
                                    </div>
                                </div>

                                <div className="flex-1 ml-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 text-sm">{runner.name}</h3>
                                        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 pl-1 pr-2.5 py-0.5">
                                            <div className="w-4 h-4 rounded-full overflow-hidden">
                                                <Image
                                                    src={getCrewLogo(runner.crew)}
                                                    alt={`${runner.crew} logo`}
                                                    width={16}
                                                    height={16}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-amber-800">
                                                {runner.crew}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={clsx(
                                            "rounded-full px-2 py-0.5 text-xs font-medium",
                                            getRunTypeColor(runner.runType)
                                        )}>
                                            {runner.runType}
                                        </span>
                                        <span className={clsx(
                                            "rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1",
                                            getActivityTimeStyle(runner.activityTime).class
                                        )}>
                                            <span>{getActivityTimeStyle(runner.activityTime).icon}</span>
                                            <span>{runner.activityTime}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 bg-purple-100 rounded-full px-2.5 py-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-purple-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                        <span className="text-purple-900 font-bold text-sm">
                                            {runner.totalKm}
                                        </span>
                                    </div>
                                    {runner.avgPace && (
                                        <div className="flex items-center gap-1.5 bg-blue-100 rounded-full px-2.5 py-1 mt-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-blue-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            <span className="text-blue-900 font-bold text-xs">
                                                {formatPace(runner.avgPace)} /km
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 