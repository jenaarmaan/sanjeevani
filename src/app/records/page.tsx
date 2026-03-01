"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Calendar, User, Search, Filter, Plus, Activity, AlertCircle, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/core/hooks/useAuth";

import { encryptData } from "@/core/utils/crypto";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function RecordsPage() {
    const { user } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzedData, setAnalyzedData] = useState<any>(null);

    const saveToVault = async () => {
        if (!user || !analyzedData) return;

        try {
            const encryptedFindings = encryptData({
                summary: analyzedData.summary,
                vitalMetrics: analyzedData.vitalMetrics,
                redFlags: analyzedData.riskDetection
            });

            await addDoc(collection(db, "health_records"), {
                patientId: user.uid,
                title: analyzedData.documentType,
                findings: encryptedFindings, // SECURE
                createdAt: serverTimestamp(),
                isEncrypted: true
            });

            setAnalyzedData(null);
            alert("Record securely stored in your personal vault.");
        } catch (error) {
            console.error("Storage failed:", error);
        }
    };

    const mockRecords = [
        { id: "1", title: "Blood Work Summary", date: "March 12, 2025", doctor: "Dr. Aakash Mehta", type: "Lab Report", status: "Analyzed" },
        { id: "2", title: "Cardiology Screening", date: "Feb 28, 2025", doctor: "Dr. Sarah Khan", type: "Imaging", status: "Verified" },
        { id: "3", title: "Annual Physical", date: "Jan 15, 2025", doctor: "City General Clinic", type: "General", status: "Stored" },
    ];

    const handleFileUpload = async (file: File) => {
        setIsAnalyzing(true);
        try {
            // 1. Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];

                // 2. Send to AI OCR
                const response = await fetch("/api/records/analyze", {
                    method: "POST",
                    body: JSON.stringify({ image: base64 }),
                    headers: { "Content-Type": "application/json" },
                });

                const data = await response.json();
                setAnalyzedData(data);
                setIsAnalyzing(false);
            };
        } catch (error) {
            console.error("OCR Analysis failed:", error);
            setIsAnalyzing(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={["patient", "admin"]}>
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-medical-teal-deep dark:text-white uppercase italic">Health Vault</h1>
                        <p className="text-muted mt-2">Secure AI extraction for medical documents & clinical reports.</p>
                    </div>
                    <Button className="rounded-2xl shadow-lg">
                        <Plus size={20} className="mr-2" /> New Record
                    </Button>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Upload & Analysis Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card
                            className={`border-2 border-dashed h-[300px] flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${isDragging ? "border-medical-teal bg-medical-teal/5" : "border-medical-teal/20"
                                } ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const file = e.dataTransfer.files[0];
                                if (file) handleFileUpload(file);
                            }}
                        >
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-medical-teal border-t-transparent mb-4" />
                                    <p className="font-bold text-medical-teal animate-pulse">Neural OCR Extraction...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="h-16 w-16 rounded-full bg-medical-teal/10 flex items-center justify-center text-medical-teal mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="font-bold text-lg text-medical-teal-deep dark:text-white">Drop Medical Report</h3>
                                    <p className="text-xs text-muted mt-2 max-w-[200px]">
                                        PDF, JPG or PNG. Our AI will automatically extract vitals and key metrics.
                                    </p>
                                </>
                            )}
                        </Card>

                        <AnimatePresence>
                            {analyzedData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative"
                                >
                                    <Card className="bg-medical-teal-deep text-white border-none p-6 shadow-2xl">
                                        <button
                                            onClick={() => setAnalyzedData(null)}
                                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                                        >
                                            <X size={18} />
                                        </button>
                                        <div className="flex items-center space-x-2 text-medical-teal mb-4">
                                            <Activity size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">AI Extraction Result</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{analyzedData.documentType}</h3>
                                        <p className="text-xs text-medical-teal-soft/80 leading-relaxed mb-6">
                                            {analyzedData.summary}
                                        </p>

                                        <div className="space-y-3">
                                            {analyzedData.vitalMetrics.map((v: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                                                    <span className="text-xs font-medium text-medical-teal-soft">{v.label}</span>
                                                    <span className={`text-xs font-bold ${v.isNormal ? "text-medical-teal" : "text-warning-amber"}`}>
                                                        {v.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={saveToVault}
                                            className="w-full mt-6 bg-medical-teal hover:bg-medical-teal/80 text-[10px] font-black uppercase"
                                        >
                                            Confirm & Save to Vault
                                        </Button>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Existing Records Section */}
                    <div className="lg:col-span-8">
                        <div className="mb-6 flex space-x-4">
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search your records..."
                                    className="w-full rounded-2xl border-border bg-white pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-medical-teal dark:bg-medical-teal-deep/20 dark:text-white shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {mockRecords.map((record) => (
                                <motion.div
                                    key={record.id}
                                    whileHover={{ x: 5 }}
                                >
                                    <Card className="flex items-center justify-between p-5 hover:border-medical-teal/40 group cursor-pointer border-none shadow-sm dark:bg-medical-teal-deep/10">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-medical-teal group-hover:bg-medical-teal group-hover:text-white transition-colors dark:bg-black/20">
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
                                                {record.status}
                                            </span>
                                            <div className="mt-2 text-[10px] text-muted uppercase font-bold flex items-center justify-end">
                                                <CheckCircle size={10} className="mr-1 text-medical-teal" /> Secure
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
