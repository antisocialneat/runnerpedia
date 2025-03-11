"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, User } from "lucide-react";
import clsx from "clsx";

export default function BottomNavbar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Leaderboard",
            href: "/leaderboard",
            icon: Trophy,
        },
        {
            name: "Events",
            href: "/events",
            icon: Calendar,
        },
        {
            name: "Account",
            href: "/account",
            icon: User,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 flex items-center justify-around px-4 sm:px-6">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-full",
                            isActive
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                );
            })}
        </div>
    );
} 