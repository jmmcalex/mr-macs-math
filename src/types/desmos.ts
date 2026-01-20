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

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        element: HTMLElement,
        options: Record<string, unknown>
      ) => DesmosCalculator;
    };
    __desmosPromise?: Promise<NonNullable<Window["Desmos"]>>;
  }
}

export {};
