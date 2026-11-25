import { createContext, useContext, useState, useEffect } from 'react';
import { obtenerCookie, setCookie, borrarCookie, cerrarSesionBackend } from '../servicios/apiCliente';

const AuthContext = createContext();

// Función para decodificar el payload del JWT de forma segura
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    const inicializarAuth = () => {
      const token = obtenerCookie('accessToken');
      if (token) {
        const payload = parseJwt(token);
        if (payload) {
          // Extraemos los datos reales del token decodificado
          setUsuario({
            id: payload.idUsuario,
            correo: payload.correo,
            nombreCompleto: payload.nombreCompleto || payload.correo,
            jerarquia: payload.jerarquia,
            roles: payload.roles,
            sedes: payload.sedes
          });
        } else {
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
      setCargandoAuth(false);
    };

    inicializarAuth();
  }, []);

  const login = (datosUsuario, token) => {
    setCookie('accessToken', token, 15);
    setUsuario(datosUsuario);
  };

  const cerrarSesion = async () => {
    try {
      await cerrarSesionBackend();
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor', error);
    } finally {
      borrarCookie('accessToken');
      setUsuario(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, cerrarSesion, cargandoAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useContextoAuth = () => useContext(AuthContext);
