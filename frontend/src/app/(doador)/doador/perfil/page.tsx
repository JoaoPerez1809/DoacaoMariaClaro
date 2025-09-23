import React from "react";
import { Header } from "@/components/layout/Header";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
import Profile from "@/components/Perfil/Profile";

export default function ProfilePage() {
  return (
    <>
      <Header />
      <Profile />
      
    </>
  );
}