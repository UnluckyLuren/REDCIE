import { useState, useEffect, useCallback } from 'react';
import { obtenerResumenObservatorio } from '../servicios/apiCliente';

export function usarObservatorio(codigoSede = '') {
  const [datos, setDatos]       = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await obtenerResumenObservatorio(codigoSede);
      setDatos(resultado);
      localStorage.setItem(`cache_observatorio_${codigoSede || 'global'}`, JSON.stringify({ datos: resultado, timestamp: Date.now() }));
    } catch (err) {
      const cachePrevio = localStorage.getItem(`cache_observatorio_${codigoSede || 'global'}`);
      if (cachePrevio) {
        const { datos: datosCacheados } = JSON.parse(cachePrevio);
        setDatos({ ...datosCacheados, _servidoDesdeCache: true });
      }
      setError(err.message ?? 'Error al conectar con el Observatorio');
    } finally {
      setCargando(false);
    }
  }, [codigoSede]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  return { datos, cargando, error, recargar: cargarDatos };
}
