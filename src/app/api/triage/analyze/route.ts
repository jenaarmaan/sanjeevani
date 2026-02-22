import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await generateObject({
        model: google('gemini-1.5-flash') as any,
        schema: z.object({
            riskScore: z.number().min(0).max(100).describe("The percentage risk of critical illness"),
            priority: z.enum(["low", "medium", "high", "critical"]).describe("Emergency response priority"),
            summary: z.string().describe("A 2-sentence clinical summary of the triage findings"),
            redFlags: z.array(z.string()).describe("List of dangerous symptoms detected"),
            nextSteps: z.array(z.string()).describe("Actionable advice for the patient or field worker"),
        }),
        system: "Analyze the following medical triage conversation and provide a structured risk assessment.",
        messages,
    });

    return Response.json(result.object);
}
