import { TopBar } from './TopBar';
import { Navbar } from './Navbar';

export function Header() {
  return (
    // O fragmento <>...</> permite-nos retornar múltiplos componentes
    <>
      <TopBar />
      <Navbar />
    </>
  );
}
