"use client"; // Adicione esta linha no topo

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Precisaremos para o signOut
import { getMyProfile, deleteUserRequest } from '@/services/userService';
import type { UserDto } from '@/types/user';
import "./Profile.css";
import { useRouter } from 'next/navigation'; // Para redirecionar após deletar

// O componente não precisa mais de props
const Profile: React.FC = () => {
  const { signOut } = useAuth();
  const router = useRouter(); // Hook para redirecionamento

  // 1. Mova os estados para cá
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Mova o useEffect para cá
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setUser(data);
      } catch (err) {
        console.error("Falha ao buscar dados do perfil:", err);
        setError("Não foi possível carregar seu perfil. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []); // O array vazio garante que a busca ocorre apenas uma vez

  // 3. Mova as funções para cá

  const handleDelete = async () => {
    if (user && window.confirm("Tem certeza que deseja deletar sua conta? Esta ação é irreversível.")) {
      try {
        await deleteUserRequest(user.id);
        alert("Conta deletada com sucesso.");
        signOut(); // Desloga o usuário
        router.push("/"); // Redireciona para a home
      } catch (err) {
        console.error("Erro ao deletar usuário:", err);
        alert("Não foi possível deletar a conta. Tente novamente.");
      }
    }
  };

  // 4. Mova a lógica de renderização para cá
  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando perfil...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;
  }

  // Se não estiver carregando, não deu erro e o usuário existe, renderize o perfil
  if (user) {
    return (
      <>
        <header className="topbar">Perfil</header>
        <div className="perfil-container">
          <h1 className="perfil-nome">{user.nome}</h1>

          <div className="card">
            <h2 className="card-title">Informações Pessoais</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Email:</strong>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <strong>Tipo de Conta:</strong>
                <span>{user.tipoUsuario}</span>
              </div>
            </div>
            {/* <div className="actions">
              <button className="delete-button" onClick={handleDelete}>Deletar Conta</button>
            </div> */}
          </div>

          <br></br>

          <div className="card">
            <h2 className="card-title">Histórico de Doações</h2>
            <table className="tabela-doacoes">
              {/* ... conteúdo da tabela ... */}
            </table>
          </div>
        </div>
      </>
    );
  }

  // Caso o usuário não seja encontrado por algum motivo
  return <p style={{ textAlign: 'center', marginTop: '50px' }}>Nenhum dado de usuário encontrado.</p>;
};

export default Profile;