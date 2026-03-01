import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

/**
 * Project Sanjeevani: Clinical-Check Bridge
 * This route calls the Python Triage Engine (AI part) to perform 
 * deterministic, clinical-grade assessments on patient data.
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // 1. Prepare Python execution
        const pythonScriptPath = path.join(process.cwd(), "AI part", "cli_triage.py");
        const pythonCwd = path.join(process.cwd(), "AI part");

        // Environment Check: Vercel standard runtime lacks Python/Pandas
        // We'll attempt to run, but provide a graceful fallback
        const result = await new Promise<any>((resolve) => {
            const pythonProcess = spawn("python", [pythonScriptPath], {
                cwd: pythonCwd,
                env: { ...process.env, PYTHONPATH: pythonCwd }
            });

            pythonProcess.on("error", (err) => {
                console.warn("Python execution failed (expected on Vercel Node runtime):", err.message);
                resolve({
                    status: "fallback",
                    risk_level: "MODERATE",
                    reasons: ["Clinical engine offline (Serverless Environment). Using neural-only assessment."],
                    suggested_actions: ["Consult clinical protocols manually."],
                    is_emergency: false,
                    explanation: { text: "The clinical verification engine is currently offline. Proceed with neural analysis results." },
                    decision_trace: []
                });
            });

            let output = "";
            let error = "";

            pythonProcess.stdout.on("data", (data) => { output += data.toString(); });
            pythonProcess.stderr.on("data", (data) => { error += data.toString(); });

            pythonProcess.stdin.write(JSON.stringify(data));
            pythonProcess.stdin.end();

            pythonProcess.on("close", (code) => {
                if (code !== 0) {
                    resolve({ status: "error", code, details: error });
                } else {
                    try {
                        resolve(JSON.parse(output));
                    } catch (e) {
                        resolve({ status: "error", message: "Failed to parse JSON", details: output });
                    }
                }
            });
        });

        if (result.status === "error") {
            return NextResponse.json({
                status: "error",
                message: result.message || "Clinical Engine Error",
                details: result.details
            }, { status: 500 });
        }

        return NextResponse.json(result);

    } catch (err: any) {
        console.error("Clinical check API error:", err);
        return NextResponse.json({
            status: "error",
            message: "Internal server error",
            details: err.message
        }, { status: 500 });
    }
}

