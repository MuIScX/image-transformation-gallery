"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type MatrixValues = { a: number; b: number; c: number; d: number };
export type PointValues = { x: number; y: number };

export type MatrixState = {
  a: number;
  b: number;
  c: number;
  d: number;
  point: PointValues;
  setMatrix: (m: Partial<MatrixValues>) => void;
  setPoint: (p: PointValues) => void;
  reset: () => void;
  uploadedImage: HTMLImageElement | null;
  setUploadedImage: (img: HTMLImageElement | null) => void;
};

const DEFAULT_MATRIX: MatrixValues = { a: 1, b: 0, c: 0, d: 1 };
const DEFAULT_POINT: PointValues = { x: 80, y: -40 };

const MatrixContext = createContext<MatrixState | null>(null);

export function MatrixProvider({ children }: { children: ReactNode }) {
  const [matrix, setMatrixState] = useState<MatrixValues>(DEFAULT_MATRIX);
  const [point, setPointState] = useState<PointValues>(DEFAULT_POINT);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);

  const setMatrix = useCallback((m: Partial<MatrixValues>) => {
    setMatrixState((prev) => ({ ...prev, ...m }));
  }, []);

  const setPoint = useCallback((p: PointValues) => {
    setPointState(p);
  }, []);

  const reset = useCallback(() => {
    setMatrixState(DEFAULT_MATRIX);
    setPointState(DEFAULT_POINT);
  }, []);

  const value = useMemo<MatrixState>(
    () => ({
      ...matrix,
      point,
      setMatrix,
      setPoint,
      reset,
      uploadedImage,
      setUploadedImage,
    }),
    [matrix, point, setMatrix, setPoint, reset, uploadedImage]
  );

  return <MatrixContext.Provider value={value}>{children}</MatrixContext.Provider>;
}

export function useMatrix(): MatrixState {
  const ctx = useContext(MatrixContext);
  if (!ctx) throw new Error("useMatrix must be used within a MatrixProvider");
  return ctx;
}
