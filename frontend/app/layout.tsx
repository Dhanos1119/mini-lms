import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Learning Management System",
    template: "%s | LMS Admin",
  },
  description: "Advanced Learning Management System Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            style: {
              padding: '16px 20px',
              fontSize: '14px',
              borderRadius: '10px',
              background: '#111827',
              color: '#fff',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
