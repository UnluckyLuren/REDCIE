import { useState } from 'react';
import { useContextoAuth } from '../../contexto/AuthContexto';

export default function BarraSuperior({ alAbrirSidebar, esEscritorio, rutaActual }) {
  const { usuario, cerrarSesion } = useContextoAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const segmentosMigas = rutaActual
    ? rutaActual.split('/').filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    : [];

  return (
    <header
      className="
        fixed top-0 right-0 z-20 h-16
        bg-surface/85 backdrop-blur-xl
        border-b border-surface-container
        flex items-center justify-between
        px-4 gap-4
        lg:left-64 left-0
        transition-all duration-300
      "
      role="banner"
    >
      {/* Botón menú móvil */}
      {!esEscritorio && (
        <button
          onClick={alAbrirSidebar}
          aria-label="Abrir menú de navegación"
          className="p-2 rounded-lg hover:bg-surface-container transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none"
        >
          <span className="material-symbols-outlined text-on-surface" aria-hidden="true">menu</span>
        </button>
      )}

      {/* Migas de pan */}
      <nav aria-label="Ruta de navegación" className="flex-1">
        <ol className="flex items-center gap-1 text-label-md">
          <li>
            <a href="/" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Red UdeG
            </a>
          </li>
          {segmentosMigas.map((segmento, indice) => (
            <li key={indice} className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant" aria-hidden="true">
                chevron_right
              </span>
              <span
                className={
                  indice === segmentosMigas.length - 1
                    ? 'text-on-surface font-500'
                    : 'text-on-surface-variant'
                }
              >
                {segmento}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Acciones de usuario */}
      <div className="flex items-center gap-2">
        <button
          aria-label="Portal de estudiantes"
          className="
            hidden sm:flex items-center gap-1.5 px-3 py-1.5
            rounded-lg text-label-md font-500 text-secondary
            hover:bg-surface-container transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary
          "
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">school</span>
          <span>Portal Alumnos</span>
        </button>

        <button
          aria-label="Notificaciones"
          className="p-2 rounded-lg hover:bg-surface-container transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">
            notifications
          </span>
        </button>

        {/* Menú de Perfil */}
        {usuario && (
          <div className="relative">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menú de cuenta"
              aria-expanded={menuAbierto}
              className="
                flex items-center gap-2 px-2 py-1.5 rounded-lg
                hover:bg-surface-container transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary
              "
            >
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                <span className="text-label-md font-600 text-on-primary-container">
                   {usuario.nombreCompleto?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              </div>
              <span className="hidden md:block text-label-md font-500 text-on-surface max-w-32 truncate">
                {usuario.nombreCompleto}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]" aria-hidden="true">
                arrow_drop_down
              </span>
            </button>

            {/* Dropdown flotante */}
              {menuAbierto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} aria-hidden="true"></div>
                  <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-elevated border border-surface-container py-2 z-20 animate-fade-in-up">



                                      <div className="px-4 py-3 border-b border-surface-container mb-2">
                                        <p className="text-label-sm text-on-surface-variant mb-0.5">Conectado como</p>
                                        <p className="text-label-md font-600 text-on-surface truncate mb-3" title={usuario.correo}>
                                          {usuario.correo}
                                        </p>
                                        <div className="bg-surface-container-low p-2 rounded-lg border border-surface-container">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                             <span className="material-symbols-outlined text-[14px] text-primary">account_tree</span>
                                             <span className="text-[10px] font-700 uppercase tracking-wider text-primary">Clasificación</span>
                                          </div>
                                          <div className="flex flex-wrap gap-1 text-label-sm font-500 text-on-surface-variant">
                                             {usuario.roles?.map((nodo, i) => (
                                               <span key={i} className="flex items-center gap-1">
                                                 {nodo.replace(/_/g, ' ')}
                                               </span>
                                             )) || 'EXTERNO'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* NUEVO: Botón de Ajustes */}
                                      <a
                                        href="/ajustes"
                                        onClick={() => setMenuAbierto(false)}
                                        className="w-full text-left px-4 py-2.5 text-label-md font-500 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3 outline-none focus-visible:bg-surface-container"
                                      >
                                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden="true">settings</span>
                                        Ajustes de Cuenta
                                      </a>

                    <button
                      onClick={() => { setMenuAbierto(false); cerrarSesion(); }}
                      className="w-full text-left px-4 py-2.5 text-label-md font-500 text-error hover:bg-error/10 transition-colors flex items-center gap-3 outline-none focus-visible:bg-error/10"
                  >
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
          </div>
        )}
      </div>
    </header>
  );
}
