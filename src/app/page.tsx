"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Activity, Zap, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden pt-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-medical-teal/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-emergency-red/5 blur-[100px]" />

      <div className="container mx-auto px-4 py-20 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center rounded-full border border-medical-teal/20 bg-medical-teal-soft/30 px-4 py-1.5 text-sm font-bold text-medical-teal">
            <span className="mr-2 h-2 w-2 rounded-full bg-medical-teal animate-pulse" />
            AI-POWERED PREVENTIVE HEALTHCARE
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-medical-teal-deep dark:text-white md:text-7xl">
            Healthcare Democratized for <span className="text-medical-teal">Every Citizen.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted md:text-xl">
            Project Sanjeevani brings clinical-grade AI triage, offline medical monitoring, and emergency response infrastructure to the world's most remote regions.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/triage">
              <Button size="lg" className="w-full sm:w-auto">
                Start AI Triage <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/emergency">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Emergency SOS
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Zap className="text-warning-amber" />}
            title="Symptom Triage"
            description="94% accurate AI triage engine that identifies risks before they become emergencies."
          />
          <FeatureCard
            icon={<Globe className="text-medical-teal" />}
            title="Offline-First"
            description="Fully functional in low-connectivity rural zones with intelligent background sync."
          />
          <FeatureCard
            icon={<Shield className="text-emergency-red" />}
            title="Emergency Alert"
            description="High-priority SOS infrastructure that connects patients to providers in seconds."
          />
        </div>

        {/* Impact Section */}
        <section className="mt-40 rounded-[32px] bg-medical-teal-deep p-12 text-white">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="text-left">
              <h2 className="text-4xl font-black">Connecting Rural India to Global Excellence.</h2>
              <p className="mt-4 text-lg text-medical-teal-soft/70">
                Sanjeevani isn't just an app. it's a bridge. We empower local frontline workers with clinical-grade intelligence to save lives where every second counts.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <StatItem value="1M+" label="Target Reach" />
                <StatItem value="Offline" label="Architecture" />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-white/10 glass-morphism flex items-center justify-center">
                <Activity size={80} className="text-medical-teal animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-left border-none shadow-xl shadow-medical-teal/5">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-black/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-medical-teal-deep dark:text-white">{title}</h3>
      <p className="mt-2 text-muted leading-relaxed">{description}</p>
    </Card>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="text-sm font-medium text-medical-teal-soft">{label}</div>
    </div>
  );
}
