"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Activity, Globe, Shield, CheckCircle2, ArrowRight, Heart, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/core/hooks/useAuth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

/**
 * PROJECT SANJEEVANI: PHASE 1 ONBOARDING
 * Implements PRD 1A: User Onboarding & Baseline Health Profile
 */
export default function OnboardingPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: "",
        gender: "Prefer not to say",
        bloodGroup: "O+",
        village: "",
        district: "Mysuru",
        pinCode: "",
        chronicConditions: [] as string[],
        medications: [] as string[],
        language: "en"
    });

    const chronicOptions = ["Diabetes", "Hypertension", "Asthma", "Heart Condition", "None"];

    const handleStepNext = () => setStep((s) => s + 1);

    const handleComplete = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                onboarded: true,
                age: parseInt(formData.age),
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                language: formData.language,
                address: {
                    village: formData.village,
                    district: formData.district,
                    pinCode: formData.pinCode
                },
                baseline: {
                    chronicConditions: formData.chronicConditions,
                    medications: formData.medications
                }
            });
            router.push("/dashboard");
        } catch (err) {
            console.error("Onboarding failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black/20 py-20 px-4">
            <div className="max-w-xl mx-auto">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-medical-teal-deep dark:text-white uppercase italic tracking-tighter">Onboarding</h1>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Sanjeevani Profile Sync</p>
                    </div>
                    <div className="flex space-x-1">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-1.5 w-8 rounded-full ${step >= s ? "bg-medical-teal shadow-[0_0_8px_#14b8a6]" : "bg-gray-200"}`} />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Card className="border-none shadow-2xl p-8">
                                <div className="h-14 w-14 rounded-2xl bg-medical-teal/10 flex items-center justify-center text-medical-teal mb-6">
                                    <User size={28} />
                                </div>
                                <h2 className="text-2xl font-black text-medical-teal-deep mb-2 italic">Essential Profile</h2>
                                <p className="text-sm text-muted mb-8 leading-relaxed">Let's set up your core identity for accurate clinical analysis.</p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Current Age</label>
                                            <input
                                                type="number"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                className="w-full p-4 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-medical-teal font-bold"
                                                placeholder="e.g. 45"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Blood Group</label>
                                            <select
                                                value={formData.bloodGroup}
                                                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                                className="w-full p-4 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-medical-teal font-bold"
                                            >
                                                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg}>{bg}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted">Preferred Language</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[{ id: "en", l: "English" }, { id: "kn", l: "Kannada" }, { id: "hi", l: "Hindi" }].map(l => (
                                                <button
                                                    key={l.id}
                                                    onClick={() => setFormData({ ...formData, language: l.id as any })}
                                                    className={`p-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.language === l.id ? "border-medical-teal bg-medical-teal/10 text-medical-teal" : "border-gray-50 bg-gray-50 text-muted"}`}
                                                >
                                                    {l.l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-10 rounded-2xl py-8 text-lg shadow-xl" onClick={handleStepNext}>
                                    Capture & Continue <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Card className="border-none shadow-2xl p-8">
                                <div className="h-14 w-14 rounded-2xl bg-warning-amber/10 flex items-center justify-center text-warning-amber mb-6">
                                    <Activity size={28} />
                                </div>
                                <h2 className="text-2xl font-black text-medical-teal-deep mb-2 italic">Baseline Health</h2>
                                <p className="text-sm text-muted mb-8 leading-relaxed">This information helps our AI engine calibrate risk scores specifically for you.</p>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted">Chronic Conditions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {chronicOptions.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => {
                                                        const active = formData.chronicConditions.includes(opt);
                                                        setFormData({
                                                            ...formData,
                                                            chronicConditions: active
                                                                ? formData.chronicConditions.filter(c => c !== opt)
                                                                : [...formData.chronicConditions, opt]
                                                        });
                                                    }}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${formData.chronicConditions.includes(opt) ? "bg-medical-teal text-white" : "bg-gray-100 text-muted"}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted">Regular Medications</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-medical-teal font-bold"
                                            placeholder="e.g. Metformin, Amlodipine"
                                            onChange={(e) => setFormData({ ...formData, medications: e.target.value.split(",") })}
                                        />
                                    </div>
                                </div>
                                <Button className="w-full mt-10 rounded-2xl py-8 text-lg shadow-xl" onClick={handleStepNext}>
                                    Validate & Continue <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Card className="border-none shadow-2xl p-8">
                                <div className="h-14 w-14 rounded-2xl bg-emergency-red/10 flex items-center justify-center text-emergency-red mb-6">
                                    <Shield size={28} />
                                </div>
                                <h2 className="text-2xl font-black text-medical-teal-deep mb-2 italic">Location & Consent</h2>
                                <p className="text-sm text-muted mb-8 leading-relaxed">Finalizing your regional surveillance node settings.</p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Village / Sector</label>
                                            <input
                                                type="text"
                                                value={formData.village}
                                                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                                className="w-full p-4 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-medical-teal font-bold"
                                                placeholder="e.g. Sector-4"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">PIN Code</label>
                                            <input
                                                type="text"
                                                value={formData.pinCode}
                                                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                                className="w-full p-4 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-medical-teal font-bold"
                                                placeholder="570001"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-medical-teal/5 border border-medical-teal/10 space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <CheckCircle2 size={16} className="text-medical-teal mt-0.5" />
                                            <p className="text-[10px] font-bold text-medical-teal-deep leading-relaxed">
                                                I consent to AI-based health risk prediction. I understand this is a decision-support tool and not a final medical diagnosis.
                                            </p>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <CheckCircle2 size={16} className="text-medical-teal mt-0.5" />
                                            <p className="text-[10px] font-bold text-medical-teal-deep leading-relaxed">
                                                I agree to share my location and risk score with the local ASHA frontline worker during emergencies.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-10 rounded-2xl py-8 text-xl shadow-2xl bg-medical-teal hover:bg-medical-teal/90" onClick={handleComplete}>
                                    Initialize My Ecosystem <Zap size={20} className="ml-2 fill-current" />
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
