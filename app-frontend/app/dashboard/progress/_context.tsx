import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Angle, CapturedPhoto } from '@/lib/api/progress';

type PhotoMap = Partial<Record<Angle, CapturedPhoto>>;

type ProgressSessionCtx = {
  photos: PhotoMap;
  setPhoto: (angle: Angle, photo: CapturedPhoto) => void;
  reset: () => void;
};

const Context = createContext<ProgressSessionCtx | null>(null);

export function ProgressSessionProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<PhotoMap>({});

  const setPhoto = useCallback((angle: Angle, photo: CapturedPhoto) => {
    setPhotos((prev) => ({ ...prev, [angle]: photo }));
  }, []);

  const reset = useCallback(() => setPhotos({}), []);

  return (
    <Context.Provider value={{ photos, setPhoto, reset }}>
      {children}
    </Context.Provider>
  );
}

export function useProgressSession() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useProgressSession must be used within ProgressSessionProvider');
  return ctx;
}
