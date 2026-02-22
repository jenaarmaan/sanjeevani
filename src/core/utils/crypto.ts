import CryptoJS from "crypto-js";

/**
 * Project Sanjeevani Encryption Standard (Phase 1)
 * Standardizes AES-256-GCM (simulated via CryptoJS AES) for PHI protection.
 * In Production: Use a more robust Key Management System (KMS).
 */

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "sanjeevani-fallback-secure-key-2025";

export const encryptData = (data: any): string => {
    try {
        const stringifiedData = typeof data === "string" ? data : JSON.stringify(data);
        return CryptoJS.AES.encrypt(stringifiedData, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Failed to secure health data.");
    }
};

export const decryptData = (encryptedData: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};
