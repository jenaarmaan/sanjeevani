"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, FileText, CheckCircle, Video, Filter, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function ClinicalPortal() {
    const patientTriage = [
        { id: "1", name: "Aman Singh", risk: 85, symptoms: "Acute Respiratory, Fever", status: "Critical", time: "10m ago" },
        { id: "2", name: "Priya Rao", risk: 42, symptoms: "Chronic Joint Pain", status: "Monitor", time: "25m ago" },
        { id: "3", name: "Kushal Kumar", risk: 68, symptoms: "Moderate GI Distress", status: "Stable", time: "1h ago" },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-medical-teal text-white flex items-center justify-center">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-medical-teal-deep dark:text-white">Clinical Oversight</h1>
                        <p className="text-muted">Physician dashboard for high-priority triage management.</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                        <Filter size={18} className="mr-2" /> All Districts
                    </Button>
                    <Button size="sm" variant="danger">
                        <AlertCircle size={18} className="mr-2" /> View Emergencies
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Triage Queue */}
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Triage Queue</CardTitle>
                                <CardDescription>Priority list based on AI risk assessment</CardDescription>
                            </div>
                            <div className="text-[10px] font-black uppercase text-medical-teal bg-medical-teal/5 px-3 py-1 rounded-full">
                                LIVE SYNC ACTIVE
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b text-[10px] font-black uppercase tracking-widest text-muted">
                                            <th className="pb-4">Patient Profile</th>
                                            <th className="pb-4">Risk Score</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4">Last Activity</th>
                                            <th className="pb-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {patientTriage.map((p) => (
                                            <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4">
                                                    <div className="font-bold text-medical-teal-deep">{p.name}</div>
                                                    <div className="text-xs text-muted">{p.symptoms}</div>
                                                </td>
                                                <td className="py-4">
                                                    <div className={`text-sm font-black ${p.risk > 70 ? "text-emergency-red" : "text-warning-amber"}`}>
                                                        {p.risk}%
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.status === "Critical" ? "bg-emergency-red/10 text-emergency-red" :
                                                            p.status === "Monitor" ? "bg-warning-amber/10 text-warning-amber" :
                                                                "bg-medical-teal/10 text-medical-teal"
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-xs font-medium text-muted">
                                                    {p.time}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                                            <MessageSquare size={14} />
                                                        </Button>
                                                        <Button variant="secondary" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase">
                                                            Review AI
                                                        </Button>
                                                        <Button size="sm" className="h-8 rounded-lg">
                                                            <Video size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Clinical Stats Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-medical-teal-deep text-white border-none p-6">
                        <h4 className="text-xs font-bold text-medical-teal-soft uppercase mb-4 tracking-tighter">Consultation Utilization</h4>
                        <div className="text-5xl font-black mb-2">94<span className="text-xl opacity-40">%</span></div>
                        <p className="text-xs text-medical-teal-soft/70">Average response time: <b>4m 22s</b></p>
                        <div className="mt-8 space-y-2">
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-medical-teal w-[94%]" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Medical History Sync</CardTitle>
                            <CardDescription>Verified via OCR Neural Engine</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <FileText size={18} className="text-medical-teal" />
                                    <span className="text-xs font-bold text-medical-teal-deep">Cardio_Screen_V2.pdf</span>
                                </div>
                                <CheckCircle size={16} className="text-medical-teal" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <FileText size={18} className="text-medical-teal" />
                                    <span className="text-xs font-bold text-medical-teal-deep">Lab_2025_03_12.jpg</span>
                                </div>
                                <CheckCircle size={16} className="text-medical-teal" />
                            </div>
                            <Button variant="ghost" className="w-full text-xs font-black uppercase">View All Records</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
