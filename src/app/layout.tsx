import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-client";
import { getCurrentUser } from "@/lib/auth-server";
import { Toaster } from "@/app/components/ui/sonner";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "LesMap Samarinda",
  description: "WebGIS Pemetaan Tempat Les dan Kursus di Samarinda",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get current user server-side
  const user = await getCurrentUser();

  return (
    <html lang="id">
      <body className="font-['Inter',sans-serif] min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider initialUser={user}>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
