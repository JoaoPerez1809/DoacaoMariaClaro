// src/app/(admin)/admin/doacoes/page.tsx
import React from "react";
import { Header } from "@/components/layout/Header";
import DoacoesDashboard from "@/components/Dashboard/DoacoesDashboard"; // (Vamos criar este)

export default function DoacoesPage() {
  return (
    <>
      <Header />
      <DoacoesDashboard />
    </>
  );
}