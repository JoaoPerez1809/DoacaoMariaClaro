"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaBars, FaTimes, FaInfo, FaWhatsapp, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLLIElement>(null);

   const { isAuthenticated, signOut } = useAuth();

  const handleDropdownClick = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleMobileDropdownClick = (dropdownName: string) => {
    setOpenMobileDropdown(openMobileDropdown === dropdownName ? null : dropdownName);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    // 1. ADICIONA UM FRAGMENTO AQUI
    <>
      <header className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <Image src="/logomariaclaro.svg" alt="Logo Maria Claro" width={180} height={50} />
          </div>

          <nav className="navbar-main-nav">
            <ul>
              <li><Link href="https://mariaclaro.org.br">HOME</Link></li>
              
              <li 
                className="nav-dropdown" 
                onMouseEnter={() => setOpenDropdown('entidade')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="dropdown-trigger">
                  <Link href="https://mariaclaro.org.br/quemsomos">QUEM SOMOS</Link>
                  <FaChevronDown className="sub-arrow" />
                </div>
                <ul className={`dropdown-menu ${openDropdown === 'entidade' ? 'active' : ''}`}>
                  <li><Link href="https://mariaclaro.org.br/quemsomos/#nossahistoria">Nossa História</Link></li>
                  <li><Link href="https://mariaclaro.org.br/quemsomos/#linhadotempo">Linha do Tempo</Link></li>
                  <li><Link href="https://mariaclaro.org.br/o-que-fazemos">O que fazemos</Link></li>
                  <li><Link href="https://mariaclaro.org.br/nossos-numeros">Nossos Números</Link></li>
                  <li><Link href="https://mariaclaro.org.br/quemsomos/#ondeestamos">Onde Estamos</Link></li>
                  <li><Link href="https://mariaclaro.org.br/gestao">Nossa Gestão</Link></li>
                  <li><Link href="https://mariaclaro.org.br/quemsomos/#nossosparceiroseapoiadores">Nossos Parceiros e Apoiadores</Link></li>
                  <li><Link href="https://mariaclaro.org.br/quemsomos/#voluntariadoclinico">Voluntariado Clínico</Link></li>
                </ul>
              </li>

              <li><Link href="https://mariaclaro.org.br/como-ajudar">COMO AJUDAR</Link></li>
              <li><Link href="https://mariaclaro.org.br/voluntariado">VOLUNTARIADO</Link></li>
              <li><Link href="https://mariaclaro.org.br/imprensa">INPRENSA</Link></li>
              <li 
              className="nav-dropdown"
              onMouseEnter={() => setOpenDropdown('transparencia')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <div className="dropdown-trigger">
                <Link href="https://mariaclaro.org.br/transparencia">TRANSPARÊNCIA</Link>
                <FaChevronDown className="sub-arrow" />
              </div>
              <ul className={`dropdown-menu ${openDropdown === 'transparencia' ? 'active' : ''}`}>
                <li><Link href="https://mariaclaro.org.br/documentos-financeiros">Documentos Financeiros</Link></li>
                <li><Link href="https://mariaclaro.org.br/documentos-administrativos">Documentos Administrativos</Link></li>
                <li><Link href="https://mariaclaro.org.br/documentos-tecnicos-e-de-execucao">Documentos Técnicos e de Execução</Link></li>
                <li><Link href="https://mariaclaro.org.br/prestacao-de-contas-por-municipio-e-ano">Prestação de Contas</Link></li>
              </ul>
            </li>
              <li><Link href="https://mariaclaro.org.br/contato">Contato</Link></li>
            </ul>
          </nav>
          
          <div className="navbar-actions">
            <div className="social-icons">
              <a href="https://www.facebook.com/institutomariaclaro" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
              <a href="https://www.instagram.com/institutomariaclaro" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://api.whatsapp.com/send?phone=5515988124427" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
              <a href="https://portaldatransparencia.gov.br/busca/pessoa-juridica/71868962000105-lar-espirita-ivan-santos-de-albuquerque" target="_blank" rel="noopener noreferrer"><FaInfo /></a>
            </div>
            <Link href="/doar" className="donate-button">DOAR</Link>
            {isAuthenticated ? (
              <button onClick={signOut} className="logout-button">SAIR</button>
            ) : (
              <Link href="/login" className="login-button">LOGIN</Link>
            )}
          </div>
          
          <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>

      {isMobileMenuOpen && (
          <div className="mobile-header-social-icons">
            <div className="social-icons">
              <a href="https://www.facebook.com/institutomariaclaro" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
              <a href="https://www.instagram.com/institutomariaclaro" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://api.whatsapp.com/send?phone=5515988124427" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
              <a href="https://portaldatransparencia.gov.br/busca/pessoa-juridica/71868962000105-lar-espirita-ivan-santos-de-albuquerque" target="_blank" rel="noopener noreferrer"><FaInfo /></a>
            </div>
          </div>
          )}
      </header>
      
      {/* 3. O MENU MOBILE AGORA FICA AQUI, DO LADO DE FORA */}
      {isMobileMenuOpen && (
        <nav className="navbar-mobile-nav">
           <ul>
            <li><Link href="https://mariaclaro.org.br">HOME</Link></li>
            
            <li className="mobile-nav-dropdown">
              <div className="mobile-dropdown-trigger">
                <Link href="https://mariaclaro.org.br/quemsomos">QUEM SOMOS</Link>
                <FaChevronDown 
                  className={`sub-arrow ${openMobileDropdown === 'entidade' ? 'open' : ''}`} 
                  onClick={() => handleMobileDropdownClick('entidade')}
                />
              </div>
              <ul className={`mobile-dropdown-menu ${openMobileDropdown === 'entidade' ? 'active' : ''}`}>
                <li><Link href="https://mariaclaro.org.br/quemsomos/#nossahistoria">Nossa História</Link></li>
                <li><Link href="https://mariaclaro.org.br/quemsomos/#linhadotempo">Linha do Tempo</Link></li>
                <li><Link href="https://mariaclaro.org.br/o-que-fazemos">O que fazemos</Link></li>
                <li><Link href="https://mariaclaro.org.br/nossos-numeros">Nossos Números</Link></li>
                <li><Link href="https://mariaclaro.org.br/quemsomos/#ondeestamos">Onde Estamos</Link></li>
                <li><Link href="https://mariaclaro.org.br/gestao">Nossa Gestão</Link></li>
                <li><Link href="https://mariaclaro.org.br/quemsomos/#nossosparceiroseapoiadores">Nossos Parceiros e Apoiadores</Link></li>
                <li><Link href="https://mariaclaro.org.br/quemsomos/#voluntariadoclinico">Voluntariado Clínico</Link></li>
              </ul>
            </li>

            <li><Link href="https://mariaclaro.org.br/como-ajudar">COMO AJUDAR</Link></li>
            <li><Link href="https://mariaclaro.org.br/voluntariado">VOLUNTARIADO</Link></li>
            <li><Link href="https://mariaclaro.org.br/imprensa">INPRENSA</Link></li>
            
            <li className="mobile-nav-dropdown">
              <div className="mobile-dropdown-trigger">
                <Link href="https://mariaclaro.org.br/transparencia">TRANSPARÊNCIA</Link>
                <FaChevronDown 
                  className={`sub-arrow ${openMobileDropdown === 'transparencia' ? 'open' : ''}`} 
                  onClick={() => handleMobileDropdownClick('transparencia')}
                />
              </div>
              <ul className={`mobile-dropdown-menu ${openMobileDropdown === 'transparencia' ? 'active' : ''}`}>
                <li><Link href="https://mariaclaro.org.br/documentos-financeiros">Documentos Financeiros</Link></li>
                <li><Link href="https://mariaclaro.org.br/documentos-administrativos">Documentos Administrativos</Link></li>
                <li><Link href="https://mariaclaro.org.br/documentos-tecnicos-e-de-execucao">Documentos Técnicos e de Execução</Link></li>
                <li><Link href="https://mariaclaro.org.br/prestacao-de-contas-por-municipio-e-ano">Prestação de Contas</Link></li>
              </ul>
            </li>

            <li><Link href="https://mariaclaro.org.br/contato">CONTATO</Link></li>
            
            <li className="mobile-donate-button-container">
                <Link href="/doar" className="donate-button">DOAR</Link>
                {isAuthenticated ? (
                  <button onClick={signOut} className="logout-button">SAIR</button>
                ) : (
                  <Link href="/login" className="login-button">LOGIN</Link>
                )}
            </li>

            
          </ul>
        </nav>
      )}
    </> // 4. FECHA O FRAGMENTO
  );
};

export default Navbar;