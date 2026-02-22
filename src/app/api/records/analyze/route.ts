import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
    const { image } = await req.json(); // base64 image

    const result = await generateObject({
        model: google('gemini-1.5-flash'),
        schema: z.object({
            documentType: z.string().describe("Type of health record (Blood work, X-ray, Prescription, etc)"),
            patientName: z.string().optional(),
            date: z.string().optional(),
            summary: z.string().describe("A 3-sentence clinical summary of the record"),
            vitalMetrics: z.array(z.object({
                label: z.string(),
                value: z.string(),
                isNormal: z.boolean(),
            })).describe("List of vitals / lab results found with their status"),
            riskDetection: z.string().describe("Critical risks found in the document"),
            nextSteps: z.array(z.string()).describe("Recommended clinical actions based on this record"),
        }),
        system: "You are an expert radiologist and pathologist AI. Extract structured medical data from the provided image of a health record.",
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Extract data from this medical document.' },
                    { type: 'image', image },
                ],
            },
        ],
    });

    return Response.json(result.object);
}
