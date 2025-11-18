"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
// Importa o CSS global para usar o 'loading-overlay'
import "@/app/globals.css";

// CSS para o overlay de loading
const loadingOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#f5f5f5', // Cor de fundo da página
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '18px',
  color: '#333',
  zIndex: 9999, // Fica acima de tudo
};


export default function DoadorLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só toma a decisão DEPOIS que o loading do contexto terminar
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // --- CORREÇÃO APLICADA AQUI ---
  if (loading) {
    return (
      <div style={loadingOverlayStyle}>
        Verificando autenticação...
      </div>
    );
  }
  // --- FIM DA CORREÇÃO ---

  // Se estiver autenticado, finalmente mostra a página
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Se não, não renderiza nada enquanto redireciona
  return null;
}