"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { FilterType } from "../../types";

export default function ClientSideLeaderboard({ currentFilter }: { currentFilter: FilterType }) {
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Set mounted state after component mounts
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Menutup dropdown ketika user mengklik di luar dropdown
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

    // Fungsi untuk toggle dropdown
    const toggleDropdown = () => {
        setShowFilterDropdown(prevState => !prevState);
    };

    // Fungsi untuk mengubah filter
    const changeFilter = (filter: FilterType) => {
        router.push(`/leaderboard?filter=${filter}`);
        setShowFilterDropdown(false);
    };

    // Fungsi untuk mendapatkan label filter yang dipilih
    const getFilterLabel = () => {
        switch (currentFilter) {
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

                {/* Dropdown Menu dengan Portal */}
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
                    {getFilterLabel()}
                </button>
            )}
        </div>
    );
} 