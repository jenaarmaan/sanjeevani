import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// System prompt for clinical intelligence
const SYMPTOM_TRIAGE_PROMPT = `
You are Sanjeevani AI, a clinical-grade medical triage assistant specialized for rural and global healthcare accessibility.
Your goal is to perform an empathetic, systematic assessment of user symptoms to determine risk levels.

RULES:
1. Be professional, empathetic, and culturally sensitive.
2. Ask clarifying questions one by one (e.g., duration, severity, associated symptoms).
3. Look for "RED FLAGS" (e.g., chest pain, shortness of breath, high fever, localized weakness).
4. If a red flag is detected, prioritize immediate emergency response.
5. Provide a summary of your findings after 3-4 exchanges.
`;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-1.5-flash') as any,
        system: SYMPTOM_TRIAGE_PROMPT,
        messages,
    });

    return result.toDataStreamResponse();
}
