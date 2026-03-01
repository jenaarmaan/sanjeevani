"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Globe, MapPin, Users, TrendingUp, Filter, Download } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function AnalyticsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-medical-teal-deep dark:text-white">Public Health Insights</h1>
                        <p className="text-muted mt-2">Real-time disease surveillance and risk cluster analysis dashboard.</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" size="sm">
                            <Filter size={18} className="mr-2" /> Regional Filter
                        </Button>
                        <Button size="sm">
                            <Download size={18} className="mr-2" /> Export Data
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4 mb-10">
                    <StatsCard title="Total Citizens" value="1.2M" sub="Verified Health IDs" icon={<Users />} color="medical-teal" />
                    <StatsCard title="Avg Risk Score" value="7.4" sub="District Mean" icon={<Activity />} color="warning-amber" />
                    <StatsCard title="Active SOS" value="24" sub="Last 24 Hours" icon={<TrendingUp />} color="emergency-red" />
                    <StatsCard title="Consultations" value="850" sub="Weekly Total" icon={<Globe />} color="medical-teal" />
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Real-time Risk Heatmap Surveillance */}
                    <div className="lg:col-span-8">
                        <Card className="h-[500px] border-none shadow-2xl relative overflow-hidden bg-medical-teal-deep/5 flex flex-col p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-medical-teal-deep">Live Risk Grid</h3>
                                    <p className="text-xs text-muted">Localized disease cluster detection (Sector 1 - 25)</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 rounded-full bg-emergency-red animate-ping" />
                                    <span className="text-[10px] font-bold text-emergency-red uppercase">Live Outbreak Detect</span>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-5 gap-2 opacity-80">
                                {[...Array(25)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className={cn(
                                            "rounded-xl border border-white shadow-sm flex items-center justify-center text-[8px] font-black text-white/50",
                                            i === 7 || i === 12 || i === 18 ? "bg-emergency-red animate-pulse" :
                                                i % 4 === 0 ? "bg-warning-amber" : "bg-medical-teal/40"
                                        )}
                                    >
                                        S-{i + 1}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-muted uppercase">
                                <div className="flex items-center space-x-3">
                                    <span className="flex items-center"><div className="h-2 w-2 rounded-full bg-medical-teal mr-1" /> Stable</span>
                                    <span className="flex items-center"><div className="h-2 w-2 rounded-full bg-warning-amber mr-1" /> Elevated</span>
                                    <span className="flex items-center"><div className="h-2 w-2 rounded-full bg-emergency-red mr-1" /> Outbreak</span>
                                </div>
                                <span>Updated: Just Now</span>
                            </div>
                        </Card>
                    </div>

                    {/* Demographics Widget */}
                    <div className="lg:col-span-4">
                        <Card className="h-full border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg">Risk Demographics</CardTitle>
                                <CardDescription>By population segment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <DemographicBar label="Pediatric (0-12)" value={25} color="bg-medical-teal" />
                                <DemographicBar label="Adult (13-59)" value={60} color="bg-warning-amber" />
                                <DemographicBar label="Geriatric (60+)" value={15} color="bg-emergency-red" />

                                <div className="mt-8 rounded-2xl bg-gray-50 p-6">
                                    <h4 className="font-bold text-sm text-medical-teal-deep mb-2">Public Health Status</h4>
                                    <p className="text-xs text-muted leading-relaxed">
                                        Overall surveillance quality is 88%. Data suggests a 12% rise in respiratory triage queries in the Northern zones.
                                    </p>
                                    <Button variant="ghost" size="sm" className="mt-4 p-0 text-medical-teal font-black text-[10px]">
                                        VIEW EPIDEMIOLOGY REPORT →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatsCard({ title, value, sub, icon, color }: any) {
    const iconColor = color === "medical-teal" ? "text-medical-teal bg-medical-teal/10" :
        color === "emergency-red" ? "text-emergency-red bg-emergency-red/10" :
            "text-warning-amber bg-warning-amber/10";

    return (
        <Card className="border-none shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-widest">{title}</p>
                    <div className="text-3xl font-black text-medical-teal-deep dark:text-white mt-1">{value}</div>
                    <p className="text-[10px] text-muted font-bold mt-1">{sub}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconColor}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            </div>
        </Card>
    );
}

function DemographicBar({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-medical-teal-deep">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`${color} h-full rounded-full`}
                />
            </div>
        </div>
    );
}
