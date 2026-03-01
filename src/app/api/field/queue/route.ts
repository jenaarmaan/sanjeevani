import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

/**
 * Project Sanjeevani: Field Queue Intelligence
 * This API fetches pending health assessments and ranks them for ASHA workers.
 */
export async function GET(req: NextRequest) {
    try {
        const triageCollection = collection(db, "triage_sessions");

        // Fetch pending sessions prioritized by riskScore and most recent first
        const q = query(
            triageCollection,
            where("status", "==", "pending"),
            orderBy("riskScore", "desc"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const queue = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.patientName || "Anonymous",
                age: data.age || "??",
                priority: data.riskScore > 80 ? "High" : data.riskScore > 40 ? "Medium" : "Low",
                riskScore: data.riskScore,
                task: data.riskScore > 80 ? "EMERGENCY FOLLOW-UP" : "Routine Check",
                location: data.location || "Sector unknown",
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
            };
        });

        return NextResponse.json({
            status: "success",
            count: queue.length,
            queue: queue
        });

    } catch (err: any) {
        console.error("Field queue API error:", err);
        return NextResponse.json({
            status: "error",
            message: "Failed to fetch field queue",
            details: err.message
        }, { status: 500 });
    }
}
