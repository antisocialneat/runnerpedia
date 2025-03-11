"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

type FilterType = "weekly" | "monthly" | "all-time";
type Runner = {
    id: string;
    name: string;
    profilePic: string;
    totalKm: number;
    crew: string;
    rank?: number;
};

export default function LeaderboardPage() {
    const [filter, setFilter] = useState<FilterType>("weekly");

    // Dummy data untuk contoh
    const runners: Runner[] = [
        {
            id: "1",
            name: "lilyonetwothree",
            profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
            totalKm: 146,
            crew: "Runners Club",
        },
        {
            id: "2",
            name: "josheleven",
            profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
            totalKm: 105,
            crew: "Runners Club",
        },
        {
            id: "3",
            name: "herotaylor",
            profilePic: "https://randomuser.me/api/portraits/men/68.jpg",
            totalKm: 99,
            crew: "Speed Demons",
        },
        {
            id: "4",
            name: "whitefish664",
            profilePic: "https://randomuser.me/api/portraits/women/65.jpg",
            totalKm: 96,
            crew: "Road Warriors",
        },
        {
            id: "5",
            name: "sadpanda176",
            profilePic: "https://randomuser.me/api/portraits/men/41.jpg",
            totalKm: 88,
            crew: "Speed Demons",
        },
        {
            id: "6",
            name: "silverduck204",
            profilePic: "https://randomuser.me/api/portraits/women/22.jpg",
            totalKm: 87,
            crew: "Road Warriors",
        },
        {
            id: "7",
            name: "beautifulmouse112",
            profilePic: "https://randomuser.me/api/portraits/women/89.jpg",
            totalKm: 85,
            crew: "Runners Club",
        },
    ];

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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
            <header className="bg-white dark:bg-gray-800 p-4 shadow-sm">
                <div className="flex items-center">
                    <button className="mr-2" onClick={() => history.back()}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <h1 className="text-xl font-semibold text-center flex-1">Leaderboard</h1>
                </div>
            </header>

            <div className="p-4">
                {/* Filter Buttons */}
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter("weekly")}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium",
                            filter === "weekly"
                                ? "bg-white dark:bg-gray-800 text-black dark:text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        Worldwide
                    </button>
                    <button
                        onClick={() => setFilter("monthly")}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium",
                            filter === "monthly"
                                ? "bg-white dark:bg-gray-800 text-black dark:text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        United States
                    </button>
                    <button
                        onClick={() => setFilter("all-time")}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium",
                            filter === "all-time"
                                ? "bg-white dark:bg-gray-800 text-black dark:text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        Florida
                    </button>
                    <button
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium",
                            "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        Zip:
                    </button>
                </div>

                {/* Podium Section */}
                <div className="relative h-80 mb-8">
                    {/* Podium Platforms */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end h-40">
                        {/* 2nd Place */}
                        <div className="w-1/3 h-32 bg-gray-300 dark:bg-gray-700 mx-1 rounded-t-lg flex flex-col items-center justify-end relative">
                            <div className="absolute -top-20 flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-blue-500">
                                        <Image
                                            src={podiumRunners[1]?.profilePic || ""}
                                            alt={podiumRunners[1]?.name || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 bg-gray-300 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        2
                                    </div>
                                </div>
                                <span className="text-sm font-semibold mt-2 text-center">
                                    {podiumRunners[1]?.name}
                                </span>
                                <div className="flex items-center mt-1">
                                    <span className="text-purple-500 font-bold text-sm">
                                        {podiumRunners[1]?.totalKm}
                                    </span>
                                </div>
                            </div>
                            <span className="text-4xl font-bold mb-2">2</span>
                        </div>

                        {/* 1st Place */}
                        <div className="w-1/3 h-40 bg-gray-300 dark:bg-gray-700 mx-1 rounded-t-lg flex flex-col items-center justify-end relative">
                            <div className="absolute -top-20 flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-blue-500">
                                        <Image
                                            src={podiumRunners[0]?.profilePic || ""}
                                            alt={podiumRunners[0]?.name || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        1
                                    </div>
                                </div>
                                <span className="text-sm font-semibold mt-2 text-center">
                                    {podiumRunners[0]?.name}
                                </span>
                                <div className="flex items-center mt-1">
                                    <span className="text-purple-500 font-bold text-sm">
                                        {podiumRunners[0]?.totalKm}
                                    </span>
                                </div>
                            </div>
                            <span className="text-4xl font-bold mb-2">1</span>
                        </div>

                        {/* 3rd Place */}
                        <div className="w-1/3 h-24 bg-gray-300 dark:bg-gray-700 mx-1 rounded-t-lg flex flex-col items-center justify-end relative">
                            <div className="absolute -top-20 flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-blue-500">
                                        <Image
                                            src={podiumRunners[2]?.profilePic || ""}
                                            alt={podiumRunners[2]?.name || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 bg-orange-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        3
                                    </div>
                                </div>
                                <span className="text-sm font-semibold mt-2 text-center">
                                    {podiumRunners[2]?.name}
                                </span>
                                <div className="flex items-center mt-1">
                                    <span className="text-purple-500 font-bold text-sm">
                                        {podiumRunners[2]?.totalKm}
                                    </span>
                                </div>
                            </div>
                            <span className="text-4xl font-bold mb-2">3</span>
                        </div>
                    </div>
                </div>

                {/* Other Runners List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    {otherRunners.map((runner) => (
                        <div
                            key={runner.id}
                            className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                        >
                            <div className="w-8 text-center font-semibold text-gray-500 dark:text-gray-400">
                                {runner.rank}
                            </div>
                            <div className="flex items-center flex-1 ml-4">
                                <div className="relative w-10 h-10 mr-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500">
                                        <Image
                                            src={runner.profilePic}
                                            alt={runner.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium">{runner.name}</h3>
                                    <div className="flex items-center">
                                        <span className="text-purple-500 text-sm font-semibold">
                                            {runner.totalKm}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 