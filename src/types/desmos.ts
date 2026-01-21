export type DesmosCalculator = {
  setExpression: (expression: {
    id: string;
    latex: string;
    hidden?: boolean;
    label?: string;
    showLabel?: boolean;
    color?: string;
    lineWidth?: number;
    fillOpacity?: number;
  }) => void;
  setMathBounds: (bounds: {
    left: number;
    right: number;
    bottom: number;
    top: number;
  }) => void;
  resize: () => void;
  destroy: () => void;
};

export type DesmosGlobal = {
  GraphingCalculator: (
    element: HTMLElement,
    options: Record<string, unknown>
  ) => DesmosCalculator;
};

export type DesmosWindow = Window & {
  Desmos?: DesmosGlobal;
  __desmosPromise?: Promise<DesmosGlobal>;
};
