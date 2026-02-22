"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Globe, MapPin, Users, TrendingUp, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
                    {/* Risk Map Placeholder */}
                    <div className="lg:col-span-8">
                        <Card className="h-[500px] border-none shadow-2xl relative overflow-hidden bg-gray-50 flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:20px_20px]" />
                            <div className="text-center relative z-10">
                                <MapPin size={60} className="text-medical-teal mx-auto mb-4 animate-bounce" />
                                <h3 className="text-xl font-bold text-medical-teal-deep">Surveillance Engine</h3>
                                <p className="text-muted text-sm mt-2">Spatial heatmap of localized disease clusters.</p>
                                <div className="mt-8 flex justify-center space-x-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-medical-teal/20" />
                                    ))}
                                </div>
                            </div>

                            {/* Fake UI Overlay */}
                            <div className="absolute bottom-6 left-6 p-4 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-medical-teal/20 max-w-[200px]">
                                <div className="text-[10px] font-black uppercase text-medical-teal mb-2">Live Activity</div>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 rounded-full bg-emergency-red animate-ping" />
                                    <span className="text-xs font-bold text-medical-teal-deep tracking-tighter">New SOS: Mysuru Sector-4</span>
                                </div>
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
