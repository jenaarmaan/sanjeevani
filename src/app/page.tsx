"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Activity, Zap, Heart, Globe, Lock, Cpu, Database } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
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

          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted md:text-xl font-medium leading-relaxed italic uppercase tracking-tighter opacity-80">
            Advanced diagnostic infrastructure optimized for rural and low-resource environments.
          </p>
        </motion.div>

        {/* Persona Selector - The Command Center Entry Points */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <PersonaCard
            title="Citizen Patient"
            tagline="SELF-DIAGNOSTICS & VAULT"
            description="Access AI Triage, securely store medical records in the Zero-Knowledge Vault, and track your wellness trajectory."
            icon={<Heart className="text-medical-teal" size={32} />}
            href="/dashboard"
            color="teal"
          />
          <PersonaCard
            title="Clinical Physician"
            tagline="OVERSIGHT & AUDIT"
            description="Review risk-prioritized triage queues, validate AI decision traces, and provide high-fidelity tele-consultations."
            icon={<Shield className="text-medical-teal-deep" size={32} />}
            href="/clinical"
            color="deep"
          />
          <PersonaCard
            title="Sanjeevani Mitra"
            tagline="FRONTLINE FIELD OPS"
            description="Empowering ASHA and community workers with multimodal triage tools for doorstep healthcare delivery."
            icon={<Globe className="text-warning-amber" size={32} />}
            href="/field"
            color="amber"
          />
        </div>

        {/* Technical Capabilities Feature Grid */}
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

        {/* Detailed Highlight Section */}
        <section className="mt-48 text-left">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-medical-teal mb-4 italic">The Sanjeevani Standard</h2>
                <h3 className="text-5xl font-black text-medical-teal-deep dark:text-white leading-tight">
                  Global Health Stability through Distributed Intelligence.
                </h3>
              </div>
              <p className="text-lg text-muted leading-relaxed font-medium">
                By empowering local frontline workers with multimodal AI, we reduce the emergency response gap by <span className="font-bold text-medical-teal">74%</span>. Distributed surveillance detects disease clusters before they become outbreaks.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <HighlightItem title="Real-time Surveillance" sub="District-wide spatial health intelligence." />
                <HighlightItem title="Automated OCR" sub="Sub-clinical record extraction in seconds." />
                <HighlightItem title="Medical Sovereignty" sub="Citizens own their keys and their diagnostics." />
                <HighlightItem title="Emergency SOS" sub="Sub-second response triggers for critical flags." />
              </div>

              <div className="pt-8">
                <Link href="/analytics">
                  <Button variant="outline" className="h-16 rounded-2xl border-2 px-8 text-xs font-black uppercase tracking-widest text-medical-teal border-medical-teal/20 hover:bg-medical-teal/5">
                    View Surveillance Grid <ArrowRight size={16} className="ml-3" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative group lg:pl-10">
              <div className="absolute inset-0 bg-medical-teal/20 rounded-[60px] blur-3xl group-hover:bg-medical-teal/30 transition-all scale-110" />
              <Card className="relative z-10 border-none aspect-square flex items-center justify-center p-12 bg-medical-teal-deep rounded-[60px] shadow-2xl overflow-hidden border-4 border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                <Activity size={180} className="text-medical-teal animate-pulse" strokeWidth={1} />
                <div className="absolute bottom-12 left-12 right-12 p-8 bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-black uppercase text-medical-teal tracking-[0.2em]">Neural Telemetry</div>
                    <div className="h-2 w-2 rounded-full bg-medical-teal animate-ping" />
                  </div>
                  <div className="text-3xl font-black text-white italic tracking-tighter">Active Node: Sector-7</div>
                  <div className="text-[10px] font-bold text-medical-teal-soft/60 mt-2 uppercase">Infinite Persistence Syncing...</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-48 mb-20 text-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-medical-teal-deep p-20 text-white border-none rounded-[64px] relative overflow-hidden shadow-[0_48px_100px_-20px_rgba(13,148,136,0.3)]"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-6xl font-black mb-8 italic tracking-tighter leading-none">The Future of Health is Distributed.</h2>
              <p className="max-w-2xl mx-auto text-medical-teal-soft text-xl mb-12 font-medium opacity-80 leading-relaxed">
                Sanjeevani is pilot-ready for government healthcare systems and large-scale NGOs. Secure, Scalable, and Sovereign.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link href="/onboarding">
                  <Button className="bg-white text-medical-teal-deep hover:bg-white/90 h-20 px-12 rounded-[24px] text-xl font-black uppercase tracking-tight shadow-2xl">
                    Join as Citizen
                  </Button>
                </Link>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-20 px-12 rounded-[24px] text-xl font-black uppercase tracking-tight backdrop-blur">
                  Partner Deployment
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function PersonaCard({ title, tagline, description, icon, href, color }: any) {
  const colorClasses: any = {
    teal: "group-hover:bg-medical-teal text-medical-teal",
    deep: "group-hover:bg-medical-teal-deep text-medical-teal-deep",
    amber: "group-hover:bg-warning-amber text-warning-amber",
  };

  return (
    <Link href={href} className="group">
      <Card className="h-full text-left p-10 rounded-[40px] border-none shadow-2xl shadow-medical-teal/5 transition-all duration-500 hover:shadow-medical-teal/20 group-hover:-translate-y-4">
        <div className={cn("mb-8 h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center transition-colors duration-500", colorClasses[color])}>
          <div className="group-hover:text-white transition-colors duration-500">
            {icon}
          </div>
        </div>
        <div className="text-[10px] font-black text-medical-teal mb-2 tracking-[0.2em]">{tagline}</div>
        <h3 className="text-3xl font-black text-medical-teal-deep italic leading-none mb-4">{title}</h3>
        <p className="text-muted text-sm font-medium leading-relaxed opacity-70 mb-10">{description}</p>
        <div className="mt-auto flex items-center text-xs font-black text-medical-teal italic uppercase tracking-widest group-hover:translate-x-2 transition-transform">
          Enter Portal <ArrowRight size={16} className="ml-2" />
        </div>
      </Card>
    </Link>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-left border-none shadow-2xl shadow-medical-teal/5 p-10 hover:translate-y-[-5px] transition-all group rounded-[32px]">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 group-hover:bg-medical-teal/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-medical-teal-deep dark:text-white italic tracking-tighter">{title}</h3>
      <p className="mt-4 text-muted font-medium leading-relaxed text-sm opacity-80">{description}</p>
    </Card>
  );
}

function HighlightItem({ title, sub }: { title: string, sub: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="mt-1 h-2 w-2 rounded-full bg-medical-teal shadow-[0_0_10px_#14b8a6]" />
      <div>
        <h4 className="font-black text-medical-teal-deep dark:text-white uppercase text-[10px] tracking-widest leading-none mb-1">{title}</h4>
        <p className="text-xs text-muted font-medium italic opacity-70">{sub}</p>
      </div>
    </div>
  );
}
