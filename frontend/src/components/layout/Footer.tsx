"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import { FaInfo } from "react-icons/fa";
import './Footer.css'; 

const Footer: React.FC = () => {
  return (
    <footer className="footer-root">
      
      {/* Bloco 1: Container do Fundo Azul (100% da tela) */}
      <div className="footer-bloco-principal-container">
        
        {/* Wrapper de Conteúdo (Alinhado e com max-width) */}
        <div className="footer-wrapper-grid">
          
          {/* Coluna 1: O Logo */}
          <div className="footer-col-logo">
            <Link href="https://mariaclaro.org.br/">
            <Image
              src="/logomariaclarobw.svg" // Garanta que este arquivo existe em /public
              alt="Logo Instituto Maria Claro (Branca)"
              width={160}
              height={45}
            />
            </Link>
          </div>

          {/* Coluna 2: O conteúdo da direita (aninhado) */}
          <div className="footer-col-conteudo">
            
            {/* Linha 1: As 3 colunas de texto */}
            <div className="footer-linha-textos">
              {/* Coluna de Texto 1 */}
              <div className="footer-col-texto">
                <h3 className="footer-title">Instituto Maria Claro</h3>
                <p>
                  Lar Ivan Santos de Albuquerque mantenedor do Instituto Maria Claro<br />
                  {/* === CORREÇÃO AQUI: <Link> estava faltando === */}
                  CNPJ: 71.868.962/0001-05 Portal da Transparência<br />
                </p>
              </div>
              {/* Coluna de Texto 2 */}
              <div className="footer-col-texto">
                <h3 className="footer-title">Utilidade Federal</h3>
                <p>
                  Decreto 23.829/194-91 Utilidade Pública Estadual<br />
                  Conforme lei nº 10.260 de 26/03/1999 Utilidade Pública Municipal<br />
                  Decreto Lei nº 20.33 de 03/10/1979
                </p>
              </div>
              {/* Coluna de Texto 3 */}
              <div className="footer-col-texto">
                <h3 className="footer-title">Horário de Funcionamento</h3>
                <p>
                  O horário de funcionamento é de segunda-feira a sexta-feira, das 7:30 às 16:30. 
                  O trabalho desenvolvido abrange atendimento terapêutico, acompanhamento 
                  pedagógico, psicossocial e estimulação precoce.
                </p>
              </div>
            </div>

            {/* Linha 2: Email, LGPD, Social (com borda) */}
            <div className="footer-linha-contato-social">
              <div className="footer-contact">
                {/* === CORREÇÃO AQUI: <span> trocado por <a> para ser um link clicável === */}
                <p>
                    <span>E-mail: adm@mariaclaro.org.br</span>
                </p>
                <p>
                   <span> WhatsApp: (15) 98812-4427</span>
                </p>
              </div>
              <div className="footer-social-actions">
                <Link href="https://mariaclaro.org.br/#" className="lgpd-button">
                  LGPD
                </Link>
                <div className="footer-social-icons">
                  <a href="https://www.facebook.com/institutomariaclaro" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
                  <a href="https://www.instagram.com/institutomariaclaro" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                  <a href="https://www.linkedin.com/company/institutomariaclaro/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
                  <a href="https://api.whatsapp.com/send?phone=5515988124427" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
                  <a href="https://portaldatransparencia.gov.br/busca/pessoa-juridica/71868962000105-lar-espirita-ivan-santos-de-albuquerque" target="_blank" rel="noopener noreferrer" aria-label="Portal da Transparência (Info)"><FaInfo /></a>
                </div>
              </div>
            </div>
            
            {/* O copyright foi movido para aqui (dentro do bloco azul) */}
            <div className="footer-linha-copyright">
              <p>
                Desenvolvido por <a href="https://meow.digital/" target="_blank" rel="noopener noreferrer">Meow Digital</a> 2022
              </p>
            </div>

          </div> {/* Fim da Coluna 2 */}
        </div> {/* Fim do Wrapper de Conteúdo */}
      </div> {/* Fim do Bloco 1 (Fundo Azul) */}

      
    </footer>
  );
};

export default Footer;