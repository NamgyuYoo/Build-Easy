import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Build-Easy | 현장 정산 자동화",
  description: "건설/인테리어 현장 정산 자동화 플랫폼 - 장갑 끼고도 쓸 수 있는 가장 쉬운 정산 도구",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
