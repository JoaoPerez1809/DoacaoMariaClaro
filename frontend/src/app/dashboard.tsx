import React from "react";
import { FaThLarge, FaUsers, FaFileAlt, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./Dashboard.css";
 
const usuarios = [
  { id: "0001", nome: "Adrian Marandola", email: "adrianmarandola@gmail.com", papel: "Administrador", status: "Ativo" },
  { id: "0002", nome: "Gabriela Goncalves", email: "gabrielagoncalves@gmail.com", papel: "Colaboradora", status: "Ativo" },
  { id: "0003", nome: "Illany Nicole", email: "illanynicole@gmail.com", papel: "Colaboradora", status: "Ativo" },
  { id: "0004", nome: "Luiz Gabriel", email: "luizgabriel@gmail.com", papel: "Colaborador", status: "Ativo" },
  { id: "0005", nome: "João Vitor", email: "joaovitor@gmail.com", papel: "Colaborador", status: "Ativo" }
];
 
const Dashboard: React.FC = () => {
  return (
<div className="dashboard-container">
      {/* Menu lateral amarelo */}
<aside className="sidebar">
<ul>
<li><FaThLarge /></li>
<li className="active"><FaUsers /></li>
<li><FaFileAlt /></li>
<li><FaUser /></li>
<li><FaSignOutAlt /></li>
</ul>
</aside>
 
      <div className="dashboard-content">
        {/* Barra azul no topo */}
<header className="dashboard-header">Dashboard</header>
 
        {/* Conteúdo principal */}
<main className="dashboard-main">
<h2 className="titulo">Usuários</h2>
 
          <div className="tabela-container">
<table className="tabela">
<thead>
<tr>
<th>ID</th>
<th>Nome</th>
<th>E-mail</th>
<th>Papel</th>
<th>Status</th>
</tr>
</thead>
<tbody>
                {usuarios.map((user) => (
<tr key={user.id}>
<td>{user.id}</td>
<td>{user.nome}</td>
<td>{user.email}</td>
<td>{user.papel}</td>
<td>{user.status}</td>
</tr>
                ))}
</tbody>
</table>
</div>
</main>
</div>
</div>
  );
};
 
export default Dashboard;