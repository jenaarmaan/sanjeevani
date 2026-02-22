"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, MapPin, Search, Calendar, CheckSquare, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function FieldWorkerPortal() {
    const [isOnline, setIsOnline] = useState(true);

    // Mock village data
    const villageQueue = [
        { id: "1", name: "Ramesh K.", age: 65, location: "Block C - Sector 4", priority: "High", task: "Vitals Sync" },
        { id: "2", name: "Sita Devi", age: 28, location: "East Village Hub", priority: "Medium", task: "Prenatal Check" },
        { id: "3", name: "Arjun M.", age: 42, location: "Block A - Primary", priority: "Low", task: "Follow-up" },
    ];

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-medical-teal-deep dark:text-white">Field Operations</h1>
                    <p className="text-muted mt-2">Offline-first community healthcare dashboard.</p>
                </div>

                {/* Connection Status Widget */}
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl border ${isOnline ? "border-medical-teal bg-medical-teal/10 text-medical-teal" : "border-emergency-red bg-emergency-red/10 text-emergency-red"
                    }`}>
                    {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                    <span className="text-sm font-black uppercase tracking-widest">{isOnline ? "Live Sync" : "Offline Mode"}</span>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search patients by name or ID..."
                        className="w-full rounded-2xl border-none bg-white p-5 pl-14 shadow-lg focus:ring-2 focus:ring-medical-teal text-lg"
                    />
                </div>

                <div className="flex space-x-4 mb-4">
                    <Button variant="outline" className="flex-1 rounded-2xl border-2 py-6">
                        <Calendar size={20} className="mr-2" /> Today's Plan
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-2xl border-2 py-6">
                        <CheckSquare size={20} className="mr-2" /> My Tasks (12)
                    </Button>
                </div>

                <h3 className="font-black text-xs uppercase tracking-[0.3em] text-muted mb-2 px-1">Active Field Queue</h3>

                <div className="space-y-4">
                    {villageQueue.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <Card className="border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group">
                                <CardContent className="flex items-center justify-between p-6">
                                    <div className="flex items-center space-x-5">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl ${item.priority === "High" ? "bg-emergency-red" :
                                                item.priority === "Medium" ? "bg-warning-amber" : "bg-medical-teal"
                                            }`}>
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-xl font-black text-medical-teal-deep dark:text-white capitalize">{item.name}</h4>
                                                <span className="text-xs font-bold text-muted">Age: {item.age}</span>
                                            </div>
                                            <div className="flex items-center text-muted font-medium text-sm mt-1">
                                                <MapPin size={14} className="mr-1" /> {item.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="hidden md:block text-right mr-4">
                                            <div className="text-[10px] font-black uppercase text-medical-teal">{item.task}</div>
                                            <div className="text-xs font-bold text-muted">Awaiting Visit</div>
                                        </div>
                                        <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-medical-teal group-hover:bg-medical-teal group-hover:text-white transition-colors">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <Button size="lg" className="w-full rounded-[24px] py-8 text-xl shadow-2xl shadow-medical-teal/30 mt-8">
                    <Plus size={24} className="mr-2" /> Register New Patient
                </Button>
            </div>
        </div>
    );
}
