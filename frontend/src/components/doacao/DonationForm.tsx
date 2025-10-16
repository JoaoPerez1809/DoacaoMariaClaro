"use client";
import React, { useState } from "react";
import "./DonationForm.css";
import { api } from "@/services/api"; // Importe sua instância do Axios

const Doacao: React.FC = () => {
  const [valor, setValor] = useState("100.00"); // Use . como separador decimal
  const [isLoading, setIsLoading] = useState(false);

  const valoresRapidos = ["10.00", "100.00", "1000.00"];

  const handleClick = (v: string) => {
    setValor(v);
  };

  const handleDoar = async () => {
    setIsLoading(true);
    try {
      // 1. Limpa o valor para enviar ao backend
      const valorNumerico = parseFloat(valor.replace(",", "."));

      // 2. Chama o seu backend para criar a preferência
      const response = await api.post('/pagamento/criar-preferencia', { valor: valorNumerico });
      
      const { initPoint } = response.data;

      // 3. Redireciona o usuário para o checkout do Mercado Pago
      if (initPoint) {
        window.location.href = initPoint;
      }

    } catch (error) {
      console.error("Erro ao criar a preferência de pagamento:", error);
      alert("Não foi possível iniciar o processo de doação. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="doacao-container">
      <div className="doacao-header">Doação</div>
      <div className="doacao-content">
        <div className="qr-container">
          <img src="/img/pix-qrcode.png" alt="QR Code Pix" className="qr-image" />
        </div>
        <div className="form-container">
          <input
            type="text"
            value={`R$${valor}`}
            onChange={(e) => setValor(e.target.value.replace("R$", ""))}
            className="valor-input"
          />
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