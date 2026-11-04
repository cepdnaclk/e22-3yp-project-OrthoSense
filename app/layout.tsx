import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F766E] font-sans antialiased text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
