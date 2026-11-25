import { useState } from 'react';
import { usarObservatorio } from '../hooks/usarObservatorio';
import TarjetaKpi from '../componentes/observatorio/TarjetaKpi';
import GraficaDonaSnii from '../componentes/observatorio/GraficaDonaSnii';
import BarrasDistribucion from '../componentes/observatorio/BarrasDistribucion';
import MatrizProduccion from '../componentes/observatorio/MatrizProduccion';
import SelloAuditoria from '../componentes/comunes/SelloAuditoria';
import EstadoCarga from '../componentes/comunes/EstadoCarga';

export default function Observatorio() {
  const [sedeFiltro, setSedeFiltro] = useState('');
  const { datos, cargando, error } = usarObservatorio(sedeFiltro);

  if (cargando) return <EstadoCarga mensaje="Cargando datos del Observatorio..." />;

  if (error) {
    return (
      <div role="alert" className="rounded-xl bg-error/10 border border-error/20 p-6 text-center">
        <span className="material-symbols-outlined text-error text-4xl block mb-2" aria-hidden="true">error_outline</span>
        <p className="text-body-md text-error font-500">Error al cargar el Observatorio</p>
        <p className="text-body-sm text-on-surface-variant mt-1">{error}</p>
      </div>
    );
  }

  const sinDatos = !datos || datos.estado === 'SIN_DATOS';

  return (
    <section aria-labelledby="titulo-observatorio">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-surface-container text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">verified</span>
              Padrón Institucional {datos?.sede?.codigo ?? 'Red'}
            </span>
          </div>
          <h1 id="titulo-observatorio" className="font-outfit text-headline-lg text-on-surface">
            Observatorio de Investigación e Impacto
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {datos?.sede?.nombre ?? 'Red Universitaria UdeG'}
          </p>
        </div>
        <SelloAuditoria fecha={datos?.ultimaAuditoria} estado={datos?.estadoSincronizacion} />
      </div>

      {sinDatos ? (
        <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl block mb-3" aria-hidden="true">analytics</span>
          <p className="font-outfit text-headline-sm text-on-surface">Sin corte cargado</p>
          <p className="text-body-md text-on-surface-variant mt-2">
            No existe un corte de auditoría para esta sede o período.
            Los datos se representan como NA (pendiente de integración), nunca como 0.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8" role="list" aria-label="Indicadores clave">
            <TarjetaKpi etiqueta="Investigadores SNII" valor={datos.kpis?.padronSnii} icono="badge" descripcion="Padrón SNII vigente" />
            <TarjetaKpi etiqueta="Artículos Indexados" valor={datos.kpis?.articulosIndexados} icono="article" descripcion="Registrados en 2026" />
            <TarjetaKpi etiqueta="Cuerpos Académicos" valor={datos.kpis?.cuerposAcademicos} icono="groups" descripcion="Consolidados y en formación" />
            <TarjetaKpi etiqueta="Proyectos Activos" valor={datos.kpis?.proyectosActivos} icono="science" descripcion="Vigentes en la plataforma" />
          </div>

          {datos.distribucionSnii && (
            <div className="grid grid-cols-12 gap-4 mb-8">
              <div className="col-span-12 lg:col-span-8"><BarrasDistribucion distribucion={datos.distribucionSnii} /></div>
              <div className="col-span-12 lg:col-span-4"><GraficaDonaSnii distribucion={datos.distribucionSnii} /></div>
            </div>
          )}

          {datos.produccionPorCategoria && <MatrizProduccion produccion={datos.produccionPorCategoria} />}

          <div className="mt-8 rounded-xl bg-surface-container-lowest border border-surface-container p-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5" aria-hidden="true">shield_lock</span>
              <div>
                <h2 className="font-outfit text-headline-sm text-on-surface mb-2">Política de Integridad y Cobertura de Datos</h2>
                <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
                  {['Los datos provienen exclusivamente de fuentes institucionales verificables.', 'Los campos sin fuente disponible se muestran como NA (nunca como cero).', 'Discrepancias entre fuentes se marcan y escalan al panel de gobierno del dato.', 'La ausencia de información no equivale a ausencia de actividad.'].map((texto, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 flex-shrink-0" aria-hidden="true">check_circle</span>
                      {texto}
                    </li>
                  ))}
                </ul>
                <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-lg font-500 hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
                  Descargar Informe Técnico PDF
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
