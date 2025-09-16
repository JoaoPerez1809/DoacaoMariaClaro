import { Header } from "@/components/layout/Header";

export default function HomePage() {
  return (
    <div>
      <Header />
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          Bem-vindo ao Sistema de Doações
        </h1>
        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
          Faça o login para continuar.
        </p>
      </main>
    </div>
  );
}

