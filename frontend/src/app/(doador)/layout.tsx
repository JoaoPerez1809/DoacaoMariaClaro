"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

// Este é o layout que vai proteger todas as rotas de "Doador"
export default function DoadorLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o estado de autenticação já foi carregado e o usuário não está logado...
    if (user === null && !isAuthenticated) {
      // ...redireciona para a página de login.
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  // Enquanto a autenticação está sendo verificada, pode ser útil mostrar um loader
  // ou simplesmente não renderizar nada para evitar um "flash" de conteúdo.
  // Se o usuário estiver autenticado, 'isAuthenticated' será true e o conteúdo será renderizado.
  if (!isAuthenticated) {
    // Você pode colocar um componente de "Carregando..." aqui se quiser
    return <p>Verificando acesso...</p>; 
  }

  // Se o usuário está autenticado, renderiza a página filha (ex: a página de perfil)
  return <>{children}</>;
}