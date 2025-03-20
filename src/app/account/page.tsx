"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export default function AccountPage() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [user] = useState({
        name: "N'Golo Kante",
        profilePic: "https://randomuser.me/api/portraits/men/68.jpg",
        totalKm: 99,
        crew: "Chelsea FC",
        age: 31,
        debut: "August 15, 2016",
        height: "1.68m (5 ft 6 in)",
        about: "The Frenchman joined from Leicester City, where he so memorably played a major part in the Foxes' Premier League title triumph."
    });

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const supabase = createBrowserSupabaseClient();
            await supabase.auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-blue-600 p-4 relative">
                <div className="flex items-center">
                    <button className="text-white" onClick={() => history.back()}>
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
                    <div className="absolute right-4">
                        <button className="text-white">
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
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center mt-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                            <Image
                                src={user.profilePic}
                                alt={user.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mt-2">{user.name}</h1>
                    <div className="flex items-center mt-1">
                        <span className="text-red-200 text-sm mr-2">🏃‍♂️ Midfielder</span>
                    </div>
                </div>
            </header>

            <div className="p-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                        <h3 className="text-xs text-yellow-800 mb-1">Age</h3>
                        <p className="text-lg font-bold text-yellow-900">{user.age} y</p>
                        <p className="text-xs text-yellow-700">Mar 29,1991</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <h3 className="text-xs text-blue-800 mb-1">Debut</h3>
                        <p className="text-sm font-bold text-blue-900">{user.debut}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <h3 className="text-xs text-blue-800 mb-1">Height</h3>
                        <p className="text-sm font-bold text-blue-900">{user.height}</p>
                    </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-around mb-6">
                    <button className="text-blue-600 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                    </button>
                    <button className="text-pink-600 flex items-center justify-center w-12 h-12 rounded-full bg-pink-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </button>
                    <button className="text-blue-600 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z" />
                        </svg>
                    </button>
                </div>

                {/* About Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">About</h2>
                    <p className="text-gray-700 dark:text-gray-300">{user.about}</p>
                </div>

                {/* Stats Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Running Stats</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Distance</h3>
                                <p className="text-2xl font-bold">{user.totalKm} km</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Crew</h3>
                                <p className="text-2xl font-bold">{user.crew}</p>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Avg. Pace</h3>
                                <p className="text-2xl font-bold">4:35 /km</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-500 dark:text-gray-400">Runs</h3>
                                <p className="text-2xl font-bold">24</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logout Button - Added new section */}
                <div className="mt-6">
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                    >
                        {isLoggingOut ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm6 5a1 1 0 00-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V8z" clipRule="evenodd" />
                                </svg>
                                Logout
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
} 