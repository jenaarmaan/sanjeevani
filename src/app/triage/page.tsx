"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, AlertTriangle, CheckCircle2, Info, Activity } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/core/hooks/useAuth";
import { useChat } from "ai/react";

import { encryptData } from "@/core/utils/crypto";

export default function TriagePage() {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showRiskScore, setShowRiskScore] = useState(false);
    const [riskData, setRiskData] = useState<any>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading: isAiLoading } = useChat({
        api: "/api/triage",
        initialMessages: [
            { id: "initial", role: "assistant", content: "Hello, I am Sanjeevani AI. I will help you assess your current health risk. What symptoms are you experiencing today?" }
        ],
        onFinish: async () => {
            // Trigger analysis after a substantial conversation
            if (messages.length >= 4 && !showRiskScore) {
                performRiskAnalysis();
            }
        }
    });

    const performRiskAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/triage/analyze", {
                method: "POST",
                body: JSON.stringify({ messages }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            setRiskData(data);
            setShowRiskScore(true);

            if (user) {
                // Encrypt Sensitive PHI before saving to Firestore
                const encryptedConversation = encryptData(messages.map(m => ({ id: m.id, role: m.role, content: m.content })));
                const encryptedSummary = encryptData(data.summary);
                const encryptedRedFlags = encryptData(data.redFlags);

                await addDoc(collection(db, "triage_sessions"), {
                    patientId: user.uid,
                    patientName: user.displayName,
                    createdAt: serverTimestamp(),
                    conversation: encryptedConversation, // SECURE
                    riskScore: data.riskScore,
                    priority: data.priority,
                    summary: encryptedSummary, // SECURE
                    redFlags: encryptedRedFlags, // SECURE
                    status: "pending",
                    isEncrypted: true
                });
            }
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-medical-teal-deep dark:text-white">AI Health Triage</h1>
                    <p className="text-muted">Conversational medical assessment for rural accessibility.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-teal/10 text-medical-teal">
                    <Activity className="animate-pulse" />
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Chat Interface */}
                <div className={cn("col-span-12 transition-all duration-500", showRiskScore ? "lg:col-span-7" : "lg:col-span-12")}>
                    <Card className="flex h-[600px] flex-col justify-between overflow-hidden border-none shadow-2xl shadow-medical-teal/5">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <AnimatePresence>
                                {messages.map((m) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "flex max-w-[80%] flex-col rounded-2xl p-4 shadow-sm",
                                            m.role === "user"
                                                ? "ml-auto bg-medical-teal text-white rounded-tr-none"
                                                : "bg-gray-100 text-medical-teal-deep dark:bg-medical-teal-deep/50 dark:text-white rounded-tl-none"
                                        )}
                                    >
                                        <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {(isAiLoading || isAnalyzing) && (
                                <div className="flex space-x-2 p-2">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-medical-teal" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-medical-teal [animation-delay:-0.15s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-medical-teal [animation-delay:-0.3s]" />
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="border-t p-4 bg-gray-50 dark:bg-black/20">
                            <div className="flex items-center space-x-2">
                                <Button type="button" variant="ghost" size="sm" className="rounded-full !p-3 hover:bg-medical-teal/20 text-medical-teal">
                                    <Mic size={24} />
                                </Button>
                                <input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Describe how you feel..."
                                    className="flex-1 rounded-xl border-none bg-white p-4 text-sm focus:ring-2 focus:ring-medical-teal shadow-inner dark:bg-medical-teal-deep/30 dark:text-white"
                                />
                                <Button type="submit" size="sm" className="rounded-xl !p-4" disabled={isAiLoading || !input.trim()}>
                                    <Send size={20} />
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Risk Score Display */}
                {showRiskScore && riskData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-5"
                    >
                        <Card className="border-none bg-medical-teal-deep text-white shadow-2xl shadow-medical-teal/20 h-full overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-white">Assessment Result</CardTitle>
                                <CardDescription className="text-medical-teal-soft/70">Analysis complete</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="h-40 w-40 transform -rotate-90">
                                            <circle
                                                className="text-white/10"
                                                strokeWidth="8"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="70" cx="80" cy="80"
                                            />
                                            <motion.circle
                                                initial={{ strokeDashoffset: 440 }}
                                                animate={{ strokeDashoffset: 440 - (440 * riskData.riskScore) / 100 }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={cn(
                                                    riskData.priority === "critical" || riskData.priority === "high" ? "text-emergency-red" : "text-warning-amber"
                                                )}
                                                strokeWidth="8"
                                                strokeDasharray={440}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="70" cx="80" cy="80"
                                            />
                                        </svg>
                                        <span className="absolute text-4xl font-black">{riskData.riskScore}%</span>
                                    </div>
                                    <p className={cn(
                                        "mt-4 text-sm font-bold uppercase tracking-widest",
                                        riskData.priority === "critical" || riskData.priority === "high" ? "text-emergency-red" : "text-warning-amber"
                                    )}>
                                        {riskData.priority} Risk
                                    </p>
                                </div>

                                <div className="space-y-4 rounded-xl bg-white/5 p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-0.5 rounded-full bg-warning-amber/20 p-1 text-warning-amber">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <p className="text-xs leading-relaxed text-medical-teal-soft/90">
                                            {riskData.summary}
                                        </p>
                                    </div>
                                    {riskData.redFlags.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-[10px] font-black uppercase text-medical-teal-soft/50">Red Flags Detected</p>
                                            {riskData.redFlags.map((flag: string) => (
                                                <div key={flag} className="flex items-center space-x-2 text-[10px] text-emergency-red">
                                                    <div className="h-1 w-1 rounded-full bg-emergency-red" />
                                                    <span>{flag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Button className="w-full" variant="danger" onClick={() => window.alert("Emergency SOS Activated!")}>
                                        Call Emergency Support
                                    </Button>
                                    <Button className="w-full border-white/20 text-white" variant="outline">
                                        View Protocol
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
