export type UserRole = "patient" | "doctor" | "field-worker" | "admin";

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: UserRole;
    phoneNumber?: string;
    photoURL?: string;
    createdAt: number;
}

export interface TriageSession {
    id: string;
    patientId: string;
    timestamp: number;
    symptoms: string[];
    conversation: { role: "bot" | "user"; text: string }[];
    riskScore: number;
    status: "pending" | "reviewed" | "escalated";
    priority: "low" | "medium" | "high" | "critical";
    assignedDoctorId?: string;
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
