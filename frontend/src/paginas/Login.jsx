import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContextoAuth } from '../contexto/AuthContexto';
import { iniciarSesion } from '../servicios/apiCliente';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { login } = useContextoAuth();
  const navigate = useNavigate();

  const manejarLoginSSO = () => {
    // Redirigir al endpoint de SSO de la UdeG
    window.location.href = '/api/v1/auth/sso/login';
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const respuesta = await iniciarSesion({ correo, contrasena });
      login(respuesta.usuario, respuesta.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-card shadow-elevated border border-surface-container p-8 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-primary text-2xl" aria-hidden="true">
              account_balance
            </span>
          </div>
          <h1 className="font-outfit text-headline-md text-on-surface mb-1">Red UdeG</h1>
          <p className="text-body-md text-on-surface-variant">
            Plataforma de Innovación e Investigación
          </p>
        </div>

        {/* Acceso Institucional */}
        <button
          onClick={manejarLoginSSO}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-outfit font-500 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary mb-6"
        >
          <span className="material-symbols-outlined text-[20px]">school</span>
          Ingresar con SSO Institucional
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-container-high"></div>
          </div>
          <span className="relative bg-surface-container-lowest px-4 text-label-sm text-on-surface-variant uppercase tracking-wider">
            Actores Externos
          </span>
        </div>

        {/* Acceso Local / Externos */}
        <form onSubmit={manejarSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-label-sm text-error">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="correo" className="block text-label-md font-500 text-on-surface mb-1.5">
              Correo Electrónico
            </label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-sm text-on-surface"
              placeholder="empresa@dominio.com"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-label-md font-500 text-on-surface mb-1.5">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-sm text-on-surface"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary/40 bg-surface-container border-surface-container-high w-4 h-4" />
              <span className="text-label-sm text-on-surface-variant">Recordarme</span>
            </label>
            <a href="#" className="text-label-sm text-secondary hover:text-primary transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-surface-container-high hover:bg-surface-container text-primary rounded-lg font-outfit font-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              'Ingresar como Externo'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
