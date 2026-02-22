"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, AlertTriangle, CheckCircle2, Info, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/core/hooks/useAuth";

type Message = {
    id: string;
    type: "bot" | "user";
    text: string;
};

export default function TriagePage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", type: "bot", text: "Hello, I am Sanjeevani AI. I will help you assess your current health risk. What symptoms are you experiencing today?" }
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRiskScore, setShowRiskScore] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), type: "user", text: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsProcessing(true);

        try {
            // Phase 1 Hardware: Persist to Firestore
            if (!sessionId && user) {
                const docRef = await addDoc(collection(db, "triage_sessions"), {
                    patientId: user.uid,
                    patientName: user.displayName,
                    createdAt: serverTimestamp(),
                    conversation: newMessages,
                    status: "pending",
                    priority: "medium",
                    riskScore: 0
                });
                setSessionId(docRef.id);
            } else if (sessionId) {
                await updateDoc(doc(db, "triage_sessions", sessionId), {
                    conversation: newMessages,
                    lastUpdated: serverTimestamp()
                });
            }

            // Mocking AI Response + Risk Analysis
            setTimeout(async () => {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    type: "bot",
                    text: "Understood. I've noted those symptoms. Based on your input, I see a pattern relating to respiratory stress. Do you have a fever?"
                };
                const finalMessages = [...newMessages, botMsg];
                setMessages(finalMessages);
                setIsProcessing(false);

                if (sessionId) {
                    await updateDoc(doc(db, "triage_sessions", sessionId), {
                        conversation: finalMessages,
                        riskScore: 65, // Mock score
                        priority: "high"
                    });
                }

                if (messages.length >= 2) {
                    setShowRiskScore(true);
                }
            }, 1500);
        } catch (error) {
            console.error("Error persisting triage session:", error);
            setIsProcessing(false);
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
                                        initial={{ opacity: 0, x: m.type === "user" ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "flex max-w-[80%] flex-col rounded-2xl p-4 shadow-sm",
                                            m.type === "user"
                                                ? "ml-auto bg-medical-teal text-white rounded-tr-none"
                                                : "bg-gray-100 text-medical-teal-deep dark:bg-medical-teal-deep/50 dark:text-white rounded-tl-none"
                                        )}
                                    >
                                        <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {isProcessing && (
                                <div className="flex space-x-2 p-2">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-medical-teal" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-medical-teal [animation-delay:-0.15s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-medical-teal [animation-delay:-0.3s]" />
                                </div>
                            )}
                        </div>

                        <div className="border-t p-4 bg-gray-50 dark:bg-black/20">
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" className="rounded-full !p-3 hover:bg-medical-teal/20 text-medical-teal">
                                    <Mic size={24} />
                                </Button>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Describe how you feel..."
                                    className="flex-1 rounded-xl border-none bg-white p-4 text-sm focus:ring-2 focus:ring-medical-teal shadow-inner"
                                />
                                <Button size="sm" onClick={handleSend} className="rounded-xl !p-4">
                                    <Send size={20} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Risk Score Display (Phase 1 Mock) */}
                {showRiskScore && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-5"
                    >
                        <Card className="border-none bg-medical-teal-deep text-white shadow-2xl shadow-medical-teal/20">
                            <CardHeader>
                                <CardTitle className="text-white">Assessment Result</CardTitle>
                                <CardDescription className="text-medical-teal-soft/70">Analysis complete</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="h-32 w-32">
                                            <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                            <circle className="text-warning-amber" strokeWidth="8" strokeDasharray={364} strokeDashoffset={364 - (364 * 65) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                        </svg>
                                        <span className="absolute text-3xl font-black">65%</span>
                                    </div>
                                    <p className="mt-4 text-sm font-bold uppercase tracking-widest text-warning-amber">Moderate Risk</p>
                                </div>

                                <div className="space-y-4 rounded-xl bg-white/5 p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-0.5 rounded-full bg-warning-amber/20 p-1 text-warning-amber">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <p className="text-xs leading-relaxed text-medical-teal-soft/90">
                                            High probability of upper respiratory infection detected. Monitor oxygen levels.
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-0.5 rounded-full bg-medical-teal/20 p-1 text-medical-teal">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <p className="text-xs leading-relaxed text-medical-teal-soft/90">
                                            Vitals sync successful with rural health worker dashboard.
                                        </p>
                                    </div>
                                </div>

                                <Button className="w-full" variant="danger">
                                    Call Emergency Support
                                </Button>
                                <Button className="w-full" variant="outline">
                                    Download Protocol
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Re-defining cn for this scope
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
