import type { Metadata } from "next";
import "./globals.css";
import { ApiNotice } from "@/components/auth/ApiNotice";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "OrthoSense Portal",
  description: "Continuous Orthopedic Rehabilitation & Telemetry Monitoring Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] font-sans antialiased text-[#0F172A]">
        <AuthProvider><ApiNotice />{children}</AuthProvider>
      </body>
    </html>
  );
}
