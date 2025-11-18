"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
// Importa o CSS global para usar o 'loading-overlay'
import "@/app/globals.css";

// CSS para o overlay de loading (pode ser movido para globals.css se preferir)
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Espera a verificação terminar

    // Se não estiver logado, ou se a role não for a permitida...
    if (!isAuthenticated || (user?.role !== 'Administrador' && user?.role !== 'Colaborador')) {
      router.push("/login"); // ou para uma página de "acesso negado"
    }
  }, [isAuthenticated, user, loading, router]);

  // --- CORREÇÃO APLICADA AQUI ---
  if (loading) {
    return (
      <div style={loadingOverlayStyle}>
        Carregando...
      </div>
    );
  }
  // --- FIM DA CORREÇÃO ---

  // Se o usuário tem a permissão correta, mostra a página
  if (isAuthenticated && (user?.role === 'Administrador' || user?.role === 'Colaborador')) {
    return <>{children}</>;
  }

  return null;
}