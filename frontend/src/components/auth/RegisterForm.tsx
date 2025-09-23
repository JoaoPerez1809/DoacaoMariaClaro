"use client";
import React, { useState } from "react";
import "./RegisterForm.css";
 
const RegisterForm: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }
 
    alert(`Usuário ${nome} cadastrado com sucesso!`);
    // Aqui você pode salvar os dados em um backend ou localStorage
  };
 
  return (
<div className="cadastro-container">
<header className="topbar">Doação</header>
<div className="form-box">
<h2>Cadastro</h2>
<form onSubmit={handleSubmit}>
<input
            type="text"
            placeholder="Insira seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
<input
            type="email"
            placeholder="Insira seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
<input
            type="password"
            placeholder="Insira sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
<input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
<button type="submit">Cadastrar</button>
</form>
</div>
</div>
  );
};
 
export default RegisterForm;