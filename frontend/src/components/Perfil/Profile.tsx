"use client"; 

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, deleteUserRequest, updateUserRequest, getMyDonationsRequest } from '@/services/userService';
import type { UserDto, UserUpdateDto, TipoPessoa, PagamentoDto } from '@/types/user';
import "./Profile.css"; 
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { isValidCPF, isValidCNPJ } from "@/utils/validators";
import { ActionBar } from '@/components/layout/ActionBar';
import { 
  formatDataParaInput, 
  formatDataExibicao, 
  formatValor, 
  formatStatus,
  maskCPF,
  maskCNPJ,
  maskTelefone,
  maskCEP
} from '@/utils/formatters';
import toast from 'react-hot-toast';

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
];

const Profile: React.FC = () => {
  const { signOut } = useAuth();
  const router = useRouter(); 

  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [donations, setDonations] = useState<PagamentoDto[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); 
  
  // --- NOVO ESTADO (Para o loading do ViaCEP) ---
  const [isCepLoading, setIsCepLoading] = useState(false); 

  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTipoPessoa, setEditTipoPessoa] = useState<TipoPessoa | undefined>(undefined);
  const [editDocumento, setEditDocumento] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editEndereco, setEditEndereco] = useState("");
  const [editBairro, setEditBairro] = useState("");
  const [editCidade, setEditCidade] = useState("");
  const [editEstado, setEditEstado] = useState("");
  const [editGenero, setEditGenero] = useState("");
  const [editComercioEndereco, setEditComercioEndereco] = useState("");
  const [editDataNascimento, setEditDataNascimento] = useState(""); 

  const preencherFormEdicao = (data: UserDto) => {
    setEditNome(data.nome);
    setEditEmail(data.email);
    setEditTipoPessoa(data.tipoPessoa);
    
    let docFormatado = data.documento || "";
    if (data.tipoPessoa === 'Fisica' && docFormatado) docFormatado = maskCPF(docFormatado);
    if (data.tipoPessoa === 'Juridica' && docFormatado) docFormatado = maskCNPJ(docFormatado);
    
    setEditDocumento(docFormatado);
    setEditTelefone(data.telefone ? maskTelefone(data.telefone) : "");
    setEditCep(data.cep ? maskCEP(data.cep) : "");

    setEditEndereco(data.endereco || "");
    setEditBairro(data.bairro || "");
    setEditCidade(data.cidade || "");
    setEditEstado(data.estado || "");
    setEditGenero(data.genero || "");
    setEditComercioEndereco(data.comercioEndereco || "");
    setEditDataNascimento(formatDataParaInput(data.dataNascimento)); 
  };
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const profileData = await getMyProfile();
        setUser(profileData);
        preencherFormEdicao(profileData);
        
      } catch (err) {
        console.error("Falha ao buscar dados do perfil:", err);
        setError("Não foi possível carregar seu perfil. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }

      try {
        setDonationsLoading(true);
        const donationsData = await getMyDonationsRequest();
        setDonations(donationsData);
      } catch (err) {
        console.error("Falha ao buscar doações:", err);
      } finally {
        setDonationsLoading(false);
      }
    };

    fetchAllData();
  }, []); 

  const limparDocumento = (doc: string): string => doc.replace(/[^\d]/g, ""); 
  const limparTelefone = (tel: string): string => tel.replace(/[^\d]/g, "");
  const limparCep = (cep: string): string => cep.replace(/[^\d]/g, "");

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (editTipoPessoa === 'Fisica') {
      setEditDocumento(maskCPF(valor));
    } else if (editTipoPessoa === 'Juridica') {
      setEditDocumento(maskCNPJ(valor));
    } else {
      setEditDocumento(valor); 
    }
  };
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTelefone(maskTelefone(e.target.value));
  };
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditCep(maskCEP(e.target.value));
  };
  
  // --- NOVA FUNÇÃO (ViaCEP) ---
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepLimpo = limparCep(e.target.value);

    // 1. Verifica se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return; // Não faz nada se não tiver 8 dígitos
    }
    
    setIsCepLoading(true);
    
    try {
      // 2. Chama a API pública do ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      // 3. Verifica se o CEP é inválido (ViaCEP retorna {erro: true})
      if (data.erro) {
        toast.error("CEP não encontrado.");
        setEditEndereco("");
        setEditBairro("");
        setEditCidade("");
        setEditEstado("");
        return;
      }

      // 4. Preenche os campos automaticamente
      setEditEndereco(data.logradouro || "");
      setEditBairro(data.bairro || "");
      setEditCidade(data.localidade || "");
      setEditEstado(data.uf || "");
      
      // Opcional: Focar no campo "Endereço" para o usuário digitar o número
      document.getElementById("endereco")?.focus();
      
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      toast.error("Não foi possível buscar o CEP. Tente novamente.");
    } finally {
      setIsCepLoading(false);
    }
  };
  // --- FIM DA FUNÇÃO ViaCEP ---

  // Função para enviar a atualização
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsUpdating(true); 

    const documentoLimpo = limparDocumento(editDocumento);
    const telefoneLimpo = limparTelefone(editTelefone);
    const cepLimpo = limparCep(editCep);

    if (documentoLimpo.length > 0) {
        if (editTipoPessoa === 'Fisica' && !isValidCPF(documentoLimpo)) {
            toast.error("CPF inválido. Verifique os dígitos.");
            setIsUpdating(false);
            return;
        }
        if (editTipoPessoa === 'Juridica' && !isValidCNPJ(documentoLimpo)) {
            toast.error("CNPJ inválido. Verifique os dígitos.");
            setIsUpdating(false);
            return;
        }
         if (!editTipoPessoa) {
           toast.error("Selecione o tipo de pessoa (Física ou Juridica) para o documento informado.");
           setIsUpdating(false);
           return;
         }
    } else if (editTipoPessoa) {
         toast.error("CPF/CNPJ é obrigatório ao selecionar um Tipo de Pessoa.");
         setIsUpdating(false);
         return;
    }

    if (!user) return; 

    const updateData: UserUpdateDto = {
        nome: editNome,
        email: editEmail,
        tipoPessoa: editTipoPessoa,
        documento: documentoLimpo.length > 0 ? documentoLimpo : undefined,
        telefone: telefoneLimpo.length > 0 ? telefoneLimpo : undefined,
        cep: cepLimpo.length > 0 ? cepLimpo : undefined,
        endereco: editEndereco || undefined,
        bairro: editBairro || undefined,
        cidade: editCidade || undefined,
        estado: editEstado || undefined,
        genero: editGenero || undefined,
        comercioEndereco: editComercioEndereco || undefined,
        dataNascimento: editDataNascimento || undefined
    };

    try {
        await updateUserRequest(user.id, updateData);
        toast.success("Perfil atualizado com sucesso!");
        setIsEditing(false); 
        
        setLoading(true);
        const profileData = await getMyProfile();
        setUser(profileData);
        preencherFormEdicao(profileData);
        setLoading(false);

    } catch (err) {
        if (err instanceof AxiosError && err.response?.data) {
            const apiError = err.response.data;
            let message = "Erro ao atualizar perfil.";
            if (typeof apiError === 'string') {
                message = apiError;
            } else if (apiError.errors) {
                const firstErrorKey = Object.keys(apiError.errors)[0];
                message = apiError.errors[firstErrorKey][0];
            } else if (apiError.message || apiError.title) {
                message = apiError.message || apiError.title;
            }
            toast.error(message);
        } else {
            toast.error("Não foi possível conectar ao servidor. Tente novamente.");
            console.error(err);
        }
    } finally {
        setIsUpdating(false); 
    }
  };

  // --- Renderização ---
  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando perfil...</p>;
  }
  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;
  }
  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Nenhum dado de usuário encontrado.</p>;
  }

  return (
    <>
      <header className="topbar">Perfil</header>
      <ActionBar />
      
      <div className="perfil-container">
        <h1 className="perfil-nome">{isEditing ? 'Editar Perfil' : user.nome}</h1>

        {isEditing ? (
          // --- MODO DE EDIÇÃO (COM DROPDOWNS E MÁSCARAS) ---
          <form onSubmit={handleUpdate} className='edit-form' style={{width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '25px'}}>
            
            {/* Card 1: Dados Obrigatórios e Documentos */}
            <div className="card">
              <h2 className="card-title">Dados Obrigatórios</h2>
              <div className="form-group">
                <label htmlFor="nome">Nome / Razão Social:</label>
                <input type="text" id="nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required disabled={isUpdating} />
              </div>
              <div className="form-group">
                 <label htmlFor="email">Email:</label>
                 <input type="email" id="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required disabled={isUpdating} />
              </div>
              <h3 className="card-subtitle">Documentos</h3>
              <div className="form-group tipo-pessoa-edit">
                 <label>Tipo de Pessoa:</label>
                 <div>
                    <label>
                       <input type="radio" name="editTipoPessoa" value="Fisica" checked={editTipoPessoa === 'Fisica'} onChange={() => setEditTipoPessoa('Fisica')} disabled={isUpdating} /> Física
                    </label>
                    <label>
                       <input type="radio" name="editTipoPessoa" value="Juridica" checked={editTipoPessoa === 'Juridica'} onChange={() => setEditTipoPessoa('Juridica')} disabled={isUpdating} /> Jurídica
                    </label>
                 </div>
              </div>
               <div className="form-group">
                  <label htmlFor="documento">CPF / CNPJ:</label>
                  <input
                     type="text"
                     id="documento"
                     placeholder={editTipoPessoa === 'Fisica' ? "CPF (___.___.___-__)" : editTipoPessoa === 'Juridica' ? "CNPJ (__.___.___/____-__)" : "Selecione o tipo acima"}
                     value={editDocumento}
                     onChange={handleDocumentoChange} 
                     disabled={isUpdating || !editTipoPessoa}
                     maxLength={editTipoPessoa === 'Fisica' ? 14 : 18} 
                  />
               </div>
            </div>

            {/* Card 2: Dados Extras (Atualizado) */}
            <div className="card">
                <h2 className="card-title">Dados Extras (Não Obrigatório)</h2>
                
                <div className="form-group">
                   <label htmlFor="genero">Gênero:</label>
                   <select 
                     id="genero" 
                     value={editGenero} 
                     onChange={(e) => setEditGenero(e.target.value)} 
                     disabled={isUpdating}
                   >
                     <option value="">Selecione...</option>
                     <option value="Masculino">Masculino</option>
                     <option value="Feminino">Feminino</option>
                     <option value="Outro">Outro</option>
                     <option value="NaoInformar">Prefiro não informar</option>
                   </select>
                </div>
                
                <div className="form-group">
                   <label htmlFor="dataNascimento">Data de Nascimento:</label>
                   <input type="date" id="dataNascimento" value={editDataNascimento} onChange={(e) => setEditDataNascimento(e.target.value)} disabled={isUpdating} />
                </div>
                
                <div className="form-group">
                   <label htmlFor="telefone">Telefone / Celular:</label>
                   <input 
                     type="tel" 
                     id="telefone" 
                     placeholder="(XX) XXXXX-XXXX" 
                     value={editTelefone} 
                     onChange={handleTelefoneChange} 
                     disabled={isUpdating} 
                     maxLength={15} 
                   />
                </div>

                <div className="form-group">
                   <label htmlFor="cep">CEP:</label>
                   <input 
                     type="text" 
                     id="cep" 
                     placeholder={isCepLoading ? "Buscando..." : "XXXXX-XXX"} // <-- MUDANÇA
                     value={editCep} 
                     onChange={handleCepChange} 
                     onBlur={handleCepBlur} // <-- MUDANÇA (Aciona o ViaCEP)
                     disabled={isUpdating || isCepLoading} // <-- MUDANÇA
                     maxLength={9} 
                   />
                </div>

                <div className="form-group">
                   <label htmlFor="endereco">Endereço (Rua, N°, Compl.):</label>
                   {/* --- MUDANÇA: Desabilita enquanto o CEP carrega --- */}
                   <input type="text" id="endereco" value={editEndereco} onChange={(e) => setEditEndereco(e.target.value)} disabled={isUpdating || isCepLoading} />
                </div>
                <div className="form-group">
                   <label htmlFor="bairro">Bairro:</label>
                   <input type="text" id="bairro" value={editBairro} onChange={(e) => setEditBairro(e.target.value)} disabled={isUpdating || isCepLoading} />
                </div>
                <div className="form-group">
                   <label htmlFor="cidade">Cidade:</label>
                   <input type="text" id="cidade" value={editCidade} onChange={(e) => setEditCidade(e.target.value)} disabled={isUpdating || isCepLoading} />
                </div>

                <div className="form-group">
                   <label htmlFor="estado">Estado (UF):</label>
                   <select 
                     id="estado" 
                     value={editEstado} 
                     onChange={(e) => setEditEstado(e.target.value)} 
                     disabled={isUpdating || isCepLoading} // <-- MUDANÇA
                   >
                     <option value="">Selecione...</option>
                     {estadosBrasileiros.map(uf => (
                       <option key={uf} value={uf}>{uf}</option>
                     ))}
                   </select>
                </div>

                <div className="form-group">
                   <label htmlFor="comercioEndereco">Endereço Comercial:</label>
                   <input type="text" id="comercioEndereco" value={editComercioEndereco} onChange={(e) => setEditComercioEndereco(e.target.value)} disabled={isUpdating} />
                </div>

                 <div className="edit-actions">
                     <button type="button" onClick={() => { setIsEditing(false); user && preencherFormEdicao(user); }} disabled={isUpdating} className='cancel-button'>Cancelar</button>
                     <button type="submit" disabled={isUpdating || isCepLoading} className='save-button'>
                        {isUpdating ? 'Salvando...' : (isCepLoading ? 'Aguarde o CEP...' : 'Salvar Alterações')}
                     </button>
                 </div>
            </div>
            
          </form>
        ) : (
          // --- MODO DE VISUALIZAÇÃO (Sem alterações) ---
          <>
            <div className="card">
              <h2 className="card-title">Meus Dados</h2>
              <div className="info-grid">
                <div className="info-item"><strong>Nome:</strong> <span>{user.nome}</span></div>
                <div className="info-item"><strong>Email:</strong> <span>{user.email}</span></div>
                <div className="info-item"><strong>Tipo de Conta:</strong> <span>{user.tipoUsuario}</span></div>
                <div className="info-item"><strong>Membro desde:</strong> <span>{formatDataExibicao(user.dataCadastro)}</span></div>
              </div>
              <h3 className="card-subtitle">Documentos</h3>
              <div className="info-grid">
                <div className="info-item"><strong>Tipo de Pessoa:</strong> <span>{user.tipoPessoa || 'Não informado'}</span></div>
                <div className="info-item"><strong>CPF/CNPJ:</strong> <span>{user.tipoPessoa === 'Fisica' ? maskCPF(user.documento || '') : user.tipoPessoa === 'Juridica' ? maskCNPJ(user.documento || '') : 'Não informado'}</span></div>
              </div>
               <div className="actions">
                  <button className="edit-button" onClick={() => setIsEditing(true)}>Editar Perfil</button>
               </div>
            </div>

            <div className="card">
              <h2 className="card-title">Dados Extras (Não Obrigatório)</h2>
              <div className="info-grid">
                <div className="info-item"><strong>Telefone:</strong> <span>{user.telefone ? maskTelefone(user.telefone) : 'Não informado'}</span></div>
                <div className="info-item"><strong>Gênero:</strong> <span>{user.genero || 'Não informado'}</span></div>
                <div className="info-item"><strong>Data Nasc.:</strong> <span>{formatDataExibicao(user.dataNascimento)}</span></div>
                <div className="info-item"><strong>CEP:</strong> <span>{user.cep ? maskCEP(user.cep) : 'Não informado'}</span></div>
                <div className="info-item"><strong>Endereço:</strong> <span>{user.endereco || 'Não informado'}</span></div>
                <div className="info-item"><strong>Bairro:</strong> <span>{user.bairro || 'Não informado'}</span></div>
                <div className="info-item"><strong>Cidade:</strong> <span>{user.cidade || 'Não informado'}</span></div>
                <div className="info-item"><strong>Estado:</strong> <span>{user.estado || 'Não informado'}</span></div>
                <div className="info-item"><strong>End. Comercial:</strong> <span>{user.comercioEndereco || 'Não informado'}</span></div>
              </div>
            </div>
          </>
        )}

        {/* Card 3: Histórico de Doações (Sem alterações) */}
        <div className="card">
          <h2 className="card-title">Histórico de Doações</h2>
          <table className="tabela-doacoes">
             <thead>
               <tr>
                 <th>Data</th>
                 <th>Valor</th>
                 <th>Status</th>
               </tr>
             </thead>
             <tbody>
              {donationsLoading ? (
                <tr><td colSpan={3} style={{textAlign: 'center', padding: '20px'}}>Carregando histórico...</td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan={3} style={{textAlign: 'center', padding: '20px'}}>Nenhuma doação aprovada encontrada.</td></tr>
              ) : (
                donations.map((doacao, index) => (
                  <tr key={index}>
                    <td>{formatDataExibicao(doacao.dataCriacao)}</td>
                    <td>{formatValor(doacao.valor)}</td>
                    <td>{formatStatus(doacao.status)}</td>
                  </tr>
                ))
              )}
             </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Profile;