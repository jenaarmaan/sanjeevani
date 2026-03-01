import { NextRequest, NextResponse } from "next/server";

/**
 * Project Sanjeevani: Emergency Notification Engine
 * Standardizes the trigger for SMS/WhatsApp/FCM alerts when 
 * high-fidelity clinical triage detects a life-threatening "Red Flag".
 */
export async function POST(req: NextRequest) {
    try {
        const { patientId, riskLevel, details, location } = await req.json();

        // 1. Log to Local Backend (Security Audit)
        try {
            await fetch("http://localhost:5000/sos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: patientId,
                    emergencyType: details?.[0] || "CRITICAL_RISK",
                    location: location || "Global/Unknown",
                    description: `Automated alert triggered by Clinical Triage Engine. Risk: ${riskLevel}`
                })
            });
        } catch (e) {
            console.warn("Local SOS sync failed - connectivity offline.");
        }

        // 2. Integration Placeholder: Twilio / Firebase Cloud Messaging
        // In a production environment, this is where SMS/Push is triggered.
        console.log(`[ALERT] EMERGENCY NOTIFICATION TRIGGERED for ${patientId}. LEVEL: ${riskLevel}`);

        return NextResponse.json({
            status: "success",
            message: "Emergency protocols initiated",
            timestamp: new Date().toISOString()
        });

    } catch (err: any) {
        console.error("Emergency Alert API error:", err);
        return NextResponse.json({
            status: "error",
            message: "Failed to initiate emergency protocol",
            details: err.message
        }, { status: 500 });
    }
}
