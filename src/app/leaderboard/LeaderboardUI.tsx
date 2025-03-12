"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { RunType, ActivityTime, FilterType } from "../../types";

/**
 * Interface for a runner object
 */
interface Runner {
    id: string;
    name: string;
    profilePic?: string;
    totalKm: number;
    crew: string;
    runType: RunType;
    activityTime: ActivityTime;
    avgPace?: number;
    rank: number;
}

/**
 * Props for the LeaderboardUI component
 */
interface LeaderboardUIProps {
    runnersData: {
        weekly: Runner[];
        monthly: Runner[];
        "all-time": Runner[];
    };
    dummyRunners: Runner[];
    hasData: {
        weekly: boolean;
        monthly: boolean;
        "all-time": boolean;
    };
}

/**
 * Client-side component that renders the leaderboard UI and handles filter interactions
 */
export default function LeaderboardUI({ 
    runnersData,
    dummyRunners,
    hasData
}: LeaderboardUIProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Get filter from URL or default to "weekly"
    const filterParam = searchParams.get('filter') as FilterType || "weekly";
    const [currentFilter, setCurrentFilter] = useState<FilterType>(filterParam);
    
    // State for filter dropdown
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);

    // Determine if we should use dummy data
    const isDummyData = !hasData[currentFilter];
    
    // Get the appropriate runners based on filter and data availability
    const runners = isDummyData ? dummyRunners : runnersData[currentFilter];
    
    // Split runners into podium and others
    const podiumRunners = runners.slice(0, 3);
    const otherRunners = runners.slice(3);

    // Set mounted state after component mounts
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    
    // Update current filter when URL changes
    useEffect(() => {
        const filter = searchParams.get('filter') as FilterType || "weekly";
        setCurrentFilter(filter);
    }, [searchParams]);

    // Close dropdown when user clicks outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowFilterDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /**
     * Toggle the filter dropdown
     */
    const toggleDropdown = () => {
        setShowFilterDropdown(prevState => !prevState);
    };

    /**
     * Change the current filter and navigate to the new URL
     */
    const changeFilter = (filter: FilterType) => {
        router.push(`/leaderboard?filter=${filter}`);
        setShowFilterDropdown(false);
    };

    /**
     * Get a valid image URL or default profile picture
     */
    const getValidImageUrl = (url: string | null | undefined, id: string) => {
        if (!url || url.trim() === '') {
            const gender = parseInt(id) % 2 === 0 ? 'men' : 'women';
            const number = parseInt(id) % 100 || 1;
            return `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
        }
        return url;
    };

    /**
     * Get background color based on run type
     */
    const getRunTypeColor = (type: RunType) => {
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
    };

    /**
     * Get icon and style for activity time
     */
    const getActivityTimeStyle = (time: ActivityTime) => {
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
    };

    /**
     * Format pace for display
     */
    const formatPace = (pace?: number) => {
        if (!pace) return "";
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
    };

    /**
     * Get crew logo URL
     */
    const getCrewLogo = (crew: string) => {
        // This is a simplified version - in a real app, you'd have a mapping of crew names to logos
        return `/images/crews/${crew.toLowerCase().replace(/\s+/g, '-')}.png`;
    };

    /**
     * Get filter label for display
     */
    const getFilterLabel = (filter: FilterType) => {
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
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="bg-transparent backdrop-blur-sm sticky top-0 py-4 z-10">
                <div className="flex items-center px-4 max-w-[500px] mx-auto">
                    <h1 className="text-xl font-semibold text-center flex-1">
                        {isDummyData ? "Leaderboard (Dummy Data)" : "Leaderboard"}
                    </h1>
                </div>
            </header>

            <div className="max-w-[500px] mx-auto px-4 pb-20">
                {/* Filter Controls */}
                <div className="flex space-x-2 mb-6 overflow-x-auto relative">
                    {/* Filter Button with Icon */}
                    <div className="relative">
                        <button
                            ref={buttonRef}
                            onClick={toggleDropdown}
                            className="px-4 py-2 rounded-lg text-sm font-bold bg-[#252627] text-white flex items-center"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                            </svg>
                            Filters
                        </button>

                        {/* Dropdown Menu with Portal */}
                        {mounted && showFilterDropdown && createPortal(
                            <div
                                ref={dropdownRef}
                                className="fixed bg-[#252627] rounded-lg shadow-lg w-48 overflow-hidden"
                                style={{
                                    top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
                                    left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left + window.scrollX : 0,
                                    zIndex: 9999
                                }}
                            >
                                <button
                                    onClick={() => changeFilter("all-time")}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-t-xl"
                                    type="button"
                                >
                                    All Time Best
                                </button>
                                <button
                                    onClick={() => changeFilter("weekly")}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-700"
                                    type="button"
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => changeFilter("monthly")}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-b-xl"
                                    type="button"
                                >
                                    Monthly
                                </button>
                            </div>,
                            document.body
                        )}
                    </div>

                    {/* Selected Filter Badge */}
                    {currentFilter && (
                        <button
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold",
                                "bg-white text-gray-800"
                            )}
                            type="button"
                        >
                            {getFilterLabel(currentFilter)}
                        </button>
                    )}
                </div>

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