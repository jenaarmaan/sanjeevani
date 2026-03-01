export type UserRole = "patient" | "doctor" | "field-worker" | "admin";

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: UserRole;
    phoneNumber?: string;
    photoURL?: string;
    createdAt: number;
    // Onboarding Feature Set (PRD 1A)
    onboarded?: boolean;
    language?: "kn" | "hi" | "en";
    age?: number;
    gender?: string;
    bloodGroup?: string;
    address?: {
        village?: string;
        district?: string;
        pinCode?: string;
    };
    // Baseline Health Profile (PRD 1A-5)
    baseline?: {
        chronicConditions?: string[];
        medications?: string[];
        allergies?: string[];
        pastSurgeries?: string[];
        lifestyleIndices?: {
            smoking?: boolean;
            alcohol?: boolean;
        };
    };
}

export interface TriageSession {
    id: string;
    patientId: string;
    createdAt: any;
    conversation: { role: "assistant" | "user"; content: string }[];
    riskScore: number;
    status: "pending" | "reviewed" | "escalated";
    priority: "low" | "medium" | "high" | "critical";
    summary: string; // Encrypted in Firestore
    redFlags: string[]; // Encrypted in Firestore
    clinicalAudit?: any;
    explainability?: {
        reasons: string[];
        confidenceScore: number;
    };
    assignedDoctorId?: string;
    location?: string;
}

export interface HealthRecord {
    id: string;
    patientId: string;
    title: string;
    type: string;
    fileUrl: string;
    summary?: string;
    ocrExtractedData?: any;
    createdAt: number;
    isEncrypted: boolean;
}
