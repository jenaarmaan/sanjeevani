import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <h2 className="text-6xl font-black text-medical-teal-deep mb-4 italic">404</h2>
            <p className="text-xl text-muted mb-8 italic">Diagnostics Failed: Route Not Found</p>
            <Link href="/">
                <Button size="lg" className="rounded-2x">
                    Return to Portal
                </Button>
            </Link>
        </div>
    );
}
