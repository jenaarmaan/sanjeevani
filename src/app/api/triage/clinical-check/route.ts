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

        // 2. Invoke Python child process
        const pythonProcess = spawn("python", [pythonScriptPath], {
            cwd: pythonCwd,
            env: { ...process.env, PYTHONPATH: pythonCwd }
        });

        // 3. Handle data flow
        return new Promise((resolve) => {
            let output = "";
            let error = "";

            pythonProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                error += data.toString();
            });

            pythonProcess.stdin.write(JSON.stringify(data));
            pythonProcess.stdin.end();

            pythonProcess.on("close", (code) => {
                if (code !== 0) {
                    console.error("Python process exited with error code:", code);
                    console.error("Stderr:", error);
                    resolve(NextResponse.json({
                        status: "error",
                        message: "Clinical Engine Error",
                        details: error
                    }, { status: 500 }));
                } else {
                    try {
                        const parsedOutput = JSON.parse(output);
                        resolve(NextResponse.json(parsedOutput));
                    } catch (e) {
                        console.error("Failed to parse Python output:", output);
                        resolve(NextResponse.json({
                            status: "error",
                            message: "Invalid engine output",
                            details: output
                        }, { status: 500 }));
                    }
                }
            });
        });

    } catch (err: any) {
        console.error("Clinical check API error:", err);
        return NextResponse.json({
            status: "error",
            message: "Internal server error",
            details: err.message
        }, { status: 500 });
    }
}
