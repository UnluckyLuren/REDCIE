import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardShell from './componentes/layout/DashboardShell';
import Observatorio from './paginas/Observatorio';
import Login from './paginas/Login';
import Landing from './paginas/Landing';
import RutaProtegida from './componentes/comunes/RutaProtegida';
import Perfiles from './paginas/admin/Perfiles';
import Ajustes from './paginas/Ajustes';
import Dashboard from './paginas/Dashboard';

import Registro from './paginas/Registro';

function RutasInternas() {
  return (
    <RutaProtegida>
      <DashboardShell rutaActual={window.location.pathname}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/observatorio" element={<Observatorio />} />
          <Route path="/admin/perfiles" element={<Perfiles />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </DashboardShell>
    </RutaProtegida>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/registro" element={<Registro />} />

      <Route path="/*" element={<RutasInternas />} />
    </Routes>
  );
}
