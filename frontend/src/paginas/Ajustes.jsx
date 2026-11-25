import { useState, useEffect } from 'react';
import { useContextoAuth } from '../contexto/AuthContexto';

export default function Ajustes() {
  const { usuario } = useContextoAuth();

  // Determinamos los permisos específicos según el rol para renderizar campos
  const esAcademico = usuario?.roles?.some(r => r.includes('ACADEMICO'));
  const esAlumno = usuario?.roles?.some(r => r.includes('ALUMNO'));

  // Estados de los formularios
  const [tema, setTema] = useState(localStorage.getItem('tema-red-udeg') || 'tema-claro');
  const [nombre, setNombre] = useState(usuario?.nombreCompleto || '');
  const [telefono, setTelefono] = useState('');
  const [mfaActivo, setMfaActivo] = useState(true);

  // Estados exclusivos académicos
  const [orcid, setOrcid] = useState('');
  const [resumen, setResumen] = useState('');
  const [aceptaTesis, setAceptaTesis] = useState(true);

  // Estados exclusivos alumnos
  const [codigoUdeg, setCodigoUdeg] = useState('');

  // Cambia el tema inyectando la clase en el HTML
  useEffect(() => {
    document.documentElement.className = tema;
    localStorage.setItem('tema-red-udeg', tema);
  }, [tema]);

  const guardarCambios = (e) => {
    e.preventDefault();
    alert('Configuración guardada exitosamente en el dispositivo y servidor.');
  };

  const temasDisponibles = [
    { id: 'tema-claro', nombre: 'Institucional (Claro)', bg: 'bg-[#f8f9ff]', primary: 'bg-[#00162d]' },
    { id: 'tema-oscuro', nombre: 'Contraste (Oscuro)', bg: 'bg-[#0b1c30]', primary: 'bg-[#a9c7ff]' },
    { id: 'tema-azul', nombre: 'Océano (Azul)', bg: 'bg-[#f0f8ff]', primary: 'bg-[#004d80]' },
    { id: 'tema-rosa', nombre: 'Cálido (Rosa)', bg: 'bg-[#fff0f5]', primary: 'bg-[#800040]' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-8">
      <div className="mb-8">
        <h1 className="font-outfit text-headline-lg text-on-surface">Ajustes de Cuenta</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Personaliza tu experiencia y actualiza tu información</p>
      </div>

      <form onSubmit={guardarCambios} className="space-y-6">

        {/* SECCIÓN 1: APARIENCIA (Universal) */}
        <section className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-container overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">palette</span>
            <h2 className="font-outfit text-headline-sm text-on-surface">Apariencia del Sistema</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {temasDisponibles.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTema(t.id)}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${tema === t.id ? 'border-primary bg-surface-container-low shadow-sm' : 'border-surface-container hover:border-primary/40'}`}
                >
                  <div className={`w-16 h-16 rounded-full shadow-sm flex overflow-hidden border border-surface-container-high`}>
                    <div className={`w-1/2 h-full ${t.bg}`}></div>
                    <div className={`w-1/2 h-full ${t.primary}`}></div>
                  </div>
                  <span className={`text-label-md font-600 ${tema === t.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {t.nombre}
                  </span>
                  {tema === t.id && (
                    <div className="absolute top-2 right-2 text-primary">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: DATOS PERSONALES BASE (Universal) */}
        <section className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-container overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">person</span>
            <h2 className="font-outfit text-headline-sm text-on-surface">Información General</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto de perfil visual (Gráfica) */}
            <div className="md:col-span-2 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 text-on-primary-container text-display-lg shadow-sm border-2 border-surface-container">
                  {usuario?.nombreCompleto?.charAt(0) || 'U'}
              </div>
              <div>
                <button type="button" className="px-4 py-2 bg-surface-container text-on-surface rounded-lg text-label-md font-600 hover:bg-surface-container-high transition-colors mb-2 border border-surface-container-high">
                  Cambiar Fotografía
                </button>
                <p className="text-label-sm text-on-surface-variant">JPG o PNG, máximo 2MB.</p>
              </div>
            </div>

            <div>
              <label className="block text-label-md font-500 text-on-surface mb-1.5">Nombre Completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-body-sm transition-shadow" />
            </div>

            <div>
              <label className="block text-label-md font-500 text-on-surface mb-1.5 flex items-center justify-between">
                Correo Electrónico Institucional
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50" title="Asignado por el sistema">lock</span>
              </label>
              <input type="email" disabled value={usuario?.correo || ''} className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface-variant text-body-sm cursor-not-allowed opacity-70" />
            </div>

            <div>
              <label className="block text-label-md font-500 text-on-surface mb-1.5">Teléfono de Contacto (Opcional)</label>
              <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="10 dígitos" className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-body-sm transition-shadow" />
            </div>

            {/* Campo Exclusivo: Alumnos */}
            {esAlumno && (
              <div>
                <label className="block text-label-md font-500 text-on-surface mb-1.5">Código de Estudiante (SIIAU)</label>
                <input type="text" value={codigoUdeg} onChange={(e) => setCodigoUdeg(e.target.value)} placeholder="Ej. 215436789" className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-body-sm transition-shadow" />
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN 3: PERFIL ACADÉMICO (Exclusivo para Profesores/Investigadores) */}
        {esAcademico && (
          <section className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-container overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">school</span>
              <h2 className="font-outfit text-headline-sm text-on-surface">Perfil Académico</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-md font-500 text-on-surface mb-1.5">Identificador ORCID</label>
                  <input type="text" value={orcid} onChange={(e) => setOrcid(e.target.value)} placeholder="0000-0000-0000-0000" className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-body-sm transition-shadow font-mono" />
                </div>
                <div>
                  <label className="block text-label-md font-500 text-on-surface mb-1.5 flex items-center justify-between">
                    Nivel SNII Actual
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50" title="Solo auditable desde CONAHCYT">lock</span>
                  </label>
                  <input type="text" disabled value="SIN SNII (Pendiente Sincronización)" className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface-variant text-body-sm cursor-not-allowed opacity-70" />
                </div>
              </div>

              <div>
                <label className="block text-label-md font-500 text-on-surface mb-1.5">Resumen Público de Trayectoria (Bio)</label>
                <textarea rows="4" value={resumen} onChange={(e) => setResumen(e.target.value)} placeholder="Describe tus líneas de investigación principales..." className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-body-sm transition-shadow resize-none"></textarea>
              </div>

              {/* Toggle switch visual */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-surface-container">
                <div>
                  <p className="text-label-md font-600 text-on-surface">Disponibilidad para Dirección de Tesis</p>
                  <p className="text-body-sm text-on-surface-variant">Tu perfil aparecerá en los filtros de los alumnos buscando tutor.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAceptaTesis(!aceptaTesis)}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${aceptaTesis ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-surface-container-lowest shadow-sm transition-transform ${aceptaTesis ? 'transform translate-x-6' : ''}`}></div>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 4: SEGURIDAD (Universal) */}
        <section className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-container overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">security</span>
            <h2 className="font-outfit text-headline-sm text-on-surface">Seguridad de la Cuenta</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-surface-container">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-on-surface-variant pt-1">verified_user</span>
                <div>
                  <p className="text-label-md font-600 text-on-surface">Autenticación Multifactor (MFA)</p>
                  <p className="text-body-sm text-on-surface-variant">Protege tu cuenta solicitando un código de la app autenticadora.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMfaActivo(!mfaActivo)}
                className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${mfaActivo ? 'bg-primary' : 'bg-surface-container-high'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-surface-container-lowest shadow-sm transition-transform ${mfaActivo ? 'transform translate-x-6' : ''}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* CONTROLES GLOBALES DE GUARDADO */}
        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" className="px-8 py-3 bg-primary text-on-primary rounded-lg font-600 hover:bg-primary-container transition-colors shadow-elevated outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">save</span>
            Guardar Todos los Ajustes
          </button>
        </div>
      </form>
    </div>
  );
}
