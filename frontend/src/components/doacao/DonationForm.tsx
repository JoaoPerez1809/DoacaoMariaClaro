"use client";
import React, { useState } from "react";
import "./DonationForm.css";
 
const Doacao: React.FC = () => {
  const [valor, setValor] = useState("1000,00");
 
  const valoresRapidos = ["10,00", "100,00", "1000,00"];
 
  const handleClick = (v: string) => {
    setValor(v);
  };
 
  const handleDoar = () => {
    alert(`Você está doando R$ ${valor}`);
  };
 
  return (
<div className="doacao-container">
      {/* Header */}
<div className="doacao-header">Doação</div>
 
      <div className="doacao-content">
        {/* QR Code */}
<div className="qr-container">
<img src="/img/pix-qrcode.png" alt="QR Code Pix" className="qr-image" />
</div>
 
        {/* Lado direito */}
<div className="form-container">
          {/* Campo de valor */}
<input
            type="text"
            value={`R$${valor}`}
            onChange={(e) => setValor(e.target.value.replace("R$", ""))}
            className="valor-input"
          />
 
          {/* Botões rápidos */}
<div className="botoes-rapidos">
            {valoresRapidos.map((v) => (
<button
                key={v}
                onClick={() => handleClick(v)}
                className="botao-rapido"
>
                R${v}
</button>
            ))}
</div>
 
          {/* Botão doar */}
<button onClick={handleDoar} className="botao-doar">
            Doar
</button>
</div>
</div>
</div>
  );
};
 
export default Doacao;