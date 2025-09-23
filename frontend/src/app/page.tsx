import React from "react";
import { Header } from "@/components/layout/Header";
import Doacao from "./doacao";
<<<<<<< HEAD
import DashboardUsuarios from "./dashboard";
import Card, { CardContent } from "./card";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
=======
import Cadastro from "./cadastro";  
import Perfil from "./perfil";
import Dashboard from "./dashboard";
>>>>>>> b09c66ca7c78434675278a69ada825fec80ae23f

export default function HomePage() {
  return (
    <>
      <Header />
<<<<<<< HEAD
  
      <DashboardUsuarios />
=======
      <Dashboard />
>>>>>>> b09c66ca7c78434675278a69ada825fec80ae23f
    </>
  );
}

