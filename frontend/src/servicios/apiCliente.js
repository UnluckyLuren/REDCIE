const URL_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

// --------------------------------------------------------
// Utilidades de Cookies
// --------------------------------------------------------
export const obtenerCookie = (nombre) => {
  const match = document.cookie.match(new RegExp('(^| )' + nombre + '=([^;]+)'));
  return match ? match[2] : null;
};

export const setCookie = (nombre, valor, minutos) => {
  const d = new Date();
  d.setTime(d.getTime() + (minutos * 60 * 1000));
  // Secure y SameSite=Strict protegen contra XSS y CSRF
  document.cookie = `${nombre}=${valor};expires=${d.toUTCString()};path=/;Secure;SameSite=Strict`;
};

export const borrarCookie = (nombre) => {
  document.cookie = `${nombre}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=Strict`;
};
// --------------------------------------------------------

export async function peticion(ruta, opciones = {}) {
  const token = obtenerCookie('accessToken');
  const encabezados = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opciones.headers,
  };

  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    ...opciones,
    headers: encabezados,
    credentials: 'include' // Obligatorio para enviar la cookie HttpOnly al backend[cite: 1]
  });

  if (respuesta.status === 401) {
    borrarCookie('accessToken');
    window.location.href = '/';
    return;
  }

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({ title: 'Error', status: respuesta.status }));
    throw new Error(errorData.detail ?? errorData.title ?? `HTTP ${respuesta.status}`);
  }

  if (respuesta.status === 204) return null;
  return respuesta.json();
}

export const iniciarSesion = async (credenciales) => {
  return peticion('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credenciales)
  });
};

export const cerrarSesionBackend = async () => {
  return peticion('/auth/logout', { method: 'POST' });
};

export const obtenerResumenObservatorio = (codigoSede = '') =>
  peticion(`/observatorio/resumen${codigoSede ? `?sede=${codigoSede}` : ''}`);

export const obtenerUsuariosAdmin = () => peticion('/admin/usuarios');
export const guardarUsuarioAdmin = (datos) => peticion('/admin/usuarios', { method: 'POST', body: JSON.stringify(datos) });
export const eliminarUsuarioAdmin = (id) => peticion(`/admin/usuarios/${id}`, { method: 'DELETE' });
