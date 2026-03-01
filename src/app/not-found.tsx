import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Activity, ShieldAlert } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-medical-teal/5 blur-[120px]" />

            <div className="mb-8 p-4 rounded-3xl bg-emergency-red/10 text-emergency-red animate-pulse">
                <ShieldAlert size={64} />
            </div>

            <h2 className="text-8xl font-black text-medical-teal-deep dark:text-white mb-4 italic tracking-tighter">
                404<span className="text-medical-teal opacity-20">_FAULT</span>
            </h2>

            <div className="text-xs font-black uppercase tracking-[0.4em] text-medical-teal mb-10">
                Diagnostics Error: Terminal Route Inaccessible
            </div>

            <p className="max-w-md text-sm font-medium text-muted leading-relaxed mb-12 italic">
                The requested clinical endpoint could not be resolved by the neural gateway. This anomaly has been logged for system integrity audit.
            </p>

            <Link href="/" className="group">
                <Button size="lg" className="h-20 px-12 rounded-[24px] text-xl font-black uppercase tracking-tight shadow-2xl shadow-medical-teal/20">
                    <Activity size={24} className="mr-3 group-hover:scale-125 transition-transform" />
                    Reset Portal Gateway
                </Button>
            </Link>
        </div>
    );
}
