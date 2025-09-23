import React from "react";
import { Header } from "@/components/layout/Header";
import Doacao from "./doacao";
import DashboardUsuarios from "../components/Dashboard/dashboard";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
import Perfil from "../components/Perfil/Profile";
import Dashboard from "../components/Dashboard/dashboard";
export default function HomePage() {
  return (
    <>
      <Header />
      <Dashboard />
    </>
  );
}

