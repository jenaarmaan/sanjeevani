"use client";

import React from "react";
import Link from "next/link";
import { Activity, User, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mocking cn since it's defined in Button.tsx but for local use let's just use it properly
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-medical-teal-deep/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-teal text-white shadow-lg">
                        <Activity size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-medical-teal-deep dark:text-white uppercase italic">
                        Sanjeevani
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center space-x-8 md:flex">
                    <Link href="/dashboard" className="text-sm font-semibold text-foreground/70 hover:text-medical-teal transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/triage" className="text-sm font-semibold text-foreground/70 hover:text-medical-teal transition-colors">
                        AI Triage
                    </Link>
                    <Link href="/records" className="text-sm font-semibold text-foreground/70 hover:text-medical-teal transition-colors">
                        Health Records
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="relative p-2">
                        <Bell size={20} />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emergency-red" />
                    </Button>
                    <div className="h-8 w-px bg-border mx-2" />
                    <Button variant="secondary" size="sm" className="hidden md:flex">
                        <User size={18} className="mr-2" />
                        Sign In
                    </Button>
                    <button className="md:hidden p-2 text-medical-teal">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};
