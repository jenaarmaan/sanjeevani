"use client";

import React from "react";
import Link from "next/link";
import { Activity, User, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/core/hooks/useAuth";

// Mocking cn since it's defined in Button.tsx but for local use let's just use it properly
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Navbar = () => {
    const { user, profile, login, logout, loading } = useAuth();

    const navLinks = [
        { name: "Dashboard", href: "/dashboard", roles: ["patient", "doctor", "field-worker", "admin"] },
        { name: "AI Triage", href: "/triage", roles: ["patient"] },
        { name: "Clinical Portal", href: "/clinical", roles: ["doctor", "admin"] },
        { name: "Field Portal", href: "/field", roles: ["field-worker", "admin"] },
        { name: "Records", href: "/records", roles: ["patient"] },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/60 backdrop-blur-xl dark:bg-medical-teal-deep/80 border-white/10">
            <div className="container mx-auto flex h-20 items-center justify-between px-6">
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-teal text-white shadow-2xl shadow-medical-teal/40 group-hover:scale-105 transition-transform">
                        <Activity size={28} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tighter text-medical-teal-deep dark:text-white uppercase italic leading-none block">
                            Sanjeevani
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-medical-teal opacity-60">Neural Infrastructure</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center space-x-10 lg:flex">
                    {navLinks.filter(link => !profile || link.roles.includes(profile.role)).map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-black uppercase tracking-widest text-medical-teal-deep/50 hover:text-medical-teal transition-all hover:tracking-[0.2em]"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {profile && !profile.onboarded && profile.role === "patient" && (
                        <Link href="/onboarding" className="text-[10px] font-black uppercase tracking-widest text-warning-amber animate-pulse">
                            Complete Setup !
                        </Link>
                    )}
                </div>

                <div className="flex items-center space-x-6">
                    <Button variant="ghost" size="sm" className="relative p-2 text-medical-teal-deep/40 hover:text-medical-teal">
                        <Bell size={24} />
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emergency-red shadow-[0_0_8px_#ef4444]" />
                    </Button>

                    {user ? (
                        <div className="flex items-center space-x-4 pl-4 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <div className="text-xs font-black text-medical-teal-deep leading-none">{profile?.displayName?.split(' ')[0] || "Citizen"}</div>
                                <div className="text-[8px] font-bold text-medical-teal uppercase tracking-widest mt-1 opacity-60">{profile?.role}</div>
                            </div>
                            <Button variant="secondary" size="sm" className="rounded-xl h-12 px-6 shadow-lg shadow-gray-200" onClick={logout}>
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-medical-teal text-white flex items-center justify-center text-xs font-black shadow-inner">
                                        {profile?.role[0].toUpperCase()}
                                    </div>
                                    <span className="text-[10px] font-black uppercase">Exit</span>
                                </div>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl h-12 px-8 shadow-xl shadow-medical-teal/10"
                            onClick={login}
                            isLoading={loading}
                        >
                            <User size={18} className="mr-2" />
                            <span className="text-[10px] font-black uppercase">Sign In</span>
                        </Button>
                    )}

                    <button className="lg:hidden p-2 text-medical-teal">
                        <Menu size={28} />
                    </button>
                </div>
            </div>
        </nav>
    );
};
