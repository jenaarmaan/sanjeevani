import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sanjeevani | AI-Powered Preventive Healthcare",
  description: "Advanced AI symptom triage and healthcare intelligence platform for rural and global health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-medical-teal-soft selection:text-medical-teal-deep`}>
        <Navbar />
        <main className="min-vh-100">{children}</main>

        {/* Global Footer simplified for Phase 1 */}
        <footer className="border-t bg-white py-8 dark:bg-medical-teal-deep">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} Project Sanjeevani. Healthcare Democratized.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
