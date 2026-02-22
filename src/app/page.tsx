"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Activity, Zap, Heart, Globe, Lock, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden pt-12">
      {/* Background Blurs */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-medical-teal/10 blur-[150px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-emergency-red/5 blur-[120px]" />

      <div className="container mx-auto px-4 py-20 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8 inline-flex items-center rounded-full border border-medical-teal/20 bg-medical-teal/5 px-6 py-2 text-[10px] font-black tracking-[0.2em] text-medical-teal uppercase italic">
            <span className="mr-2 h-2 w-2 rounded-full bg-medical-teal animate-pulse" />
            Empowering the Next Billion Citizens
          </div>

          <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-tight text-medical-teal-deep dark:text-white md:text-8xl leading-[0.95]">
            Bridging the <span className="text-medical-teal">Clinical Gap</span> with Neural AI.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted md:text-xl font-medium leading-relaxed">
            Project Sanjeevani is the world's most advanced healthcare deployment framework—combining <span className="text-medical-teal-deep font-bold">Zero-Knowledge Privacy</span> with <span className="text-medical-teal-deep font-bold">Neural Triage</span> for rural accessibility.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 text-sm">
            <Link href="/triage" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-2xl shadow-medical-teal/30 py-8 px-10 text-xl rounded-2xl">
                Enter Triage Portal <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full py-8 px-10 text-xl border-2 rounded-2xl">
                Patient Intelligence
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-40 grid gap-10 md:grid-cols-3">
          <FeatureCard
            icon={<Cpu className="text-medical-teal" size={28} />}
            title="Neural Triage"
            description="Clinical-grade AI diagnostics optimized for rural pathology and sub-clinical monitoring."
          />
          <FeatureCard
            icon={<Lock className="text-emergency-red" size={28} />}
            title="Zero-Knowledge Vault"
            description="End-to-end AES-256 client-side encryption. Your health data is invisible to the cloud."
          />
          <FeatureCard
            icon={<Database className="text-warning-amber" size={28} />}
            title="Offline-First Stack"
            description="Infinite persistence architecture that functions in zero-connectivity village zones."
          />
        </div>

        {/* The Sanjeevani Standard */}
        <section className="mt-48 text-left">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-medical-teal mb-4 italic">The Sanjeevani Standard</h2>
              <h3 className="text-5xl font-black text-medical-teal-deep dark:text-white leading-tight">
                Global Health Stability through Distributed Intelligence.
              </h3>
              <p className="mt-6 text-lg text-muted leading-relaxed">
                By empowering local frontline workers with multimodal AI, we reduce the emergency response gap by <span className="font-bold text-medical-teal">74%</span>. Distributed surveillance detects disease clusters before they become outbreaks.
              </p>

              <div className="mt-12 space-y-6">
                <HighlightItem title="Real-time Surveillance" sub="District-wide spatial health intelligence." />
                <HighlightItem title="Automated OCR" sub="Sub-clinical record extraction in seconds." />
                <HighlightItem title="Medical Sovereignty" sub="Citizens own their keys and their diagnostics." />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-medical-teal/20 rounded-[40px] blur-3xl group-hover:bg-medical-teal/30 transition-colors" />
              <Card className="relative z-10 border-none aspect-square flex items-center justify-center p-12 bg-medical-teal-deep rounded-[40px] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
                <Activity size={180} className="text-medical-teal animate-pulse" strokeWidth={1} />
                <div className="absolute bottom-10 left-10 p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase text-medical-teal tracking-widest mb-1">Live Telemetry</div>
                  <div className="text-2xl font-black text-white italic">Active Node: Sector-7</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Global Impact CTA */}
        <section className="mt-48 mb-20">
          <Card className="bg-medical-teal-deep p-16 text-white border-none rounded-[48px] relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <h2 className="text-5xl font-black mb-6 relative z-10 italic">Ready for Nationwide Deployment.</h2>
            <p className="max-w-xl mx-auto text-medical-teal-soft text-lg mb-10 relative z-10">
              Sanjeevani is pilot-ready for government healthcare systems and large-scale NGOs. Secure, Scalable, and Sovereign.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
              <Link href="/clinical">
                <Button className="bg-white text-medical-teal-deep hover:bg-medical-teal-soft py-8 px-12 rounded-2xl text-xl font-black">
                  Clinical Oversight Portal
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 py-8 px-12 rounded-2xl text-xl font-black">
                  Surveillance Insights
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-left border-none shadow-2xl shadow-medical-teal/5 p-10 hover:translate-y-[-5px] transition-all group">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 group-hover:bg-medical-teal/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-medical-teal-deep dark:text-white italic">{title}</h3>
      <p className="mt-4 text-muted font-medium leading-relaxed">{description}</p>
    </Card>
  );
}

function HighlightItem({ title, sub }: { title: string, sub: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="mt-1 h-2 w-2 rounded-full bg-medical-teal shadow-[0_0_10px_#14b8a6]" />
      <div>
        <h4 className="font-black text-medical-teal-deep dark:text-white uppercase text-xs tracking-widest">{title}</h4>
        <p className="text-sm text-muted font-medium italic">{sub}</p>
      </div>
    </div>
  );
}
