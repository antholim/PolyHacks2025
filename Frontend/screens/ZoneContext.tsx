import React, { createContext, useState, useContext } from 'react';

interface ZoneContextType {
  selectedZone: number | null;
  setSelectedZone: (zone: number | null) => void;
}

const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

export function ZoneProvider({ children }: { children: React.ReactNode }) {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  return (
    <ZoneContext.Provider value={{ selectedZone, setSelectedZone }}>
      {children}
    </ZoneContext.Provider>
  );
}

export function useZone() {
  const context = useContext(ZoneContext);
  if (context === undefined) {
    throw new Error('useZone must be used within a ZoneProvider');
  }
  return context;
}