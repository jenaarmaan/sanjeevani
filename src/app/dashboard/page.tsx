"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Shield, FileText, Smartphone, ArrowUpRight, TrendingUp, AlertCircle, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/core/hooks/useAuth";
import { useState, useEffect } from "react";

export default function DashboardPage() {
    const { profile } = useAuth();
    const [localBackendActive, setLocalBackendActive] = useState(false);

    useEffect(() => {
        const checkBackend = async () => {
            try {
                const res = await fetch("http://localhost:5000/");
                if (res.ok) setLocalBackendActive(true);
            } catch (e) {
                setLocalBackendActive(false);
            }
        };
        checkBackend();
    }, []);

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-10 max-w-7xl">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-medical-teal mb-2">Welcome Back, {profile?.displayName || "Citizen"}</h2>
                        <h1 className="text-4xl font-black text-medical-teal-deep dark:text-white">Your Health Intelligence</h1>
                    </div>
                    <div className="flex space-x-3 items-center">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${localBackendActive ? "bg-medical-teal/10 text-medical-teal border border-medical-teal/20" : "bg-gray-100 text-gray-400"}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${localBackendActive ? "bg-medical-teal animate-pulse" : "bg-gray-400"}`} />
                            <span>{localBackendActive ? "Local Node Active" : "Local Node Offline"}</span>
                        </div>
                        <Button variant="outline" size="sm">
                            <Smartphone size={18} className="mr-2" /> Sync Device
                        </Button>
                        <Link href="/triage">
                            <Button size="sm">New Assessment</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Main Risk Widget */}
                    <div className="md:col-span-8">
                        <Card className="bg-medical-teal-deep text-white border-none p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-medical-teal-soft/20 scale-150">
                                <Shield size={160} strokeWidth={1} />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
                                <div className="text-center md:text-left">
                                    <p className="text-sm font-bold text-medical-teal-soft uppercase tracking-widest mb-4">Current Protection Score</p>
                                    <div className="text-7xl font-black">92<span className="text-3xl text-medical-teal">/100</span></div>
                                    <div className="mt-4 inline-flex items-center rounded-full bg-medical-teal/20 px-4 py-1 text-xs font-bold text-medical-teal-soft border border-medical-teal/30">
                                        <TrendingUp size={14} className="mr-2" /> STABLE HEALTH ZONE
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold">Health Trajectory</h3>
                                        <Link href="/analytics" className="text-[10px] font-black uppercase text-medical-teal hover:underline decoration-2 underline-offset-4">
                                            Vitals Audit →
                                        </Link>
                                    </div>

                                    {/* SVG Sparkline for Trend Visualization */}
                                    <div className="h-24 w-full bg-white/5 rounded-2xl border border-white/10 p-4 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0d9488_0.5px,transparent_0.5px)] [background-size:10px:10px]" />
                                        <svg viewBox="0 0 100 20" className="w-full h-full drop-shadow-[0_0_8px_rgba(13,148,136,0.3)]">
                                            <motion.path
                                                d="M 0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 6 T 100 10"
                                                fill="transparent"
                                                stroke="#0d9488"
                                                strokeWidth="1.5"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 2, ease: "easeInOut" }}
                                            />
                                            <motion.circle
                                                cx="100" cy="10" r="1.5"
                                                fill="#0d9488"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1.5 }}
                                            />
                                        </svg>
                                        <div className="absolute bottom-2 left-4 text-[8px] font-black uppercase text-medical-teal-soft opacity-60">7-Day Wellness Index</div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <div className="rounded-2xl bg-white/5 p-4 flex-1 border border-white/5">
                                            <div className="text-xs font-black text-medical-teal-soft uppercase mb-1">Status</div>
                                            <div className="font-bold">Clinical Sync</div>
                                            <div className="text-[10px] opacity-60">Last sync: 2m ago</div>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 p-4 flex-1 border border-white/5">
                                            <div className="text-xs font-black text-medical-teal-soft uppercase mb-1">Alerts</div>
                                            <div className="font-bold text-medical-teal">0 Flags</div>
                                            <div className="text-[10px] opacity-60">Environment Stable</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <DashboardActionCard
                                href="/records"
                                icon={<FileText />}
                                title="Vault Health Records"
                                description="Securely stored documents with AI extraction."
                            />
                            <DashboardActionCard
                                href="/triage"
                                icon={<Activity />}
                                title="Symptom Checker"
                                description="Immediate AI triage for any new health concerns."
                            />
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="border-none shadow-xl bg-white dark:bg-medical-teal-deep/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <AlertCircle size={18} className="mr-2 text-warning-amber" /> Clinical Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <AlertItem
                                    title="Heatwave Advisory"
                                    desc="Stay hydrated. Temperatures in your region expected to exceed 42°C."
                                    color="amber"
                                />
                                <AlertItem
                                    title="Vaccination Due"
                                    desc="Your booster dose for Hepatitis B is scheduled for next week."
                                    color="teal"
                                />
                            </CardContent>
                        </Card>

                        {/* Medication Protocols (PRD 1D) */}
                        <Card className="border-none shadow-xl bg-gradient-to-br from-medical-teal-deep to-black text-white p-6 relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 opacity-10 text-medical-teal">
                                <Activity size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-black uppercase text-medical-teal tracking-widest mb-4">Daily Protocols</div>
                                <h4 className="text-xl font-black mb-6 italic">Preventive Schedule</h4>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-2 w-2 rounded-full bg-warning-amber" />
                                            <div>
                                                <div className="text-xs font-bold">Amlodipine 5mg</div>
                                                <div className="text-[10px] opacity-40 uppercase">2:00 PM • Hypertension</div>
                                            </div>
                                        </div>
                                        <Zap size={14} className="text-medical-teal" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between opacity-50">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-2 w-2 rounded-full bg-medical-teal" />
                                            <div>
                                                <div className="text-xs font-bold">Lipid Profile</div>
                                                <div className="text-[10px] opacity-40 uppercase">Due in 2 days</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-6 bg-white text-medical-teal-deep hover:bg-white/90 rounded-xl text-[10px] font-black uppercase py-6">
                                    Update Med Vault
                                </Button>
                            </div>
                        </Card>

                        <Card className="border-none shadow-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <Calendar size={18} className="mr-2 text-medical-teal" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-medical-teal before:via-medical-teal/20 before:to-transparent">
                                    <ActivityTimelineItem date="Today" title="Device Pulse Sync" />
                                    <ActivityTimelineItem date="Yesterday" title="OCR Analysis: Blood Report" />
                                    <ActivityTimelineItem date="Mar 14" title="Consultation Fixed" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function DashboardActionCard({ href, icon, title, description }: any) {
    return (
        <Link href={href}>
            <Card className="group hover:bg-medical-teal hover:border-medical-teal transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-medical-teal/10 rounded-xl flex items-center justify-center text-medical-teal group-hover:bg-white group-hover:text-medical-teal transition-colors">
                        {icon}
                    </div>
                    <ArrowUpRight className="text-muted group-hover:text-white" size={20} />
                </div>
                <h4 className="font-bold text-medical-teal-deep dark:text-white group-hover:text-white">{title}</h4>
                <p className="text-xs text-muted mt-2 group-hover:text-white/70 leading-relaxed">{description}</p>
            </Card>
        </Link>
    );
}

function AlertItem({ title, desc, color }: any) {
    const colorClass = color === "amber" ? "bg-warning-amber/20 text-warning-amber" : "bg-medical-teal/20 text-medical-teal";
    return (
        <div className={`p-4 rounded-2xl ${colorClass} border border-transparent`}>
            <div className="font-bold text-xs uppercase mb-1">{title}</div>
            <div className="text-[10px] leading-relaxed font-medium opacity-90">{desc}</div>
        </div>
    );
}

function ActivityTimelineItem({ date, title }: any) {
    return (
        <div className="relative pl-10">
            <div className="absolute left-0 h-10 w-10 rounded-full border-4 border-white dark:border-medical-teal-deep bg-medical-teal flex items-center justify-center text-white scale-75">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
            <div className="text-[10px] font-black uppercase text-medical-teal">{date}</div>
            <div className="text-sm font-bold text-medical-teal-deep dark:text-white">{title}</div>
        </div>
    );
}
