"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Activity, AlertCircle, Search, Filter, ShieldCheck, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function FieldWorkerPortal() {
    const [searchTerm, setSearchTerm] = useState("");

    const sectorPatients = [
        { id: "1", name: "Suresh Rao", age: 58, risk: 12, village: "Sector-7", status: "Stable", baseline: "Hypertension" },
        { id: "2", name: "Lakshmi Bai", age: 42, risk: 65, village: "Sector-7", status: "At Risk", baseline: "Asthma" },
        { id: "3", name: "Ravi Kumar", age: 29, risk: 85, village: "Sector-7", status: "Critical", baseline: "None" },
    ];

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="mb-2 inline-flex items-center rounded-full bg-warning-amber/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-warning-amber italic">
                            Field Ops: Sanjeevani Mitra
                        </div>
                        <h1 className="text-5xl font-black text-medical-teal-deep dark:text-white uppercase italic tracking-tighter leading-none">
                            Regional Node <span className="text-medical-teal">Sector-7</span>
                        </h1>
                        <p className="mt-3 text-sm font-medium text-muted italic">Frontline diagnostics and surveillance control.</p>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" className="h-14 rounded-xl border-2 px-6 font-black uppercase text-xs tracking-widest">
                            <Activity size={18} className="mr-2" /> Live Surveillance
                        </Button>
                        <Button className="h-14 rounded-xl px-8 shadow-xl shadow-medical-teal/20 font-black uppercase tracking-widest text-xs">
                            <Users size={18} className="mr-2" /> Register Citizen
                        </Button>
                    </div>
                </header>

                <div className="grid gap-10 lg:grid-cols-4">
                    {/* Surveillance Heatmap Simulation */}
                    <Card className="lg:col-span-3 border-none bg-medical-teal-deep rounded-[40px] shadow-2xl relative overflow-hidden min-h-[400px]">
                        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10" />
                        <CardHeader className="relative z-10 p-10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-3xl font-black italic tracking-tighter">Cluster Detection Grid</CardTitle>
                                <div className="flex items-center space-x-2 text-medical-teal animate-pulse">
                                    <div className="h-2 w-2 rounded-full bg-medical-teal" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Active Surveillance</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-full flex items-center justify-center relative">
                            {/* Map Skeleton / Abstract Map Grid */}
                            <div className="grid grid-cols-10 grid-rows-6 gap-2 w-full max-w-4xl opacity-40">
                                {Array.from({ length: 60 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "aspect-square rounded-lg border border-white/10 transition-colors",
                                            i === 24 ? "bg-emergency-red shadow-[0_0_50px_#ef4444]" :
                                                i === 25 || i === 34 ? "bg-warning-amber/40" :
                                                    "bg-white/5"
                                        )}
                                    />
                                ))}
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 text-center">
                                <AlertCircle size={48} className="text-emergency-red mx-auto mb-4 animate-bounce" />
                                <div className="text-lg font-black text-white italic tracking-tighter">Pathogen Cluster!</div>
                                <div className="text-[10px] font-bold text-white/60 uppercase mt-1 tracking-widest">Awaiting Ground Verification</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats & Tools */}
                    <div className="space-y-8">
                        <StatCard icon={<Users />} title="Citizens Registered" value="1,284" sub="+12 today" />
                        <StatCard icon={<Activity />} title="Triage Events" value="482" sub="Last 24h" />
                        <StatCard icon={<ShieldCheck />} title="Record Verity" value="94.2%" sub="Sub-clinical" />
                    </div>
                </div>

                <div className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-medical-teal-deep dark:text-white italic tracking-tighter">Sector Citizens</h2>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-none bg-white shadow-sm font-bold text-sm focus:ring-2 focus:ring-medical-teal"
                                placeholder="Search by UID / Name..."
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {sectorPatients.map(p => (
                            <Card key={p.id} className="p-8 border-none shadow-xl hover:translate-y-[-5px] transition-all group rounded-[32px]">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-medical-teal group-hover:bg-medical-teal group-hover:text-white transition-all">
                                        <Users size={32} />
                                    </div>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic",
                                        p.risk > 80 ? "bg-emergency-red/10 text-emergency-red shadow-[0_0_12px_#ef444422]" :
                                            p.risk > 40 ? "bg-warning-amber/10 text-warning-amber" :
                                                "bg-medical-teal/10 text-medical-teal"
                                    )}>
                                        Risk: {p.risk}
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-medical-teal-deep leading-none mb-1 italic">{p.name}</h3>
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest">Age {p.age} • Baseline: {p.baseline}</p>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-medical-teal hover:text-white transition-all">
                                        Open Record
                                    </Button>
                                    <Button className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-medical-teal hover:bg-medical-teal/90">
                                        Deploy AI
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatCard({ icon, title, value, sub }: any) {
    return (
        <Card className="p-8 border-none shadow-xl rounded-[32px] bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-gray-50 group-hover:text-medical-teal/10 transition-colors">
                {React.cloneElement(icon, { size: 64 })}
            </div>
            <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-medical-teal mb-4">{title}</div>
                <div className="text-4xl font-black text-medical-teal-deep italic mb-1 tracking-tighter">{value}</div>
                <div className="text-[10px] font-bold text-muted italic">{sub}</div>
            </div>
        </Card>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
