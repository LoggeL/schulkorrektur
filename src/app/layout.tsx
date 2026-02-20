import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchulKorrektur - Hausaufgaben Korrektur",
  description: "KI-gestützte Korrektur von Schülerarbeiten",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
