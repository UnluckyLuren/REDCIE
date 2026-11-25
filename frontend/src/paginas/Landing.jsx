import { Link } from 'react-router-dom';

export default function Landing() {
  const modulos = [
    { icono: 'insights', titulo: 'Observatorio Abierto', desc: 'Métricas auditables de SNII, producción académica y capacidades científicas de toda la Red.' },
    { icono: 'badge', titulo: 'Directorio de Investigadores', desc: 'Encuentra especialistas verificados mediante radares de capacidades y vincula proyectos.' },
    { icono: 'science', titulo: 'Portafolio I+D+i', desc: 'Explora iniciativas en etapa de maduración y solicita acceso al Data Room protegido por NDA.' },
    { icono: 'handshake', titulo: 'Retos Institucionales', desc: 'Postula soluciones multidisciplinarias a desafíos del sector productivo e institucional.' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-inter">
      {/* Navbar Público */}
      <nav className="fixed w-full z-50 bg-surface/85 backdrop-blur-xl border-b border-surface-container px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">account_balance</span>
          </div>
          <span className="font-outfit font-700 text-headline-sm text-on-surface">Red UdeG</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/observatorio" className="hidden sm:block text-label-md font-500 text-on-surface-variant hover:text-primary transition-colors">
            Explorar Observatorio
          </Link>
          <Link to="/login" className="text-label-md font-500 text-on-surface hover:text-primary transition-colors">
            Iniciar Sesión
          </Link>
          <Link to="/registro" className="px-5 py-2 rounded-lg bg-primary text-on-primary text-label-md font-500 hover:bg-primary-container transition-colors shadow-sm">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-surface-container-high rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-container text-label-md text-secondary mb-6">
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              Ecosistema Unificado de Innovación
            </span>
            <h1 className="font-outfit text-display-lg text-on-surface leading-tight mb-6">
              Plataforma Multi-Sede de <span className="text-primary">Coordinación Científica</span> e Innovación
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Conecta centros universitarios, preparatorias y al sector productivo. Impulsa la transferencia tecnológica desde la idea hasta el escalamiento comercial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary text-on-primary text-label-lg font-500 hover:shadow-elevated transition-all flex items-center justify-center gap-2">
                Acceder a mi espacio
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/observatorio" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface text-label-lg font-500 hover:bg-surface-container-low transition-all">
                Ver Métricas Públicas
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-surface-container-lowest py-20 border-t border-surface-container">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modulos.map((mod, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface hover:bg-surface-container-low border border-surface-container transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors text-secondary">
                    <span className="material-symbols-outlined">{mod.icono}</span>
                  </div>
                  <h3 className="font-outfit text-headline-sm text-on-surface mb-2">{mod.titulo}</h3>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary py-8 text-center border-t border-primary-container">
        <p className="text-label-sm text-on-primary/60">
          © {new Date().getFullYear()} Universidad de Guadalajara. Coordinación de Innovación.
        </p>
      </footer>
    </div>
  );
}
