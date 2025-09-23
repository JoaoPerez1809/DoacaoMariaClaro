import { AuthProvider } from '@/contexts/AuthContext'; // Importe o seu provider
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider> {/* Envolva a aplicação com o provider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
