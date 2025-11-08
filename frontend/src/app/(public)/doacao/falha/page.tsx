import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { FaTimesCircle } from 'react-icons/fa';
import './feedback.css';

export default function FalhaPage() {
  return (
    <>
      <Header />
      <div className="feedback-container">
        <div className="feedback-card">
          <FaTimesCircle className="feedback-icon failure" />
          <h1>Pagamento Recusado</h1>
          <p>Houve um problema ao processar sua doação. Por favor, tente novamente ou entre em contato conosco.</p>
          <Link href="/doar" className="feedback-button">
            Tentar Novamente
          </Link>
        </div>
      </div>
    </>
  );
}