"use client";
import React, { useState } from "react";
import "./DonationForm.css";
import { api } from "@/services/api"; // Importe sua instância do Axios

const Doacao: React.FC = () => {
  const [valor, setValor] = useState("100.00"); // Use . como separador decimal
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. ADICIONAR NOVO ESTADO PARA O ERRO
  const [error, setError] = useState<string | null>(null);

  const valoresRapidos = ["10.00", "100.00", "1000.00"];

  const handleClick = (v: string) => {
    setValor(v);
    setError(null); // Limpa o erro ao clicar em um botão rápido
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace("R$", "");
    let filteredValue = inputValue.replace(/[^0-9,.]/g, "");
    setValor(filteredValue);
    
    // 2. LIMPAR O ERRO QUANDO O USUÁRIO DIGITAR
    if (error) {
      setError(null);
    }
  };

  const handleDoar = async () => {
    setIsLoading(true);
    setError(null); // 3. Limpa erros anteriores
    
    try {
      const valorNumerico = parseFloat(valor.replace(",", "."));

      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        // 4. SUBSTITUIR O ALERT
        setError("Por favor, insira um valor válido.");
        setIsLoading(false);
        return;
      }

      if (valorNumerico > 100000) {
        // 5. SUBSTITUIR O ALERT
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
      // 6. SUBSTITUIR O ALERT
      setError("Não foi possível iniciar a doação. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="doacao-container">
      <div className="doacao-header">Doação</div>
      <div className="doacao-content">
        <div className="qr-container">
          <img src="/img/QRcode-pix-itau-site-01.webp" alt="QR Code Pix" className="qr-image" />
        </div>
        <div className="form-container">
          <input
            type="text" 
            value={`R$${valor}`}
            onChange={handleValorChange}
            // 7. ADICIONAR CLASSE CONDICIONAL DE ERRO
            className={`valor-input ${error ? 'input-error' : ''}`}
          />
          
          {/* 8. EXIBIR A MENSAGEM DE ERRO (se ela existir) */}
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
  );
};

export default Doacao;