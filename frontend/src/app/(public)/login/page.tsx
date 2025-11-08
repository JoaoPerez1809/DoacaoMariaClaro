import React from "react";
import { Header } from "@/components/layout/Header";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
import LoginForm from "@/components/auth/LoginForm";

export default function LoginUser() {
  return (
    <>
      <Header />
      <LoginForm />
    </>
  );
}