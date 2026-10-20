"use client";
import { type ReactNode, useEffect, useState } from "react";
import Header from "./header/Header";
import SideBar from "./SideBar";

interface LayoutProps {
  children: ReactNode;
}

function LayoutPage({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      } else {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <SideBar menuOpen={menuOpen} onToggleMenu={toggleMenu} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header onToggleMenu={toggleMenu} />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

export default LayoutPage;
