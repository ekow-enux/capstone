import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WebSocketProvider from "@/components/providers/WebSocketProvider";
import GlobalEmergencyAlertHandler from "@/components/emergency/GlobalEmergencyAlertHandler";
import GlobalActiveIncidentHandler from "@/components/emergency/GlobalActiveIncidentHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GNFS Dashboard - Ghana National Fire Service",
  description: "Multi-role dashboard system for Ghana National Fire Service management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
              <WebSocketProvider>
                <GlobalEmergencyAlertHandler />
                <GlobalActiveIncidentHandler />
                {children}
              </WebSocketProvider>
      </body>
    </html>
  );
}
