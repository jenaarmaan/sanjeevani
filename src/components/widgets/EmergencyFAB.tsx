"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, MapPin, PhoneCall, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const EmergencyFAB = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-6 w-72 rounded-3xl bg-emergency-red p-6 text-white shadow-2xl shadow-emergency-red/40"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <ShieldAlert size={20} />
                                <span className="font-bold uppercase tracking-wider">Emergency Mode</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <p className="mb-6 text-sm font-medium leading-relaxed opacity-90">
                            Activating high-priority SOS. Your location and health records will be shared with the nearest response unit.
                        </p>

                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full bg-white text-emergency-red hover:bg-gray-100 font-bold">
                                <PhoneCall size={18} className="mr-2" /> Call Ambulance
                            </Button>
                            <Button variant="ghost" className="w-full text-white border border-white/30 hover:bg-white/10">
                                <MapPin size={18} className="mr-2" /> Share Location
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emergency-red text-white shadow-xl shadow-emergency-red/40 transition-transform active:scale-90"
            >
                {isOpen ? <X size={32} /> : <AlertCircle size={32} className="animate-pulse" />}
            </motion.button>
        </div>
    );
};
