import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/components/doacao/feedbackF.css";
import "@/components/doacao/feedbackS.css";
// import '@fortawesome/fontawesome-free/css/all.min.css'; // (Corretamente removido)

import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/layout/Footer"; 

// --- 1. IMPORTE O TOASTER ---
import { Toaster } from 'react-hot-toast';
import { FaWhatsapp } from "react-icons/fa";

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
        <AuthProvider>
          {/* --- 2. ADICIONE O COMPONENTE TOASTER AQUI --- */}
          {/* Ele vai apanhar todas as chamadas 'toast()' da aplicação */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 5000, // 5 segundos
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          {/* Adicione a classe wrapper para corrigir o footer (veja ponto 3 abaixo) */}
          <div className="layout-wrapper">
             <main className="layout-content">{children}</main>
             <Footer />
          </div>

          {/* BOTÃO WHATSAPP FIXO */}
          <a 
            href="https://api.whatsapp.com/send?phone=5515988124427" 
            className="whatsapp-float" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Fale conosco no WhatsApp"
          >
            <FaWhatsapp />
          </a>
        </AuthProvider>
      </body>
    </html>
  );
}