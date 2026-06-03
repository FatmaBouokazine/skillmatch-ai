import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import LayoutManager from "../components/LayoutManager";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillMatch AI",
  description: "A smarter way to connect recruiters and candidates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <AuthProvider>
          <LayoutManager>{children}</LayoutManager>
        </AuthProvider>
      </body>
    </html>
  );
}
