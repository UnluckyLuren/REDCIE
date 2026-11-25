import { useMemo } from 'react';

const DIMENSIONES_DEFECTO = [
  { clave: 'PRODUCCION',   etiqueta: 'Producción'    },
  { clave: 'INNOVACION',   etiqueta: 'Innovación'    },
  { clave: 'FORMACION',    etiqueta: 'Formación'     },
  { clave: 'IMPACTO',      etiqueta: 'Impacto'       },
  { clave: 'COLABORACION', etiqueta: 'Colaboración'  },
];

export default function RadarCapacidades({ metricas = [], esEscritorio = true }) {
  const tamano     = esEscritorio ? 260 : 220;
  const centro     = tamano / 2;
  const radioMax   = tamano * 0.38;
  const numDims    = DIMENSIONES_DEFECTO.length;

  const dimensionesConDatos = metricas.filter(m => m.valorCalculado !== null);
  const porcentajeCobertura = Math.round((dimensionesConDatos.length / numDims) * 100);
  const esModeloPreliminar  = porcentajeCobertura < 100;

  const puntos = useMemo(() => {
    return DIMENSIONES_DEFECTO.map((dim, i) => {
      const angulo = (i / numDims) * 2 * Math.PI - Math.PI / 2;
      const metrica = metricas.find(m => m.dimension === dim.clave);
      const valor   = metrica?.valorCalculado ?? 0;
      const radio   = (valor / 100) * radioMax;

      return {
        ...dim,
        x: centro + radio * Math.cos(angulo),
        y: centro + radio * Math.sin(angulo),
        xEje: centro + (radioMax + 18) * Math.cos(angulo),
        yEje: centro + (radioMax + 18) * Math.sin(angulo),
        valor: metrica?.valorCalculado ?? null,
      };
    });
  }, [metricas, radioMax, centro, numDims]);

  const polyPoints = puntos.map(p => `${p.x},${p.y}`).join(' ');

  const anillos = [0.25, 0.5, 0.75, 1].map(f => {
    const ptsAnillo = DIMENSIONES_DEFECTO.map((_, i) => {
      const angulo = (i / numDims) * 2 * Math.PI - Math.PI / 2;
      const r      = radioMax * f;
      return `${centro + r * Math.cos(angulo)},${centro + r * Math.sin(angulo)}`;
    });
    return ptsAnillo.join(' ');
  });

  return (
    <div className="flex flex-col gap-4">
      {esModeloPreliminar && (
        <div role="note" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-on-tertiary-container/10 border border-on-tertiary-container/20">
          <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">info</span>
          <p className="text-label-sm text-on-tertiary-container font-500">Modelo preliminar — Cobertura {porcentajeCobertura}%</p>
        </div>
      )}
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" className="mx-auto">
        <title>Radar de Capacidades del Investigador</title>
        {anillos.map((pts, i) => ( <polygon key={i} points={pts} fill="none" stroke="#e5eeff" strokeWidth="1" /> ))}
        {puntos.map((p, i) => ( <line key={i} x1={centro} y1={centro} x2={centro + radioMax * Math.cos((i / numDims) * 2 * Math.PI - Math.PI / 2)} y2={centro + radioMax * Math.sin((i / numDims) * 2 * Math.PI - Math.PI / 2)} stroke="#dce9ff" strokeWidth="1" /> ))}
        <polygon points={polyPoints} fill="#00162d" fillOpacity="0.15" stroke="#00162d" strokeWidth="2" strokeLinejoin="round" className="radar-polygon" />
        {puntos.map((p, i) => ( <circle key={i} cx={p.x} cy={p.y} r="4" fill="#00162d" /> ))}
        {puntos.map((p, i) => ( <text key={i} x={p.xEje} y={p.yEje} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '10px', fill: '#43474d', fontFamily: 'Inter', fontWeight: 500 }}>{p.etiqueta}</text> ))}
      </svg>
      <dl className="space-y-2.5">
        {puntos.map((p) => (
          <div key={p.clave}>
            <div className="flex justify-between items-center mb-1">
              <dt className="text-label-md text-on-surface font-500">{p.etiqueta}</dt>
              <dd className="text-label-md font-600 text-on-surface">{p.valor !== null ? `${p.valor}%` : (<span className="text-on-surface-variant">NA</span>)}</dd>
            </div>
            <div className="h-1.5 rounded-pill bg-surface-container overflow-hidden">
              {p.valor !== null && ( <div className="h-full rounded-pill bg-primary transition-all duration-500" style={{ width: `${p.valor}%` }} /> )}
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
