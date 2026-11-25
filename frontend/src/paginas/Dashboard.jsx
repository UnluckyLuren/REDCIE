import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useContextoAuth } from '../contexto/AuthContexto';

// ==========================================
// COMPONENTES DE UI Y GRÁFICAS SVG NATIVAS
// ==========================================

const ModalInfo = ({ titulo, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in-up" onMouseDown={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-elevated w-full max-w-lg border border-surface-container overflow-hidden" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">info</span>
            <h3 className="font-outfit text-headline-sm text-on-surface">{titulo}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-error">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 text-body-md text-on-surface-variant space-y-4">
          {children}
        </div>
        <div className="p-4 bg-surface-container-low border-t border-surface-container text-right">
          <button onClick={onClose} className="px-5 py-2 bg-primary text-on-primary rounded-lg font-600 hover:bg-primary-container transition-colors">Entendido</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TarjetaKpi = ({ titulo, valor, subtitulo, icono, color = 'primary', onClickInfo }) => (
  <article className="bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-5 hover:shadow-elevated transition-shadow group relative">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} transition-colors group-hover:bg-${color} group-hover:text-on-primary`}>
        <span className="material-symbols-outlined text-[24px]">{icono}</span>
      </div>
      {onClickInfo && (
        <button onClick={onClickInfo} className="text-on-surface-variant hover:text-primary transition-colors outline-none" title="Más información">
          <span className="material-symbols-outlined text-[18px]">help</span>
        </button>
      )}
    </div>
    <h3 className="font-outfit text-display-lg text-on-surface leading-none mb-1">{valor}</h3>
    <p className="text-label-lg font-600 text-on-surface">{titulo}</p>
    <p className="text-body-sm text-on-surface-variant mt-0.5">{subtitulo}</p>
  </article>
);

const GraficaBarrasSvg = ({ datos, color = 'primary', maximoOpcional }) => {
  const max = maximoOpcional || Math.max(...datos.map(d => d.valor), 1);
  return (
    <div className="flex items-end gap-3 h-48 mt-4 pt-6">
      {datos.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 h-full group relative">
          <div className="w-full h-full flex items-end justify-center rounded-t-md relative">
            <div
              style={{ height: `${(d.valor / max) * 100}%` }}
              className={`w-full max-w-[40px] bg-${color} rounded-t-md transition-all duration-1000 ease-out hover:opacity-80 cursor-pointer`}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-label-sm px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-elevated">
                {d.valor} {d.tooltipLeyenda || 'registros'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-600 text-on-surface-variant mt-2 text-center leading-tight truncate w-full">{d.etiqueta}</span>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// VISTAS DE DASHBOARD POR ROL
// ==========================================

const VistaAdministrador = () => {
  const [modalTrl, setModalTrl] = useState(false);
  const datosDistribucionTrl = [
    { etiqueta: 'TRL 1-3', valor: 45, tooltipLeyenda: 'Proyectos tempranos' },
    { etiqueta: 'TRL 4-5', valor: 82, tooltipLeyenda: 'En validación' },
    { etiqueta: 'TRL 6-7', valor: 34, tooltipLeyenda: 'Prototipos validados' },
    { etiqueta: 'TRL 8-9', valor: 12, tooltipLeyenda: 'Escalamiento' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <TarjetaKpi titulo="Sedes Activas" valor="14" subtitulo="Planteles conectados" icono="domain" />
        <TarjetaKpi titulo="Fondos Desplegados" valor="$4.2M" subtitulo="Presupuesto semilla 2026" icono="payments" color="secondary" />
        <TarjetaKpi titulo="Cuellos de Botella" valor="18" subtitulo="Proyectos estancados >30 días" icono="warning" color="error" />
        <TarjetaKpi
          titulo="Data Room"
          valor="342"
          subtitulo="NDAs firmados e inmutables"
          icono="shield_lock"
          onClickInfo={() => setModalTrl(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-outfit text-headline-sm text-on-surface">Distribución de Proyectos por TRL</h3>
            <button onClick={() => setModalTrl(true)} className="text-secondary hover:text-primary text-label-sm font-600 flex items-center gap-1 transition-colors">
              ¿Qué es el TRL? <span className="material-symbols-outlined text-[16px]">info</span>
            </button>
          </div>
          <p className="text-body-sm text-on-surface-variant">Análisis del portafolio I+D+i de la Red Universitaria agrupado por Madurez Tecnológica.</p>
          <GraficaBarrasSvg datos={datosDistribucionTrl} color="primary" />
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-6 flex flex-col">
          <h3 className="font-outfit text-headline-sm text-on-surface mb-4">Acciones Críticas</h3>
          <div className="space-y-3 flex-1">
            <Link to="/analitica" className="flex items-center justify-between p-4 rounded-xl border border-error/20 bg-error/5 hover:bg-error/10 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error">troubleshoot</span>
                <div>
                  <p className="text-label-md font-600 text-on-surface">Auditar Estancamientos</p>
                  <p className="text-[11px] text-error font-500">18 expedientes requieren atención</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-error opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">chevron_right</span>
            </Link>
            <Link to="/documentos" className="flex items-center justify-between p-4 rounded-xl border border-surface-container bg-surface-container-low hover:bg-surface-container transition-colors group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">gavel</span>
                <div>
                  <p className="text-label-md font-600 text-on-surface">Revisión Jurídica</p>
                  <p className="text-[11px] text-on-surface-variant font-500">5 borradores pendientes de Vobo</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>

      <ModalInfo titulo="Technology Readiness Level (TRL)" isOpen={modalTrl} onClose={() => setModalTrl(false)}>
        <p>El <strong>Nivel de Madurez Tecnológica (TRL)</strong> es una métrica estándar internacional (1 al 9) utilizada para evaluar el grado de madurez de una tecnología.</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>TRL 1-3:</strong> Investigación básica y pruebas de concepto (Preincubación).</li>
          <li><strong>TRL 4-5:</strong> Validación de componentes en entorno de laboratorio (Validación).</li>
          <li><strong>TRL 6-7:</strong> Demostración de prototipos en entornos operativos reales.</li>
          <li><strong>TRL 8-9:</strong> Sistema completo, certificado y listo para despliegue comercial o transferencia (Escalamiento).</li>
        </ul>
      </ModalInfo>
    </div>
  );
};

const VistaAcademico = () => {
  const datosProduccion = [
    { etiqueta: '2022', valor: 3 },
    { etiqueta: '2023', valor: 5 },
    { etiqueta: '2024', valor: 4 },
    { etiqueta: '2025', valor: 8 },
    { etiqueta: '2026', valor: 6, tooltipLeyenda: 'Artículos en curso' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TarjetaKpi titulo="Índice H" valor="14" subtitulo="Según Scopus / Web of Science" icono="trending_up" />
        <TarjetaKpi titulo="Dirección de Tesis" valor="5" subtitulo="Alumnos de posgrado asesorados" icono="school" color="secondary" />

        <article className="bg-primary text-on-primary rounded-2xl shadow-elevated p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-[32px]">stars</span>
              <span className="bg-white/20 text-white text-[10px] font-700 uppercase px-2 py-1 rounded-md tracking-wider">Verificado</span>
            </div>
            <h3 className="font-outfit text-headline-md mb-0.5">Investigador SNII Nivel I</h3>
            <p className="text-body-sm opacity-80">Próxima evaluación CONAHCYT en 2027</p>
          </div>
          <Link to="/investigadores" className="mt-6 bg-white/20 hover:bg-white/30 text-white w-full py-2.5 rounded-lg text-label-md font-600 transition-colors backdrop-blur-sm flex items-center justify-center gap-2 relative z-10">
            Ver mi ficha pública <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </Link>
        </article>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-6">
        <h3 className="font-outfit text-headline-sm text-on-surface">Evolución de Producción Académica</h3>
        <p className="text-body-sm text-on-surface-variant">Artículos indexados (Q1-Q4) y capítulos de libro registrados en los últimos 5 años.</p>
        <GraficaBarrasSvg datos={datosProduccion} color="secondary" />
      </div>
    </div>
  );
};

const VistaEstudiante = () => {
  const [modalMentor, setModalMentor] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-container-low border border-surface-container text-label-sm font-600 text-secondary mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Proyecto Activo • UDG-INN-2026-0042
              </span>
              <h3 className="font-outfit text-headline-md text-on-surface leading-tight">Biosensor de Glucosa No Invasivo</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">science</span>
            </div>
          </div>

          {/* Timeline Interactivo */}
          <div className="relative pt-4 pb-8 px-2">
            <div className="absolute left-4 top-8 w-[calc(100%-2rem)] h-1.5 bg-surface-container rounded-pill">
              <div className="h-full bg-primary rounded-pill w-[50%] relative shadow-[0_0_10px_rgba(0,22,45,0.4)]">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-4 border-surface-container-lowest shadow-sm"></div>
              </div>
            </div>
            <div className="relative flex justify-between">
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary z-10 shadow-sm border-2 border-surface-container-lowest group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <span className="text-[11px] font-700 uppercase text-primary">Preincubación</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary z-10 shadow-sm border-2 border-surface-container-lowest animate-pulse">
                  <span className="material-symbols-outlined text-[16px]">biotech</span>
                </div>
                <span className="text-[11px] font-700 uppercase text-primary">Validación (TRL 4-5)</span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-40 grayscale">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant z-10 border-2 border-surface-container-lowest">
                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                </div>
                <span className="text-[11px] font-700 uppercase text-on-surface-variant">Escalamiento</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link to="/portafolio" className="flex-1 py-3 bg-primary text-on-primary text-center rounded-xl text-label-md font-600 hover:bg-primary-container transition-colors shadow-sm">
              Abrir Expediente Completo
            </Link>
            <button onClick={() => setModalMentor(true)} className="flex-1 py-3 bg-surface-container-lowest text-primary text-center rounded-xl text-label-md font-600 hover:bg-surface-container transition-colors border-2 border-surface-container">
              Solicitar Banco de Capacidades
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <TarjetaKpi titulo="Retos Postulados" valor="2" subtitulo="1 en revisión de comité" icono="handshake" color="secondary" />
          <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-5">
            <h4 className="text-label-md font-600 text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">calendar_clock</span>
              Próximos Hitos
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container border-l-4 border-l-error flex gap-3 items-center">
                <div className="flex-1">
                  <p className="text-label-sm font-600 text-on-surface">Cierre Fondo Semilla</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Vence en 3 días</p>
                </div>
                <span className="material-symbols-outlined text-error text-[18px]">warning</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container border-l-4 border-l-primary flex gap-3 items-center">
                <div className="flex-1">
                  <p className="text-label-sm font-600 text-on-surface">Mentoría Asignada</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Dra. María Fernández</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalInfo titulo="Banco de Capacidades" isOpen={modalMentor} onClose={() => setModalMentor(false)}>
        <p>El <strong>Banco de Capacidades</strong> de la Red UdeG te permite reservar infraestructura de otros Centros Universitarios de forma gratuita para tu proyecto validado.</p>
        <p className="mt-2">Puedes solicitar:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Horas de impresión 3D y mecanizado CNC.</li>
          <li>Acceso a laboratorios certificados de biología y química.</li>
          <li>Clínicas jurídicas para registro de Propiedad Intelectual (IMPI).</li>
          <li>Asesoría financiera y de escalamiento de negocios.</li>
        </ul>
      </ModalInfo>
    </div>
  );
};

const VistaExterno = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TarjetaKpi titulo="NDAs Aprobados" valor="4" subtitulo="Acuerdos de confidencialidad vigentes" icono="verified_user" />
        <TarjetaKpi titulo="Proyectos Seguidos" valor="7" subtitulo="Tecnologías en tu radar personal" icono="bookmark" color="secondary" />

        <article className="bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-6 flex flex-col justify-center items-center text-center hover:shadow-elevated transition-shadow group">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[28px]">search</span>
          </div>
          <h3 className="font-outfit text-headline-sm text-on-surface mb-2">Escaparate de Inversión</h3>
          <p className="text-body-sm text-on-surface-variant mb-5 px-2">Descubre nuevas tecnologías universitarias validadas (TRL 5+) listas para transferencia tecnológica o licenciamiento.</p>
          <Link to="/portafolio" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-600 hover:bg-primary-container transition-colors shadow-sm w-full">
            Explorar Portafolio Público
          </Link>
        </article>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE CONTENEDOR PRINCIPAL
// ==========================================

export default function Dashboard() {
  const { usuario } = useContextoAuth();
  const [saludo, setSaludo] = useState('');

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora < 12) setSaludo('Buenos días');
    else if (hora < 19) setSaludo('Buenas tardes');
    else setSaludo('Buenas noches');
  }, []);

  if (!usuario) return null;

  // Lógica estricta de Roles basada en el SRS
  const roles = usuario.roles || [];
  const j = usuario.jerarquia || '';

  const esAdmin = roles.includes('ADMIN_UCEI') || roles.includes('RESP_SEDE');
  const esAcademico = j.includes('ACADEMICO') || roles.includes('INVESTIGADOR');
  const esEstudiante = j.includes('ALUMNO') || roles.includes('ESTUDIANTE');
  const esExterno = j.includes('EXTERNO') || roles.includes('EXTERNO');
  const esAdministrativo = j.includes('ADMINISTRATIVO_GENERAL') || j.includes('ADMINISTRATIVO_ACADEMICO');

  let VistaPrincipal = null;
  if (esAdmin) VistaPrincipal = <VistaAdministrador />;
  else if (esAcademico) VistaPrincipal = <VistaAcademico />;
  else if (esEstudiante) VistaPrincipal = <VistaEstudiante />;
  else if (esExterno) VistaPrincipal = <VistaExterno />;
  else if (esAdministrativo) VistaPrincipal = <VistaAdministrador />;

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      {/* Encabezado Ejecutivo */}
      <header className="mb-10 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-container pb-6">
          <div>
            <h1 className="font-outfit text-display-lg text-on-surface leading-tight">
              {saludo}, <span className="text-primary">{usuario.nombreCompleto?.split(' ')[0] || 'Usuario'}</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">insights</span>
              Este es tu centro de mando personalizado en la Red UdeG.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-3 rounded-xl border border-surface-container shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-700 text-on-surface-variant uppercase tracking-wider leading-none">Sesión Verificada</span>
              <span className="text-label-md font-600 text-on-surface mt-0.5">{j.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Renderizado de Módulos (Separación Limpia) */}
      <div className="min-h-[40vh]">
        {VistaPrincipal}
      </div>

      {/* Bitácora de Actividad Reciente (Transversal) */}
      <section className="mt-12 pt-10 border-t border-surface-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-label-md font-700 uppercase tracking-widest text-on-surface-variant mb-6">Bitácora de Eventos Recientes</h2>
        <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container p-2">
          {[
            { icono: 'shield_lock', color: 'text-green-600', bg: 'bg-green-100', titulo: 'Inicio de sesión seguro', desc: 'Validación biométrica o token exitosa desde tu ubicación habitual.', tiempo: 'Hace unos instantes' },
            { icono: 'rocket_launch', color: 'text-primary', bg: 'bg-primary/10', titulo: 'Actualización del Observatorio', desc: 'Nuevos datos bibliométricos sincronizados correctamente desde Scopus.', tiempo: 'Hace 4 horas' },
            { icono: 'campaign', color: 'text-secondary', bg: 'bg-secondary/10', titulo: 'Nueva Convocatoria Abierta', desc: 'El Fondo Semilla UdeG Innova ha publicado las bases para proyectos TRL 4+.', tiempo: 'Ayer' },
          ].map((act, i) => (
            <div key={i} className="flex items-start gap-4 p-4 hover:bg-surface-container-low transition-colors rounded-xl cursor-default group">
              <div className={`w-12 h-12 rounded-full ${act.bg} ${act.color} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[22px]">{act.icono}</span>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-label-lg font-600 text-on-surface">{act.titulo}</p>
                <p className="text-body-sm text-on-surface-variant truncate mt-0.5">{act.desc}</p>
              </div>
              <span className="text-label-sm font-500 text-on-surface-variant/70 whitespace-nowrap pt-1.5">{act.tiempo}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
