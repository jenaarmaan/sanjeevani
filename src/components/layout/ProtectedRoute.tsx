"use client";

import { useAuth } from "@/core/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, profile, loading, login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to home if not logged in
            // Optionally we could show a login modal instead
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-f8fafc">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-medical-teal border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 rounded-full bg-medical-teal/10 p-6 text-medical-teal">
                    <ShieldAlert size={64} />
                </div>
                <h2 className="mb-2 text-3xl font-black text-medical-teal-deep">Secure Access Required</h2>
                <p className="mb-8 max-w-md text-muted">
                    This portal contains sensitive health information. Please sign in with your verified credentials to continue.
                </p>
                <Button size="lg" onClick={login}>Sign In to Sanjeevani</Button>
            </div>
        );
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        return (
            <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 rounded-full bg-emergency-red/10 p-6 text-emergency-red">
                    <ShieldAlert size={64} />
                </div>
                <h2 className="mb-2 text-3xl font-black text-medical-teal-deep">Unauthorized Access</h2>
                <p className="mb-8 max-w-md text-muted">
                    Your current profile ({profile.role}) does not have permissions to access this clinical dashboard. Please contact your administrator.
                </p>
                <Button variant="outline" onClick={() => router.push("/")}>Return to Home</Button>
            </div>
        );
    }

    return <>{children}</>;
};
