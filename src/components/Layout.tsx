import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { NAV, Sidebar } from './Sidebar.tsx';
import { cn } from '../lib/utils';

const Layout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const current = NAV.find((n) => (n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)));

  // El menú móvil se cierra con Escape y no deja desplazar el fondo mientras está abierto
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <div className="flex h-dvh bg-[color:var(--surface-page)]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Saltar al contenido
      </a>

      {/* Barra lateral fija desde 1024px */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Menú deslizable en celular y tablet */}
      <div className={cn('lg:hidden fixed inset-0 z-40', isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!isDrawerOpen}>
        <div
          className={cn('absolute inset-0 bg-primary-950/50 transition-opacity duration-200', isDrawerOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setIsDrawerOpen(false)}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-[min(18rem,85vw)] shadow-2xl transition-transform duration-200 ease-out',
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          // inert evita que el teclado entre al menú cuando está cerrado
          {...(!isDrawerOpen ? { inert: '' } : {})}
        >
          <Sidebar onNavigate={() => setIsDrawerOpen(false)} onClose={() => setIsDrawerOpen(false)} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior en celular y tablet */}
        <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[color:var(--border)] bg-white/95 px-2 sm:px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <button
            className="icon-btn"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={isDrawerOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/soy_logo.webp" alt="" className="h-7 w-7 rounded-full" />
          <span className="truncate text-[15px] font-semibold text-[color:var(--text-strong)]">
            Excelencia <span className="font-normal text-[color:var(--text-muted)]">de la Soya</span>
          </span>
          {current && <span className="sr-only">{current.label}</span>}
        </header>

        <main id="contenido" className="flex-1 overflow-y-auto" tabIndex={-1}>
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
