import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Topbar from "./components/Topbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eth Labels",
  description: "dawson do you have something you would like here?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar">
      <body>
        <Topbar />
        <div className={inter.className}>{children}</div>
      </body>
    </html>
  );
}
