export default function TarjetaKpi({ etiqueta, valor, icono, descripcion }) {
  const valorMostrar = valor !== null && valor !== undefined ? valor.toLocaleString('es-MX') : null;
  return (
    <article role="listitem" className="bg-surface-container-lowest rounded-card shadow-card border border-surface-container p-5 flex items-start gap-4 hover:shadow-elevated transition-shadow duration-200" aria-label={`${etiqueta}: ${valorMostrar ?? 'datos pendientes'}`}>
      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-secondary text-xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>{icono}</span>
      </div>
      <div className="min-w-0">
        {valorMostrar !== null ? (
          <p className="font-outfit text-display-lg text-on-surface leading-none">{valorMostrar}</p>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="font-outfit text-headline-md text-on-surface-variant">NA</p>
            <span className="material-symbols-outlined text-on-surface-variant/60 text-[14px]" aria-label="Dato pendiente de integración" title="Pendiente de integración — no equivale a cero">info</span>
          </div>
        )}
        <p className="text-label-lg text-on-surface font-500 mt-0.5">{etiqueta}</p>
        <p className="text-label-md text-on-surface-variant">{descripcion}</p>
      </div>
    </article>
  );
}
