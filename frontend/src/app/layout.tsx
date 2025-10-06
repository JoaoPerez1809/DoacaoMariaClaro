import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Header } from "@/components/layout/Header";

// 1. Importe o AuthProvider
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doação Maria Claro",
  description: "Plataforma de doações para a ONG Maria Claro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* 2. Envolva tudo com o AuthProvider */}
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}