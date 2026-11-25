import { Link, useLocation } from 'react-router-dom';
import { useContextoSede } from '../../contexto/SedeContexto';
import { useContextoAuth } from '../../contexto/AuthContexto';

// Menú categorizado y alineado al SRS (incluyendo módulos y control RBAC)
const menuCategorias = [
  {
    grupo: 'Mi Espacio',
    items: [
      { ruta: '/dashboard', etiqueta: 'Mi Panel', icono: 'dashboard' },
    ]
  },
  {
    grupo: 'Inteligencia de Red',
    items: [
      { ruta: '/observatorio',   etiqueta: 'Observatorio Abierto', icono: 'insights' },
      { ruta: '/investigadores', etiqueta: 'Investigadores',       icono: 'badge' },
      { ruta: '/red',            etiqueta: 'Mapa de la Red',       icono: 'hub' },
    ]
  },
  {
    grupo: 'Operación I+D+i',
    items: [
      { ruta: '/portafolio',  etiqueta: 'Portafolio I+D+i',        icono: 'science' },
      { ruta: '/retos',       etiqueta: 'Retos y Fondos',          icono: 'handshake' },
      { ruta: '/incubadora',  etiqueta: 'Ruta de Incubación',      icono: 'rocket_launch' },
      { ruta: '/capacidades', etiqueta: 'Banco de Capacidades',    icono: 'precision_manufacturing' },
    ]
  },
  {
    grupo: 'Gestión Interna',
    items: [
      { ruta: '/documentos',  etiqueta: 'Control Jurídico',        icono: 'gavel',        rolesPermitidos: ['RESP_SEDE', 'ADMIN_UCEI'] },
      { ruta: '/analitica',   etiqueta: 'Cuellos de Botella',      icono: 'troubleshoot', rolesPermitidos: ['RESP_SEDE', 'ADMIN_UCEI'] },
    ]
  },
  {
    grupo: 'Administración Global',
    soloAdmin: true,
    items: [
      { ruta: '/admin/perfiles',  etiqueta: 'Gestión de Perfiles', icono: 'manage_accounts' },
      { ruta: '/admin/sedes',     etiqueta: 'Gestión de Sedes',    icono: 'domain' },
      { ruta: '/admin/catalogos', etiqueta: 'Catálogos Maestros',  icono: 'list_alt' },
      { ruta: '/admin/auditoria', etiqueta: 'Bitácora Auditoría',  icono: 'history' },
    ]
  }
];

export default function BarraLateral({ rutaActual, alCerrar }) {
  const location = useLocation();
  const { sedActual } = useContextoSede();
  const { usuario } = useContextoAuth();

  // Función para verificar si el usuario tiene permisos para ver un ítem o grupo
  const tienePermiso = (elemento) => {
    if (!usuario || !usuario.roles) return false;

    // Requiere Administrador Global explícitamente
    if (elemento.soloAdmin) {
      return usuario.roles.includes('ADMIN_UCEI');
    }
    // Requiere uno de los roles específicos
    if (elemento.rolesPermitidos) {
      return elemento.rolesPermitidos.some(rol => usuario.roles.includes(rol));
    }
    // Si no tiene restricciones explícitas, es público/general para usuarios logueados
    return true;
  };

  return (
    <nav className="flex flex-col h-full" aria-label="Menú principal">
      {/* Cabecera del menú */}
      <div className="p-4 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary text-xl" aria-hidden="true">
              account_balance
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-outfit font-700 text-headline-sm text-on-surface truncate leading-tight">
              Red UdeG
            </p>
            <p className="text-label-md text-on-surface-variant truncate">
              {sedActual?.nombreOficial ?? 'Innovación'}
            </p>
          </div>
        </div>
        {/* Buscador rápido */}
        <div className="mt-3 relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="search"
            placeholder="Buscar..."
            aria-label="Búsqueda rápida"
            className="
              w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container
              text-body-sm text-on-surface placeholder-on-surface-variant/60
              border-0 focus:ring-2 focus:ring-primary/30 outline-none
              transition-shadow
            "
          />
        </div>
      </div>

      {/* Área de navegación principal por grupos */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4" role="list">
        {menuCategorias.map((categoria) => {
          // Si la categoría entera está restringida, no se procesa
          if (!tienePermiso(categoria)) return null;

          // Filtramos los ítems a los que el usuario sí tiene acceso dentro de este grupo
          const itemsPermitidos = categoria.items.filter(tienePermiso);

          // Si el grupo se queda sin ítems por los permisos, no se renderiza la cabecera
          if (itemsPermitidos.length === 0) return null;

          return (
            <div key={categoria.grupo} className="flex flex-col gap-1">
              <h3 className="px-3 mb-1 text-[11px] font-700 uppercase tracking-wider text-on-surface-variant/70">
                {categoria.grupo}
              </h3>
              <ul className="space-y-1">
                {itemsPermitidos.map((elemento) => {
                  const estaActivo = location.pathname.startsWith(elemento.ruta);
                  return (
                    <li key={elemento.ruta} role="listitem">
                      <Link
                        to={elemento.ruta}
                        onClick={alCerrar}
                        aria-current={estaActivo ? 'page' : undefined}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg
                          text-label-lg font-inter font-500 transition-all duration-150
                          focus-visible:ring-2 focus-visible:ring-primary/40
                          ${estaActivo
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-on-surface hover:bg-surface-container hover:text-on-surface'
                          }
                        `}
                      >
                        <span
                          className="material-symbols-outlined text-[20px]"
                          aria-hidden="true"
                          style={{ fontVariationSettings: estaActivo ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {elemento.icono}
                        </span>
                        <span>{elemento.etiqueta}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Pie del menú */}
      <div className="p-4 border-t border-surface-container">
        <div className="rounded-xl bg-surface-container p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" aria-hidden="true" />
            <span className="text-label-md font-500 text-on-surface">Red Universitaria</span>
          </div>
          <p className="text-label-sm text-on-surface-variant">Sistemas operativos</p>
          <a
            href="#lineamientos"
            className="mt-2 flex items-center gap-1 text-label-sm text-secondary hover:text-primary transition-colors"
          >
            <span>Lineamientos Institucionales</span>
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">north_east</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
