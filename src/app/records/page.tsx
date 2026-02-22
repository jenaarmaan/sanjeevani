"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Calendar, User, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function RecordsPage() {
    const [isDragging, setIsDragging] = useState(false);

    const mockRecords = [
        { id: "1", title: "Blood Work Summary", date: "March 12, 2025", doctor: "Dr. Aakash Mehta", type: "Lab Report" },
        { id: "2", title: "Cardiology Screening", date: "Feb 28, 2025", doctor: "Dr. Sarah Khan", type: "Imaging" },
        { id: "3", title: "Annual Physical", date: "Jan 15, 2025", doctor: "City General Clinic", type: "General" },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-medical-teal-deep dark:text-white">Health Records</h1>
                    <p className="text-muted mt-2">Secure, encrypted medical history with AI-powered OCR summaries.</p>
                </div>
                <Button className="rounded-2xl shadow-lg">
                    <Plus size={20} className="mr-2" /> New Record
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Upload Section */}
                <div className="lg:col-span-4 transition-all duration-300">
                    <Card
                        className={`border-2 border-dashed h-[300px] flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? "border-medical-teal bg-medical-teal/5" : "border-medical-teal/20"
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                    >
                        <div className="h-16 w-16 rounded-full bg-medical-teal/10 flex items-center justify-center text-medical-teal mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="font-bold text-lg text-medical-teal-deep dark:text-white">Upload Medical Documents</h3>
                        <p className="text-sm text-muted mt-2 max-w-[200px]">
                            Drop PDF, JPG or DICOM files here. AI will auto-summarize them.
                        </p>
                    </Card>

                    <Card className="mt-8 border-none bg-medical-teal/5 p-6">
                        <div className="flex items-center space-x-3 text-medical-teal mb-4">
                            <FileText size={20} />
                            <h4 className="font-bold uppercase tracking-widest text-xs">Storage Health</h4>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-medical-teal h-2 rounded-full w-[45%]" />
                        </div>
                        <p className="mt-4 text-[10px] text-muted font-black uppercase">4.5 GB of 10 GB Encrypted Storage Used</p>
                    </Card>
                </div>

                {/* Records Listing */}
                <div className="lg:col-span-8">
                    <div className="mb-6 flex space-x-4">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                placeholder="Search records, doctors, or hospitals..."
                                className="w-full rounded-xl border-border bg-white pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-medical-teal"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            <Filter size={18} className="mr-2" /> Filter
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {mockRecords.map((record) => (
                            <motion.div
                                key={record.id}
                                whileHover={{ x: 5 }}
                            >
                                <Card className="flex items-center justify-between p-5 hover:border-medical-teal/40 group">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-medical-teal group-hover:bg-medical-teal group-hover:text-white transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-medical-teal-deep dark:text-white">{record.title}</h4>
                                            <div className="flex space-x-3 mt-1 text-xs text-muted font-medium">
                                                <span className="flex items-center"><Calendar size={12} className="mr-1" /> {record.date}</span>
                                                <span className="flex items-center"><User size={12} className="mr-1" /> {record.doctor}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-3 py-1 rounded-full bg-medical-teal-soft/30 text-[10px] font-black text-medical-teal uppercase">
                                            {record.type}
                                        </span>
                                        <div className="mt-2 text-[10px] text-muted uppercase font-bold">Encrypted</div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
