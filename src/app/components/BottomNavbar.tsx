"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon as HomeIconOutline, TrophyIcon as TrophyIconOutline, CalendarIcon as CalendarIconOutline, UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, TrophyIcon as TrophyIconSolid, CalendarIcon as CalendarIconSolid, UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import clsx from "clsx";

export default function BottomNavbar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Home",
            href: "/",
            icon: {
                outline: HomeIconOutline,
                solid: HomeIconSolid,
            },
        },
        {
            name: "Leaderboard",
            href: "/leaderboard",
            icon: {
                outline: TrophyIconOutline,
                solid: TrophyIconSolid,
            },
        },
        {
            name: "Event",
            href: "/events",
            icon: {
                outline: CalendarIconOutline,
                solid: CalendarIconSolid,
            },
        },
        {
            name: "Account",
            href: "/account",
            icon: {
                outline: UserIconOutline,
                solid: UserIconSolid,
            },
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 h-16 flex items-center justify-around px-4 sm:px-6">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-full",
                            isActive
                                ? "text-white-600 dark:text-white-400"
                                : "text-gray-500 dark:text-gray-400 hover:text-white-600 dark:hover:text-white-400"
                        )}
                    >
                        {isActive ? (
                            <item.icon.solid className="w-6 h-6 mb-1" />
                        ) : (
                            <item.icon.outline className="w-6 h-6 mb-1" />
                        )}
                        <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                    </Link>
                );
            })}
        </div>
    );
} 