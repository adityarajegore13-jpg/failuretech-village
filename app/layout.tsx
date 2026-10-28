import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GramPulse — Village directory",
  description: "Explore village demographics, local administration and public services with GramPulse.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
