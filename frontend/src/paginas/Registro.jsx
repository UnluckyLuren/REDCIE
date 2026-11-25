import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { peticion } from '../servicios/apiCliente';

export default function Registro() {
  const [paso, setPaso] = useState(1);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Estados de dominio y sub-roles
  const [tipoDominio, setTipoDominio] = useState('externo');
  const [rolPrincipal, setRolPrincipal] = useState('');
  const [subRol, setSubRol] = useState('');

  // Estados de verificación
  const [codigo, setCodigo] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Detección automática de dominio
  useEffect(() => {
    const dominio = correo.split('@')[1]?.toLowerCase() || '';
    if (dominio.includes('alumnos')) {
      setTipoDominio('alumnos');
      setRolPrincipal('ALUMNO');
    } else if (dominio.includes('academicos') || dominio.includes('cucei')) {
      setTipoDominio('trabajadores');
      if (!['TRABAJADOR_ACADEMICO', 'TRABAJADOR_ADMINISTRATIVO'].includes(rolPrincipal)) {
        setRolPrincipal('TRABAJADOR_ACADEMICO');
      }
    } else {
      setTipoDominio('externo');
      setRolPrincipal('EXTERNO');
      setSubRol('');
    }
  }, [correo]);

  // Contador de 120s para reenvío
  useEffect(() => {
    let intervalo;
    if (tiempoRestante > 0) {
      intervalo = setInterval(() => setTiempoRestante(t => t - 1), 1000);
    }
    return () => clearInterval(intervalo);
  }, [tiempoRestante]);

  const construirJerarquia = () => {
    if (tipoDominio === 'externo') return 'EXTERNO';
    if (tipoDominio === 'alumnos') return `ALUMNO_${subRol}`;
    return `${rolPrincipal}_${subRol}`;
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    if (tipoDominio !== 'externo' && !subRol) {
      setError('Debes seleccionar tu perfil específico.');
      setCargando(false);
      return;
    }

    try {
      await peticion('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ correo, contrasena, jerarquia: construirJerarquia() })
      });
      setPaso(2);
      setTiempoRestante(120); // Iniciar contador de 2 min
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const reenviarCodigo = async () => {
    if (tiempoRestante > 0) return;
    setError(null);
    setCargando(true);
    try {
      await peticion('/auth/reenviar-codigo', {
        method: 'POST',
        body: JSON.stringify({ correo, contrasena, jerarquia: construirJerarquia() })
      });
      setTiempoRestante(120);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await peticion('/auth/verificar-codigo', {
        method: 'POST',
        body: JSON.stringify({ correo, codigo })
      });
      navigate('/login', { state: { mensaje: 'Cuenta verificada. Ya puedes iniciar sesión.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-card shadow-elevated border border-surface-container p-8 relative z-10 animate-fade-in-up">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-primary text-2xl">
              {paso === 1 ? 'person_add' : 'mark_email_unread'}
            </span>
          </div>
          <h1 className="font-outfit text-headline-md text-on-surface mb-1">
            {paso === 1 ? 'Crear Cuenta' : 'Verifica tu Correo'}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {paso === 1 ? 'Únete a la plataforma de innovación' : `Ingresa el código de 6 dígitos enviado a ${correo}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2 animate-fade-in-up">
            <span className="material-symbols-outlined text-error text-[18px]">error</span>
            <p className="text-label-sm text-error">{error}</p>
          </div>
        )}

        {paso === 1 ? (
          <form onSubmit={manejarRegistro} className="space-y-4">
            <div>
              <label className="block text-label-md font-500 text-on-surface mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@alumnos.udeg.mx"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-shadow text-body-sm text-on-surface"
              />
            </div>

            <div>
              <label className="block text-label-md font-500 text-on-surface mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                minLength="8"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none transition-shadow text-body-sm text-on-surface"
              />
            </div>

            {/* SELECCIÓN DINÁMICA DE ROLES INSTITUCIONALES */}
            {tipoDominio === 'alumnos' && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in-up">
                <label className="block text-label-md font-600 text-primary mb-2">Clasificación de Alumno</label>
                <select required value={subRol} onChange={e => setSubRol(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-primary/30 outline-none text-body-sm">
                  <option value="" disabled>Selecciona tu grado...</option>
                  <option value="PREGRADO">Pregrado (Licenciatura/Ingeniería)</option>
                  <option value="POSGRADO">Posgrado (Maestría/Doctorado)</option>
                </select>
              </div>
            )}

            {tipoDominio === 'trabajadores' && (
              <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl animate-fade-in-up space-y-3">
                <div>
                  <label className="block text-label-md font-600 text-secondary mb-2">Tipo de Trabajador</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="rolPrincipal" checked={rolPrincipal === 'TRABAJADOR_ACADEMICO'} onChange={() => { setRolPrincipal('TRABAJADOR_ACADEMICO'); setSubRol(''); }} className="text-secondary focus:ring-secondary" />
                      <span className="text-label-sm text-on-surface">Académico</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="rolPrincipal" checked={rolPrincipal === 'TRABAJADOR_ADMINISTRATIVO'} onChange={() => { setRolPrincipal('TRABAJADOR_ADMINISTRATIVO'); setSubRol(''); }} className="text-secondary focus:ring-secondary" />
                      <span className="text-label-sm text-on-surface">Administrativo</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-label-md font-600 text-secondary mb-2">Perfil Específico</label>
                  <select required value={subRol} onChange={e => setSubRol(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-secondary/30 outline-none text-body-sm">
                    <option value="" disabled>Selecciona un perfil...</option>
                    {rolPrincipal === 'TRABAJADOR_ACADEMICO' ? (
                      <>
                        <option value="PROFESOR">Profesor / Docente</option>
                        <option value="INVESTIGADOR">Investigador</option>
                      </>
                    ) : (
                      <>
                        <option value="GENERAL">Administrativo General</option>
                        <option value="ACADEMICO">Administrativo Académico</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={cargando} className="w-full py-2.5 px-4 bg-primary text-on-primary rounded-lg font-outfit font-500 hover:bg-primary-container transition-colors disabled:opacity-50 mt-4">
              {cargando ? 'Registrando...' : 'Siguiente Paso'}
            </button>

            <p className="text-center text-label-sm text-on-surface-variant mt-4">
              ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-600 hover:underline">Inicia Sesión</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={verificarCodigo} className="space-y-4">
            <div>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 rounded-xl bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary/20 outline-none text-headline-lg text-center tracking-[0.5em] font-mono text-on-surface transition-shadow"
              />
            </div>

            <button type="submit" disabled={cargando || codigo.length < 6} className="w-full py-2.5 px-4 bg-primary text-on-primary rounded-lg font-outfit font-500 hover:bg-primary-container transition-colors disabled:opacity-50">
              {cargando ? 'Verificando...' : 'Verificar y Entrar'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={reenviarCodigo}
                disabled={tiempoRestante > 0 || cargando}
                className="text-label-sm font-600 text-secondary hover:text-primary transition-colors disabled:text-on-surface-variant/50"
              >
                {tiempoRestante > 0 ? `Reenviar código en ${Math.floor(tiempoRestante / 60)}:${(tiempoRestante % 60).toString().padStart(2, '0')}` : 'Reenviar código de verificación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
