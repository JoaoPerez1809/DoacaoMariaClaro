import React from "react";
import { Header } from "@/components/layout/Header";
import "@/app/globals.css"; // Certifique-se de que o caminho está correto
import Dashboard from "@/components/Dashboard/dashboard";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <Dashboard />
    </>
  );
}
