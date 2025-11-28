"use client";
import React, { useState } from "react";
import "./DonationForm.css";
import { api } from "@/services/api"; 

import { ActionBar } from '@/components/layout/ActionBar';

const Doacao: React.FC = () => {
  const [valor, setValor] = useState("100.00"); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valoresRapidos = ["10.00", "20.00", "50.00"];

  const handleClick = (v: string) => {
    setValor(v);
    setError(null); 
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace("R$", "");
    let filteredValue = inputValue.replace(/[^0-9,.]/g, "");
    setValor(filteredValue);
    
    if (error) {
      setError(null);
    }
  };

  const handleDoar = async () => {
    setIsLoading(true);
    setError(null); 
    
    try {
      const valorNumerico = parseFloat(valor.replace(",", "."));

      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        setError("Por favor, insira um valor válido.");
        setIsLoading(false);
        return;
      }

      if (valorNumerico > 100000) {
        setError("O valor não pode exceder R$ 100.000,00.");
        setIsLoading(false);
        return;
      }

      const response = await api.post('/pagamento/criar-preferencia', { valor: valorNumerico });
      const { initPoint } = response.data;

      if (initPoint) {
        window.location.href = initPoint;
      }

    } catch (err) {
      console.error("Erro ao criar a preferência de pagamento:", err);
      setError("Não foi possível iniciar a doação. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <> {/* <--- CORREÇÃO AQUI (removido o comentário com erro) */}
      <div className="doacao-header">Doação</div>
      
      <ActionBar />
      
      <div className="doacao-container">
        <div className="doacao-content">
          <div className="qr-container">
            <img src="/img/QRcode-pix-itau-site-01.webp" alt="QR Code Pix" className="qr-image" />
          </div>
          <div className="form-container">
            <label htmlFor="valorInput" style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            Digite o valor da sua doação:
            </label>

            <input
              type="text" 
              value={`R$${valor}`}
              onChange={handleValorChange}
              className={`valor-input ${error ? 'input-error' : ''}`}
            />
            
            {error && <p className="donation-error-message">{error}</p>}
            
            <div className="botoes-rapidos">
              {valoresRapidos.map((v) => (
                <button key={v} onClick={() => handleClick(v)} className="botao-rapido">
                  R${v}
                </button>
              ))}
            </div>
            <button onClick={handleDoar} className="botao-doar" disabled={isLoading}>
              {isLoading ? 'Aguarde...' : 'Doar com Mercado Pago'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doacao;