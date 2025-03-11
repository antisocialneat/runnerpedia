"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

type FilterType = "upcoming" | "past";

type Event = {
    id: string;
    title: string;
    date: string;
    location: string;
    image: string;
    distance: string;
    participants: number;
};

export default function EventsPage() {
    const [filter, setFilter] = useState<FilterType>("upcoming");

    // Dummy data untuk contoh
    const events: Event[] = [
        {
            id: "1",
            title: "City Marathon 2025",
            date: "May 15, 2025",
            location: "Downtown, City Center",
            image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2070&auto=format&fit=crop",
            distance: "42.2 km",
            participants: 1500,
        },
        {
            id: "2",
            title: "Beach Run Festival",
            date: "June 10, 2025",
            location: "Sunny Beach",
            image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=2029&auto=format&fit=crop",
            distance: "10 km",
            participants: 850,
        },
        {
            id: "3",
            title: "Trail Adventure",
            date: "July 5, 2025",
            location: "Mountain Park",
            image: "https://images.unsplash.com/photo-1465479423260-c4afc24172c6?q=80&w=2071&auto=format&fit=crop",
            distance: "21.1 km",
            participants: 620,
        },
        {
            id: "4",
            title: "Night Run Challenge",
            date: "August 20, 2025",
            location: "City Park",
            image: "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?q=80&w=2070&auto=format&fit=crop",
            distance: "5 km",
            participants: 1200,
        },
    ];

    const pastEvents: Event[] = [
        {
            id: "5",
            title: "Winter Marathon 2024",
            date: "January 15, 2024",
            location: "Downtown, City Center",
            image: "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?q=80&w=1974&auto=format&fit=crop",
            distance: "42.2 km",
            participants: 1200,
        },
        {
            id: "6",
            title: "Spring Run Festival",
            date: "March 10, 2024",
            location: "Central Park",
            image: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b?q=80&w=2070&auto=format&fit=crop",
            distance: "10 km",
            participants: 750,
        },
    ];

    const displayEvents = filter === "upcoming" ? events : pastEvents;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
            <header className="bg-white dark:bg-gray-800 p-4 shadow-sm">
                <h1 className="text-xl font-semibold text-center">Events</h1>
            </header>

            <div className="p-4">
                {/* Filter Buttons */}
                <div className="flex space-x-2 mb-6">
                    <button
                        onClick={() => setFilter("upcoming")}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium flex-1",
                            filter === "upcoming"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter("past")}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium flex-1",
                            filter === "past"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                    >
                        Past
                    </button>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                    {displayEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
                        >
                            <div className="relative h-48 w-full">
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4 text-white">
                                    <h2 className="text-xl font-bold">{event.title}</h2>
                                    <p className="text-sm opacity-90">{event.date}</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center mb-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {event.location}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                            />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {event.distance}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {event.participants} runners
                                        </span>
                                    </div>
                                </div>
                                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                                    {filter === "upcoming" ? "Register Now" : "View Results"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 