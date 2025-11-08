import React from "react";
import { Header } from "@/components/layout/Header";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
import RegisterForm from "@/components/auth/RegisterForm";

export default function CreateUser() {
  return (
    <>
      <Header />
      <RegisterForm />
    </>
  );
}