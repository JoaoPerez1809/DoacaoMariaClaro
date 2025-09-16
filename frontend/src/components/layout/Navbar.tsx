'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // 1. Importe o componente Image
import styles from './Navbar.module.css';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Quem Somos', href: '/quem-somos' },
    { name: 'Como Ajudar', href: '/como-ajudar' },
    { name: 'Voluntariado', href: '/voluntariado' },
    { name: 'Imprensa', href: '/imprensa' },
    { name: 'Transparência', href: '/transparencia' },
    { name: 'Contato', href: '/contato' },
    { name: 'Doações', href: '/doar' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        {/* 2. Use o componente Image */}
        <Image 
          src="/logomariaclaro.svg" // 3. O caminho começa com "/"
          alt="Instituto Maria Claro" 
          width={150} // 4. Defina a largura
          height={50}  // 5. Defina a altura
          className={styles.logo}
        />
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </div>
        <ul className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          {menuItems.map(item => (
            <li key={item.name}>
              <Link href={item.href} className={styles.navLink}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
