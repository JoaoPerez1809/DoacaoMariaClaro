import React from "react";
import { Header } from "@/components/layout/Header";
import RegisterForm from "@/components/auth/RegisterForm";

export default function CreateUser() {
  return (
    <>
      <Header />
      <RegisterForm />
    </>
  );
}