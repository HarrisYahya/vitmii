import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "vitimiin online",
  description: "Fresh food delivery online store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Executes BEFORE UI renders – prevents dark/light flash */}
        <ThemeScript />
      </head>

      <body className={inter.className}>{children}</body>
    </html>
  );
}
