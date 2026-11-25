import { createContext, useContext, useState } from 'react';

const SedeContext = createContext();

export function SedeProvider({ children }) {
  const [sedActual, setSedeActual] = useState({
    codigo: 'CUCEI',
    nombreOficial: 'Ciencias Exactas e Ingenierías'
  });

  return (
    <SedeContext.Provider value={{ sedActual, setSedeActual }}>
      {children}
    </SedeContext.Provider>
  );
}

export const useContextoSede = () => useContext(SedeContext);
