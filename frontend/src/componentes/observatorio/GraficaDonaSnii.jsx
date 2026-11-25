const COLORES_SNII = { CANDIDATO: '#455f88', NIVEL_I: '#0f2b48', NIVEL_II: '#00162d', NIVEL_III: '#da7808', EMERITO: '#1a3a5c' };
const ETIQUETAS_SNII = { CANDIDATO: 'Candidato', NIVEL_I: 'Nivel I', NIVEL_II: 'Nivel II', NIVEL_III: 'Nivel III', EMERITO: 'Emérito' };

export default function GraficaDonaSnii({ distribucion }) {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return <div className="bg-surface-container-lowest rounded-card shadow-card border border-surface-container p-6 flex items-center justify-center h-full"><p className="text-body-sm text-on-surface-variant">Sin datos SNII para esta sede</p></div>;
  }
  const total = Object.values(distribucion).reduce((a, b) => a + (b ?? 0), 0);
  const cx = 80; const cy = 80; const radio = 60; const radioInt = 38;
  let anguloAcum = -Math.PI / 2;

  const segmentos = Object.entries(distribucion).filter(([, v]) => v !== null && v > 0).map(([nivel, cantidad]) => {
    const angulo = (cantidad / total) * 2 * Math.PI;
    const xIni = cx + radio * Math.cos(anguloAcum); const yIni = cy + radio * Math.sin(anguloAcum);
    const xFin = cx + radio * Math.cos(anguloAcum + angulo); const yFin = cy + radio * Math.sin(anguloAcum + angulo);
    const xIntIni = cx + radioInt * Math.cos(anguloAcum); const yIntIni = cy + radioInt * Math.sin(anguloAcum);
    const xIntFin = cx + radioInt * Math.cos(anguloAcum + angulo); const yIntFin = cy + radioInt * Math.sin(anguloAcum + angulo);
    const esGrande = angulo > Math.PI ? 1 : 0;
    const d = `M ${xIni} ${yIni} A ${radio} ${radio} 0 ${esGrande} 1 ${xFin} ${yFin} L ${xIntFin} ${yIntFin} A ${radioInt} ${radioInt} 0 ${esGrande} 0 ${xIntIni} ${yIntIni} Z`;
    anguloAcum += angulo;
    return { nivel, cantidad, porcentaje: Math.round((cantidad / total) * 100), d };
  });

  return (
    <article className="bg-surface-container-lowest rounded-card shadow-card border border-surface-container p-6 h-full">
      <h3 className="font-outfit text-headline-sm text-on-surface mb-4">Distribución SNII</h3>
      <div className="flex flex-col items-center gap-4">
        <svg width="160" height="160" viewBox="0 0 160 160" role="img" className="flex-shrink-0">
          {segmentos.map((seg) => (
            <path key={seg.nivel} d={seg.d} fill={COLORES_SNII[seg.nivel] ?? '#455f88'} className="hover:opacity-80 transition-opacity cursor-default">
              <title>{`${ETIQUETAS_SNII[seg.nivel]}: ${seg.cantidad} investigadores (${seg.porcentaje}%)`}</title>
            </path>
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" className="font-outfit" style={{ fontSize: '22px', fontWeight: 700, fill: '#0b1c30' }}>{total}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: '10px', fill: '#43474d', fontFamily: 'Inter' }}>Total SNII</text>
        </svg>
        <dl className="w-full space-y-2">
          {segmentos.map((seg) => (
            <div key={seg.nivel} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORES_SNII[seg.nivel] ?? '#455f88' }} />
                <dt className="text-label-md text-on-surface-variant">{ETIQUETAS_SNII[seg.nivel] ?? seg.nivel}</dt>
              </div>
              <div className="flex items-center gap-2">
                <dd className="text-label-md font-600 text-on-surface">{seg.cantidad}</dd>
                <span className="text-label-sm text-on-surface-variant">{seg.porcentaje}%</span>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
