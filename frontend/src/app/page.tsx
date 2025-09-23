import { Header } from "@/components/layout/Header";
import Doacao from "./doacao";
import Cadastro from "./cadastro";  
import Perfil from "./perfil";
import Dashboard from "./dashboard";

export default function HomePage() {
  return (
    <>
      <Header />
      <Dashboard />
    </>
  );
}

