"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando...</div>;
  }

  // Se o usuário tem a permissão correta, mostra a página
  if (isAuthenticated && (user?.role === 'Administrador' || user?.role === 'Colaborador')) {
    return <>{children}</>;
  }

  return null;
}