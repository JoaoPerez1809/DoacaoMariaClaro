import React from "react";
import { Header } from "@/components/layout/Header";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
import DonationForm from "@/components/doacao/DonationForm";

export default function DonationPage() {
  return (
    <>
      <Header />
      <DonationForm />
    </>
  );
}