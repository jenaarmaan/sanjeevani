"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, AlertTriangle, CheckCircle2, Info, Activity, Disc } from "lucide-react";
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
    const [isRecording, setIsRecording] = useState(false);
    const [isLowLiteracy, setIsLowLiteracy] = useState(false);
    const [showRiskScore, setShowRiskScore] = useState(false);
    const [riskData, setRiskData] = useState<any>(null);

    const { messages, input, handleInputChange, handleSubmit, setInput, isLoading: isAiLoading } = useChat({
        api: "/api/triage",
        initialMessages: [
            { id: "initial", role: "assistant", content: "Hello, I am Sanjeevani AI. I will help you assess your current health risk. What symptoms are you experiencing today?" }
        ],
        onFinish: async (message) => {
            // Trigger analysis after a substantial conversation (4+ messages)
            if (messages.length >= 3 && !showRiskScore) {
                performRiskAnalysis();
            }
        }
    });

    // Voice Input Implementation (Web Speech API)
    const toggleRecording = () => {
        if (!isRecording) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.onstart = () => setIsRecording(true);
                recognition.onend = () => setIsRecording(false);
                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                };
                recognition.start();
            } else {
                alert("Speech recognition is not supported in this browser.");
            }
        } else {
            setIsRecording(false);
        }
    };

    const performRiskAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // 1. Neural AI Analysis (Gemini)
            const response = await fetch("/api/triage/analyze", {
                method: "POST",
                body: JSON.stringify({ messages }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();

            // 2. Hybrid Clinical Verification (Python Engine)
            // We feed the neural summary and conversation back for deterministic checks
            const clinicalResponse = await fetch("/api/triage/clinical-check", {
                method: "POST",
                body: JSON.stringify({
                    age: user?.metadata?.creationTime ? 30 : 25, // Fallback for demo
                    symptoms: {
                        fever: messages.some((m: any) => m.content.toLowerCase().includes("fever")),
                        breathlessness: messages.some((m: any) => m.content.toLowerCase().includes("breath") || m.content.toLowerCase().includes("short")),
                        chest_pain: messages.some((m: any) => m.content.toLowerCase().includes("chest")),
                        fatigue: messages.some((m: any) => m.content.toLowerCase().includes("tired") || m.content.toLowerCase().includes("fatigue")),
                    },
                    chronic_conditions: {
                        diabetes: false,
                        hypertension: false
                    },
                    metadata: {
                        neural_summary: data.summary,
                        neural_risk: data.riskScore
                    }
                }),
                headers: { "Content-Type": "application/json" },
            });
            const clinicalData = await clinicalResponse.json();

            // Merge findings
            // If clinical engine finds high risk, it overrides neural confidence
            const finalRiskScore = Math.max(data.riskScore, clinicalData.status === "success" ? (clinicalData.risk_level === "EMERGENCY" ? 100 : clinicalData.risk_level === "HIGH" ? 80 : 20) : 0);

            // Trigger Emergency Protocol if High Risk
            if (finalRiskScore > 80) {
                try {
                    await fetch("/api/emergency/alert", {
                        method: "POST",
                        body: JSON.stringify({
                            patientId: user?.uid || "Anonymous",
                            riskLevel: finalRiskScore,
                            details: clinicalData.status === "success" ? clinicalData.reasons : [],
                            location: "Mysuru Sector-4" // Placeholder for village detection
                        }),
                        headers: { "Content-Type": "application/json" }
                    });
                } catch (e) {
                    console.error("Emergency Alert failed:", e);
                }
            }

            setRiskData({
                ...data,
                riskScore: finalRiskScore,
                clinicalContext: clinicalData.explanation
            });
            setShowRiskScore(true);

            if (user) {
                // Encrypt Sensitive PHI before saving to Firestore
                // Re-stating the session data with clinical audit trace
                const sessionData = {
                    patientId: user.uid,
                    patientName: user.displayName,
                    createdAt: serverTimestamp(),
                    conversation: encryptData(messages.map((m: any) => ({ id: m.id, role: m.role, content: m.content }))),
                    riskScore: finalRiskScore,
                    priority: data.priority,
                    summary: encryptData(data.summary),
                    redFlags: encryptData(data.redFlags),
                    status: "pending",
                    isEncrypted: true,
                    clinicalAudit: clinicalData.status === "success" ? clinicalData.decision_trace : null
                };

                // A. Cloud Persistence (Firebase)
                await addDoc(collection(db, "triage_sessions"), sessionData);

                // B. Local Security Audit (Express Backend on Port 5000)
                try {
                    await fetch("http://localhost:5000/symptom-report", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: user.uid,
                            symptoms: messages.filter((m: any) => m.role === "user").map((m: any) => m.content),
                            severity: finalRiskScore > 80 ? "CRITICAL" : "MODERATE",
                            description: `Triage Summary: ${data.summary}`
                        })
                    });
                } catch (err) {
                    console.warn("Local security sync failed (offline).");
                }
            }
        } catch (err) {
            console.error("Risk analysis failure:", err);
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
                <div className="flex h-12 items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsLowLiteracy(!isLowLiteracy)}
                        className={cn("rounded-full border-2", isLowLiteracy ? "border-medical-teal text-medical-teal bg-medical-teal/5" : "border-gray-200")}
                    >
                        {isLowLiteracy ? "Standard Mode" : "Simplified Mode (Voice)"}
                    </Button>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-teal/10 text-medical-teal">
                        <Activity className="animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Chat Interface */}
                <div className={cn("col-span-12 transition-all duration-500", showRiskScore ? "lg:col-span-7" : "lg:col-span-12")}>
                    <Card className="flex h-[600px] flex-col justify-between overflow-hidden border-none shadow-2xl shadow-medical-teal/5">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <AnimatePresence>
                                {messages.map((m: any) => (
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

                        <form onSubmit={handleSubmit} className="border-t p-6 bg-gray-50 dark:bg-black/20">
                            {isLowLiteracy ? (
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onMouseDown={toggleRecording}
                                        onMouseUp={toggleRecording}
                                        className={cn(
                                            "w-full py-12 rounded-[32px] flex flex-col items-center justify-center space-y-4 transition-all border-4",
                                            isRecording ? "bg-emergency-red border-white shadow-2xl scale-95" : "bg-medical-teal border-medical-teal/20 text-white"
                                        )}
                                    >
                                        <div className={cn("p-6 rounded-full bg-white/20", isRecording && "animate-ping")}>
                                            {isRecording ? <Disc size={48} /> : <Mic size={48} />}
                                        </div>
                                        <span className="text-xl font-black uppercase tracking-widest">{isRecording ? "Listening..." : "Press & Speak"}</span>
                                    </button>
                                    <p className="text-center text-[10px] font-bold text-muted uppercase italic">Hold to capture symptoms naturally.</p>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleRecording}
                                        className={cn("rounded-full !p-3 transition-all", isRecording ? "bg-emergency-red text-white animate-pulse" : "hover:bg-medical-teal/20 text-medical-teal")}
                                    >
                                        {isRecording ? <Disc size={24} /> : <Mic size={24} />}
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
                            )}
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
