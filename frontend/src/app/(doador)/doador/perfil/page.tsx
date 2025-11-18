"use client";

import React from 'react';
import { Header } from '@/components/layout/Header';
import Profile from '@/components/Perfil/Profile'; // Importe o componente de Perfil


const PerfilPage: React.FC = () => {
  return (
    <>
      {/* O Header pode ser adicionado aqui se for necessário no layout da página de perfil */}
      <Header /> 
      <Profile />
    </>
  );
};

export default PerfilPage;