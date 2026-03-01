"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, MapPin, PhoneCall, ShieldAlert } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";

export const EmergencyFAB = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [pressProgress, setPressProgress] = useState(0);
    const [isPressing, setIsPressing] = useState(false);

    let pressTimer: any;

    const startPress = () => {
        setIsPressing(true);
        setPressProgress(0);
        pressTimer = setInterval(() => {
            setPressProgress(prev => {
                if (prev >= 100) {
                    clearInterval(pressTimer);
                    setIsOpen(true);
                    return 100;
                }
                return prev + 5;
            });
        }, 50);
    };

    const endPress = () => {
        setIsPressing(false);
        setPressProgress(0);
        clearInterval(pressTimer);
    };

    const triggerSOS = async () => {
        alert("CRITICAL SOS: Emergency Response Units are tracking your location.");
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-8 w-80 rounded-[40px] bg-emergency-red p-8 text-white shadow-[0_32px_64px_-12px_rgba(239,68,68,0.5)] border-4 border-white/20"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl bg-white/20 animate-pulse">
                                    <ShieldAlert size={24} />
                                </div>
                                <span className="font-black uppercase tracking-widest text-sm italic">Emergency Mode</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-2 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="mb-8 text-xs font-bold leading-relaxed opacity-90 uppercase tracking-tight">
                            Critical SOS active. Your clinical baseline and GPS telemetry are being pushed to Sector-7 Dispatch.
                        </p>

                        <div className="space-y-4">
                            <Button variant="secondary" onClick={triggerSOS} className="w-full bg-white text-emergency-red hover:bg-gray-100 font-black h-16 rounded-2xl shadow-xl text-xs uppercase tracking-widest">
                                <PhoneCall size={20} className="mr-3" /> Execute Response
                            </Button>
                            <Button variant="ghost" className="w-full text-white border-2 border-white/30 hover:bg-white/10 h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                <MapPin size={18} className="mr-2" /> Verify Location
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                {isPressing && (
                    <svg className="absolute -inset-4 h-[96px] w-[96px] -rotate-90">
                        <circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor" strokeWidth="8"
                            fill="transparent"
                            className="text-emergency-red opacity-20"
                        />
                        <motion.circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor" strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * pressProgress) / 100}
                            className="text-emergency-red"
                        />
                    </svg>
                )}

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseDown={startPress}
                    onMouseUp={endPress}
                    onTouchStart={startPress}
                    onTouchEnd={endPress}
                    className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 relative z-10",
                        isOpen ? "bg-white text-emergency-red" : "bg-emergency-red text-white shadow-emergency-red/40"
                    )}
                >
                    {isOpen ? <X size={32} /> : <AlertCircle size={32} className={cn(isPressing ? "scale-125" : "animate-pulse")} />}
                </motion.button>
            </div>

            {!isOpen && !isPressing && (
                <div className="absolute top-1/2 -left-32 -translate-y-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-gray-100 shadow-sm pointer-events-none">
                    <span className="text-[8px] font-black uppercase tracking-widest text-emergency-red">Hold for SOS</span>
                </div>
            )}
        </div>
    );
};
