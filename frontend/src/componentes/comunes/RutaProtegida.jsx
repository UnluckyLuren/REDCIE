import { Navigate, useLocation } from 'react-router-dom';
import { useContextoAuth } from '../../contexto/AuthContexto';

export default function RutaProtegida({ children }) {
  const { usuario, cargandoAuth } = useContextoAuth();
  const location = useLocation();

  if (cargandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
          <p className="text-label-md text-on-surface-variant font-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    // Redirige a la Landing Page ("/") en lugar del login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
