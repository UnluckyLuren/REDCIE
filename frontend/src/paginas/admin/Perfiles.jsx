import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { obtenerUsuariosAdmin, guardarUsuarioAdmin, eliminarUsuarioAdmin } from '../../servicios/apiCliente';

const DiccionarioRoles = {
  'ADMIN_UCEI': ['Administración', 'Global'],
  'RESP_SEDE': ['Administración', 'Responsable de Sede'],
  'ALUMNO_PREGRADO': ['Alumno', 'Pregrado'],
  'ALUMNO_POSGRADO': ['Alumno', 'Posgrado'],
  'TRABAJADOR_ACADEMICO_PROFESOR': ['Trabajador', 'Académico', 'Profesor'],
  'TRABAJADOR_ACADEMICO_INVESTIGADOR': ['Trabajador', 'Académico', 'Investigador'],
  'TRABAJADOR_ADMINISTRATIVO_GENERAL': ['Trabajador', 'Administrativo', 'General'],
  'TRABAJADOR_ADMINISTRATIVO_ACADEMICO': ['Trabajador', 'Administrativo', 'Académico']
};

const rolesDisponibles = Object.keys(DiccionarioRoles);

const GrafoJerarquia = ({ roles }) => {
  if (!roles || roles.length === 0) {
    return <p className="text-body-sm text-on-surface-variant italic">No hay roles asignados para trazar.</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 bg-surface-container-low rounded-xl border border-surface-container">
      {roles.map(rol => {
        const nodos = DiccionarioRoles[rol] || [rol];
        return (
          <div key={rol} className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[16px]">account_circle</span>
            </div>

            {nodos.map((nodo, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-4 sm:w-6 border-t-2 border-dashed border-primary/30"></div>
                <div className="px-3 py-1.5 bg-surface-container-lowest rounded-lg border border-primary/20 text-label-sm font-600 text-primary shadow-sm whitespace-nowrap">
                  {nodo}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default function Perfiles() {
  // Inicializamos vacío
  const [perfiles, setPerfiles] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [formNombre, setFormNombre] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formRoles, setFormRoles] = useState([]);
  const [formSede, setFormSede] = useState('');

  const sedesDisponibles = ['CUCEI', 'CUAAD', 'CUCEA', 'PREP-07'];

  // Cargar usuarios desde MySQL al montar el componente
  const cargarPerfiles = async () => {
    setCargando(true);
    try {
      const res = await obtenerUsuariosAdmin();
      setPerfiles(res.datos || []);
    } catch (error) {
      console.error("Error cargando perfiles:", error);
      alert("Error al cargar los perfiles desde la base de datos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfiles();
  }, []);

  const abrirModal = (perfil = null) => {
    if (perfil) {
      setPerfilSeleccionado(perfil.id);
      setFormNombre(perfil.nombre || '');
      setFormCorreo(perfil.correo || '');
      setFormRoles(perfil.roles || []);
      setFormSede(perfil.sedeResponsable || '');
    } else {
      setPerfilSeleccionado(null);
      setFormNombre('');
      setFormCorreo('');
      setFormRoles([]);
      setFormSede('');
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const manejarCambioRol = (rol) => {
    let nuevosRoles = formRoles.includes(rol) ? formRoles.filter(r => r !== rol) : [...formRoles, rol];
    setFormRoles(nuevosRoles);
    if (!nuevosRoles.includes('RESP_SEDE')) setFormSede('');
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    if (formRoles.length === 0) {
      alert("Debes asignar al menos un rol al usuario.");
      return;
    }

    try {
      await guardarUsuarioAdmin({
        id: perfilSeleccionado, // Si es null, el backend crea uno nuevo
        nombre: formNombre,
        correo: formCorreo,
        roles: formRoles,
        sedeResponsable: formRoles.includes('RESP_SEDE') ? formSede : null
      });
      cerrarModal();
      cargarPerfiles(); // Recargar la tabla con los datos frescos
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const eliminarLogico = async (e, id) => {
    e.stopPropagation();
    if(confirm('¿Confirmas la baja lógica de este perfil? Perderá acceso pero sus registros históricos se conservarán.')) {
      try {
        await eliminarUsuarioAdmin(id);
        cargarPerfiles(); // Recargar tras borrar
      } catch (error) {
        alert("Error al inhabilitar: " + error.message);
      }
    }
  };

  return (
    <section className="animate-fade-in-up flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 flex-shrink-0">
        <div>
          <h1 className="font-outfit text-headline-lg text-on-surface">Gestión de Perfiles</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Administración centralizada de trazabilidad y roles</p>
        </div>
        <button onClick={() => abrirModal()} className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-500 hover:bg-primary-container transition-colors flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Crear Perfil
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-container overflow-hidden relative min-h-[200px]">
        {cargando ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm z-10">
             <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-label-md text-on-surface-variant uppercase">
                <th className="p-4 font-600">Usuario</th>
                <th className="p-4 font-600">Trazabilidad Asignada</th>
                <th className="p-4 font-600">Estado</th>
                <th className="p-4 font-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {perfiles.map(perfil => (
                <tr
                  key={perfil.id}
                  onClick={() => abrirModal(perfil)}
                  className={`hover:bg-surface-container-low/50 transition-colors cursor-pointer ${perfil.estado === 'INACTIVO' ? 'opacity-50' : ''}`}
                >
                  <td className="p-4">
                    <p className="text-body-md font-600 text-on-surface">{perfil.nombre || 'Sin nombre'}</p>
                    <p className="text-label-sm text-on-surface-variant">{perfil.correo}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      {perfil.roles.length > 0 ? perfil.roles.map(rol => (
                        <span key={rol} className={`w-fit text-[10px] font-700 uppercase px-2 py-0.5 rounded-pill ${rol === 'ADMIN_UCEI' ? 'bg-error/10 text-error' : rol === 'RESP_SEDE' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                          {DiccionarioRoles[rol]?.join(' • ')} {rol === 'RESP_SEDE' && perfil.sedeResponsable ? `(${perfil.sedeResponsable})` : ''}
                        </span>
                      )) : <span className="text-[10px] font-700 uppercase px-2 py-0.5 rounded-pill bg-surface-container text-on-surface-variant">Sin Roles</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-label-sm font-600 ${perfil.estado === 'ACTIVO' ? 'text-green-600' : 'text-error'}`}>
                      {perfil.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); abrirModal(perfil); }} className="p-2 text-on-surface-variant hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" title="Editar Perfil">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    {perfil.estado === 'ACTIVO' && (
                      <button onClick={(e) => eliminarLogico(e, perfil.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors outline-none focus-visible:ring-2 focus-visible:ring-error rounded" title="Baja Lógica">
                        <span className="material-symbols-outlined text-[20px]">block</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UTILIZANDO REACT PORTAL PARA ESCAPAR DEL STACKING CONTEXT */}
      {modalAbierto && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/50 backdrop-blur-sm p-4 sm:p-6"
          onMouseDown={cerrarModal} // Permite cerrar haciendo clic en el fondo oscuro
        >
          <form
            onSubmit={guardarPerfil}
            onMouseDown={(e) => e.stopPropagation()} // Evita que los clics dentro del modal lo cierren
            className="bg-surface-container-lowest rounded-2xl shadow-elevated w-full max-w-4xl flex flex-col border border-surface-container overflow-hidden animate-fade-in-up"
            style={{ maxHeight: '90vh' }}
          >
            {/* CABECERA (Fija arriba) */}
            <div className="flex-shrink-0 border-b border-surface-container p-5 sm:p-6 flex items-center justify-between z-10 bg-surface-container-lowest">
              <h2 className="font-outfit text-headline-sm text-on-surface">{perfilSeleccionado ? 'Detalle y Edición de Perfil' : 'Nuevo Perfil'}</h2>

              {/* Botón de cerrar explícito */}
              <button
                type="button"
                onClick={cerrarModal}
                className="p-2 -mr-2 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-error rounded-full"
                title="Cerrar modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* CUERPO (Con Scroll Automático) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8">

              {formRoles.length > 0 && (
                <div>
                  <h3 className="text-label-md font-600 text-on-surface mb-3 uppercase tracking-wider">Grafo de Trazabilidad Institucional</h3>
                  <GrafoJerarquia roles={formRoles} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-500 text-on-surface mb-1.5">Nombre Completo</label>
                  <input type="text" required value={formNombre} onChange={e => setFormNombre(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-body-sm transition-shadow" />
                </div>
                <div>
                  <label className="block text-label-md font-500 text-on-surface mb-1.5">Correo Electrónico</label>
                  <input type="email" required value={formCorreo} onChange={e => setFormCorreo(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-body-sm transition-shadow" />
                </div>
              </div>

              <div>
                <h3 className="text-label-md font-600 text-on-surface mb-3 uppercase tracking-wider">Roles y Perfiles del Sistema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rolesDisponibles.map(rol => (
                    <label key={rol} className={`flex items-start gap-3 cursor-pointer px-3 py-2.5 rounded-lg border transition-colors ${formRoles.includes(rol) ? 'bg-surface-container-low border-primary/40 shadow-sm' : 'bg-surface border-surface-container hover:bg-surface-container-low'}`}>
                      <input type="checkbox" checked={formRoles.includes(rol)} onChange={() => manejarCambioRol(rol)} className="mt-0.5 rounded text-primary focus:ring-primary/40 w-4 h-4 flex-shrink-0" />

                      <div className="flex flex-col min-w-0">
                        <span className="text-label-sm font-600 text-on-surface truncate">
                          {DiccionarioRoles[rol].slice(-1)}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-500 uppercase leading-tight mt-0.5">
                          {rol.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formRoles.includes('RESP_SEDE') && (
                <div className="p-5 bg-secondary/5 border border-secondary/20 rounded-xl">
                  <label className="flex items-center gap-2 text-label-md font-600 text-secondary mb-2">
                    <span className="material-symbols-outlined text-[18px]">domain</span>
                    Asignación de Centro Universitario / Sede (Obligatorio)
                  </label>
                  <p className="text-body-sm text-on-surface-variant mb-4">Al otorgar permisos de Responsable de Sede, debes indicar sobre qué centro tendrá jurisdicción.</p>
                  <select required value={formSede} onChange={e => setFormSede(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-surface-container-lowest border border-secondary/30 focus:ring-2 focus:ring-secondary/20 outline-none text-body-sm transition-shadow">
                    <option value="" disabled>Selecciona una sede...</option>
                    {sedesDisponibles.map(sede => (
                      <option key={sede} value={sede}>{sede}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* PIE DE PÁGINA (Fijo abajo) */}
            <div className="flex-shrink-0 flex justify-end gap-3 p-4 sm:px-6 sm:py-4 border-t border-surface-container bg-surface-container-lowest rounded-b-xl z-10">
              <button type="button" onClick={cerrarModal} className="px-5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-label-md font-500 outline-none focus-visible:ring-2 focus-visible:ring-surface-container-high">
                Cancelar
              </button>
              <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-500 hover:bg-primary-container transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-sm">
                Guardar Perfil
              </button>
            </div>

          </form>
        </div>,
        document.body
      )}
    </section>
  );
}
