"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import './ActionBar.css'; // Vamos criar este CSS

export const ActionBar: React.FC = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  
  const isAdmin = user?.role === 'Administrador' || user?.role === 'Colaborador';

  return (
    <nav className="action-bar-container">
      <div className="action-bar-content">
        
        {/* Botão de Doar (sempre visível) */}
        <Link href="/doar" className="action-button donate">
          DOAR
        </Link>
        
        {/* Lógica Condicional de Botões */}
        {isAuthenticated ? (
          <>
            {/* --- Se ESTIVER LOGADO --- */}
            {isAdmin ? (
              // Se for Admin/Colaborador
              <Link href="/admin/dashboard" className="action-button secondary">
                Dashboard
              </Link>
            ) : (
              // Se for Doador
              <Link href="/doador/perfil" className="action-button secondary">
                Meu Perfil
              </Link>
            )}
            
            <button onClick={signOut} className="action-button danger">
              SAIR
            </button>
          </>
        ) : (
          <>
            {/* --- Se ESTIVER DESLOGADO --- */}
            <Link href="/login" className="action-button primary">
              LOGIN
            </Link>
            <Link href="/registrar" className="action-button secondary">
              REGISTRAR
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};