import React from "react";
import { Header } from "@/components/layout/Header";
import DonationForm from "../components/doacao/DonationForm";
import DashboardUsuarios from "../components/Dashboard/dashboard";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
import Perfil from "../components/Perfil/Profile";
import Dashboard from "../components/Dashboard/dashboard";
import { LoginForm } from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
export default function HomePage() {
  return (
    <>
      <Header />
      <RegisterForm/>
    </>
  );
}

