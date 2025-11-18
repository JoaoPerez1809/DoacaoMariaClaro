import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { ActionBar } from '@/components/layout/ActionBar'; // Importe
import { FaCheckCircle } from 'react-icons/fa';
// CSS é importado no layout.tsx

export default function SucessoPage() {
  return (
    <>
      <Header />
      <ActionBar /> {/* Adicione aqui */}
      <div className="feedback-container">
        <div className="feedback-card">
          <FaCheckCircle className="feedback-icon success" />
          <h1>Doação Aprovada!</h1>
          <p>Muito obrigado pela sua contribuição. Sua ajuda faz toda a diferença!</p>
          <Link href="/" className="feedback-button">
            Voltar para a Home
          </Link>
        </div>
      </div>
    </>
  );
}