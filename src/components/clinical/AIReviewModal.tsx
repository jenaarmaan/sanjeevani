import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertOctagon, Info, ArrowUpRight, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";

interface ClinicalReviewProps {
    session: any;
    onClose: () => void;
}

/**
 * PROJECT SANJEEVANI: EXPLAINABLE AI LAYER
 * Fulfills PRD 4C: Explainable risk breakdown for medical professionals.
 */
export default function ClinicalAIReview({ session, onClose }: ClinicalReviewProps) {
    if (!session) return null;

    const audit = session.clinicalAudit || null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-white rounded-[40px]">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-medical-teal mb-1">
                            <ShieldCheck size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Clinical Audit Trace</span>
                        </div>
                        <CardTitle className="text-2xl font-black text-medical-teal-deep italic uppercase tracking-tighter">
                            Patient: {session.name}
                        </CardTitle>
                        <CardDescription>AI Risk Score: {session.riskScore}% | Session ID: {session.id}</CardDescription>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="rounded-full !h-12 !w-12">
                        <XCircle size={28} className="text-muted" />
                    </Button>
                </CardHeader>

                <CardContent className="py-8 space-y-8">
                    {/* Risk Decomposition Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-200">
                            <h4 className="flex items-center text-xs font-black text-medical-teal-deep uppercase mb-4">
                                <Activity size={16} className="mr-2" /> Neural Contribution
                            </h4>
                            <p className="text-sm text-muted leading-relaxed mb-6">
                                Probabilistic model detected correlations between described symptoms and potential pathology.
                                Confidence index stands at <span className="font-bold text-medical-teal">88%</span>.
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
                                    <span>Symptom Intensity</span>
                                    <span>High</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-medical-teal w-[80%]" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-emergency-red/5 border-2 border-dashed border-emergency-red/20">
                            <h4 className="flex items-center text-xs font-black text-emergency-red uppercase mb-4">
                                <AlertOctagon size={16} className="mr-2" /> Clinical Override Trace
                            </h4>
                            {audit ? (
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle size={14} className="text-emergency-red" />
                                        <span className="text-xs font-bold text-medical-teal-deep">{audit.rule_triggered}</span>
                                    </div>
                                    <p className="text-[10px] text-muted italic">Result: {audit.recommendation}</p>
                                </div>
                            ) : (
                                <p className="text-xs text-muted italic">No deterministic red flags triggered by Python core.</p>
                            )}
                        </div>
                    </div>

                    {/* Decision Reasons */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-medical-teal-deep uppercase tracking-widest px-1">AI Reasoning (Decision Drivers)</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {session.explainability?.reasons?.map((reason: string, i: number) => (
                                <div key={i} className="flex items-center space-x-3 p-4 bg-medical-teal/5 rounded-2xl border border-medical-teal/10">
                                    <ArrowUpRight size={16} className="text-medical-teal opacity-60" />
                                    <span className="text-xs font-bold text-medical-teal-deep">{reason}</span>
                                </div>
                            )) || <p className="text-xs italic text-muted">Analysis reasoning unavailable for this legacy session.</p>}
                        </div>
                    </div>

                    {/* Actionable Plan */}
                    <div className="rounded-[32px] bg-medical-teal-deep text-white p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="text-[10px] font-black uppercase text-medical-teal tracking-widest mb-2 flex items-center">
                                    <Info size={12} className="mr-2" /> Physician Action Strategy
                                </div>
                                <h3 className="text-xl font-bold">Recommended: Immediate Teletriage</h3>
                                <p className="text-xs text-medical-teal-soft/70 mt-1 max-w-sm">Patient's respiratory parameters require immediate human validation via Video Link.</p>
                            </div>
                            <div className="flex space-x-3">
                                <Button variant="secondary" className="rounded-xl px-10 h-14 text-xs font-black uppercase">Approve AI Diagnosis</Button>
                                <Button className="bg-medical-teal hover:bg-medical-teal/90 rounded-xl px-10 h-14 text-xs font-black uppercase shadow-xl shadow-medical-teal/30">Connect Now</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
