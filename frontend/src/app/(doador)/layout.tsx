"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function DoadorLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só toma a decisão DEPOIS que o loading do contexto terminar
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Se estiver carregando, mostra uma mensagem
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Verificando autenticação...</div>;
  }

  // Se estiver autenticado, finalmente mostra a página
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Se não, não renderiza nada enquanto redireciona
  return null;
}