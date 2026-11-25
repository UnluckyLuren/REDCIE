import { useState, useEffect } from 'react';
import BarraLateral from './BarraLateral';
import BarraSuperior from './BarraSuperior';

/**
 * Shell principal del dashboard — SRS §2.3 y §7.1
 * w-64 sidebar fijo + h-16 header + área principal fluida
 */
export default function DashboardShell({ children, rutaActual }) {
  const [barraLateralAbierta, setBarraLateralAbierta] = useState(false);
  const [esEscritorio, setEsEscritorio] = useState(true);

  useEffect(() => {
    const manejarRedimensionar = () => {
      setEsEscritorio(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) setBarraLateralAbierta(false);
    };

    manejarRedimensionar();
    window.addEventListener('resize', manejarRedimensionar);
    return () => window.removeEventListener('resize', manejarRedimensionar);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">

      {/* ── Overlay móvil ─────────────────────────────────────────── */}
      {!esEscritorio && barraLateralAbierta && (
        <div
          className="fixed inset-0 z-20 bg-primary/40 backdrop-blur-sm lg:hidden"
          onClick={() => setBarraLateralAbierta(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Barra lateral ─────────────────────────────────────────── */}
      <aside
        role="navigation"
        aria-label="Navegación principal"
        className={`
          fixed top-0 left-0 z-30 h-full w-64 
          bg-surface-container-low shadow-sidebar
          flex flex-col transition-transform duration-300
          ${esEscritorio ? 'translate-x-0' : barraLateralAbierta ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <BarraLateral
          rutaActual={rutaActual}
          alCerrar={() => setBarraLateralAbierta(false)}
        />
      </aside>

      {/* ── Contenido principal ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 lg:pl-64">

        {/* ── Header superior ───────────────────────────────────── */}
        <BarraSuperior
          alAbrirSidebar={() => setBarraLateralAbierta(true)}
          esEscritorio={esEscritorio}
          rutaActual={rutaActual}
        />

        {/* ── Área de contenido fluida ──────────────────────────── */}
        <main
          id="contenido-principal"
          className="flex-1 overflow-y-auto pt-16 px-6 pb-12 bg-surface"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
