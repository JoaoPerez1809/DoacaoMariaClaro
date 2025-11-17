import { TopBar } from './TopBar';
import Navbar from './Navbar';
// 1. A ActionBar foi REMOVIDA daqui

export function Header() {
  return (
    <>
      <TopBar />
      <Navbar />
      {/* 2. A ActionBar foi REMOVIDA daqui */}
    </>
  );
}