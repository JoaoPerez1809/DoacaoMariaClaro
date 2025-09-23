import React from "react";

import "./Profile.css";

interface Doacao {

  data: string;

  valor: string;

}

const doacoes: Doacao[] = [

  { data: "12/04/2024", valor: "R$ 100,00" },

  { data: "03/03/2024", valor: "R$ 50,00" },

  { data: "15/01/2024", valor: "R$ 30,00" },

];

const Profile: React.FC = () => {

  const nome = "Vanessa";

  return (
    <>
      <header className="topbar">Perfil</header>
      <div className="perfil-container">
        <h1 className="perfil-nome">{nome}</h1>

        <div className="card">
          <h2 className="card-title">Histórico de Doações</h2>
          <table className="tabela-doacoes">
            <thead>
              <tr>
                <th>Data</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>

              {doacoes.map((d, index) => (
                <tr key={index}>
                  <td>{d.data}</td>
                  <td>{d.valor}</td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>

  );

};

export default Profile;
