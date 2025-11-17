import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/components/doacao/feedbackF.css";
import "@/components/doacao/feedbackS.css";
// import { Header } from "@/components/layout/Header"; // Header não é mais usado aqui

// 1. Importe o AuthProvider
import { AuthProvider } from "@/contexts/AuthContext";

// 2. Importe o Footer que acabamos de criar
import Footer from "@/components/layout/Footer"; 

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
        {/* 3. Envolva tudo com o AuthProvider */}
        <AuthProvider>
          {/* 'children' agora representa suas páginas (que já contêm o Header)
            como /page.tsx, /login/page.tsx, etc.
          */}
          <main>{children}</main>

          {/* 4. Adicione o Footer aqui, fora do 'main' */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}