import { TopBar } from './TopBar';
// Correção: Importe 'Navbar' sem as chaves {}
import Navbar from './Navbar';

export function Header() {
  return (
    // O fragmento <>...</> permite-nos retornar múltiplos componentes
    <>
      <TopBar />
      <Navbar />
    </>
  );
}