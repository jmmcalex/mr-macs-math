"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import PlaygroundShell from "@/components/PlaygroundShell";
import TopNav from "@/components/TopNav";
import type {
  DesmosCalculator,
  DesmosGlobal,
  DesmosWindow,
} from "@/types/desmos";
import {
  clampAngle,
  computeCosineLaw,
  computeSineLawRatios,
  computeTriangle,
} from "@/lib/triangleMath";

const DESMOS_API_KEY = process.env.NEXT_PUBLIC_DESMOS_API_KEY ?? "";
const DESMOS_SRC = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${encodeURIComponent(
  DESMOS_API_KEY
)}`;

const BASE_LENGTH = 10;
const DEFAULT_BOUNDS = { left: -2, right: 12, bottom: -2, top: 10 };
const loadDesmos = (): Promise<DesmosGlobal> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Desmos can only load in the browser."));
  }

  const win = window as DesmosWindow;

  if (win.Desmos) {
    return Promise.resolve(win.Desmos);
  }

  if (!win.__desmosPromise) {
    win.__desmosPromise = new Promise<DesmosGlobal>(
      (resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          "script[data-desmos]"
        );
        if (existing) {
          existing.addEventListener("load", () =>
            resolve(win.Desmos as DesmosGlobal)
          );
          existing.addEventListener("error", () =>
            reject(new Error("Failed to load Desmos."))
          );
          return;
        }

        const script = document.createElement("script");
        script.src = DESMOS_SRC;
        script.async = true;
        script.defer = true;
        script.dataset.desmos = "true";
        script.onload = () =>
          resolve(win.Desmos as DesmosGlobal);
        script.onerror = () => reject(new Error("Failed to load Desmos."));
        document.head.appendChild(script);
      }
    );
  }

  return win.__desmosPromise;
};

const formatNumber = (value: number, decimals = 3) => {
  const fixed = value.toFixed(decimals);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

export default function TriangleLawsPlaygroundPage() {
  const [angleA, setAngleA] = useState(50);
  const [angleB, setAngleB] = useState(60);
  const [activeTab, setActiveTab] = useState<
    "decompose" | "sine" | "cosine"
  >("decompose");
  const [showAltitude, setShowAltitude] = useState(true);
  const [graphError, setGraphError] = useState<string | null>(null);
  const graphRef = useRef<HTMLDivElement | null>(null);
  const calculatorRef = useRef<DesmosCalculator | null>(null);

  const safeAngles = useMemo(() => {
    const clampedA = clampAngle(angleA, 20, 140);
    const clampedB = clampAngle(angleB, 20, 140);
    const sum = clampedA + clampedB;
    if (sum > 170) {
      return { A: clampedA, B: clampAngle(170 - clampedA, 20, 140) };
    }
    return { A: clampedA, B: clampedB };
  }, [angleA, angleB]);

  const triangle = useMemo(
    () => computeTriangle(safeAngles.A, safeAngles.B, BASE_LENGTH),
    [safeAngles.A, safeAngles.B]
  );

  const sineRatios = useMemo(
    () => computeSineLawRatios(triangle),
    [triangle]
  );
  const cosineLaw = useMemo(() => computeCosineLaw(triangle), [triangle]);

  const ratioMatch =
    Math.abs(sineRatios.ratioA - sineRatios.ratioB) < 0.01 &&
    Math.abs(sineRatios.ratioA - sineRatios.ratioC) < 0.01;

  const updateExpressions = (mode: "decompose" | "sine" | "cosine") => {
    if (!calculatorRef.current) return;
    calculatorRef.current.setMathBounds(DEFAULT_BOUNDS);

    const xC = triangle.xC;
    const yC = triangle.yC;

    const setExpr = (
      id: string,
      latex: string,
      hidden = false,
      options: {
        color?: string;
        lineWidth?: number;
        lines?: boolean;
        points?: boolean;
        label?: string;
        showLabel?: boolean;
      } = {}
    ) => {
      calculatorRef.current?.setExpression({
        id,
        latex,
        hidden,
        ...options,
      });
    };

    const pointA = "(0,0)";
    const pointB = `(${BASE_LENGTH},0)`;
    const pointC = `(${xC},${yC})`;

    setExpr("P_A", `P_A=${pointA}`, false, { label: "A", showLabel: true });
    setExpr("P_B", `P_B=${pointB}`, false, { label: "B", showLabel: true });
    setExpr("P_C", `P_C=${pointC}`, false, { label: "C", showLabel: true });

    setExpr("AB", `[${pointA},${pointB}]`, false, {
      color: "#4b2a10",
      lineWidth: 2,
      lines: true,
      points: false,
    });
    setExpr("BC", `[${pointB},${pointC}]`, false, {
      color: "#4b2a10",
      lineWidth: 2,
      lines: true,
      points: false,
    });
    setExpr("CA", `[${pointC},${pointA}]`, false, {
      color: "#4b2a10",
      lineWidth: 2,
      lines: true,
      points: false,
    });

    const altitudeVisible = showAltitude;
    setExpr(
      "altitude",
      `[${pointC},(${xC},0)]`,
      !altitudeVisible,
      { color: "#e0792b", lineWidth: 2, lines: true, points: false }
    );

    const rightVisible = mode === "decompose";
    setExpr(
      "right-1",
      `[${pointA},(${xC},0)]`,
      !rightVisible,
      { color: "#e0792b", lineWidth: 2, lines: true, points: false }
    );
    setExpr(
      "right-2",
      `[(${xC},0),${pointB}]`,
      !rightVisible,
      { color: "#e0792b", lineWidth: 2, lines: true, points: false }
    );
  };

  useEffect(() => {
    let active = true;
    if (!graphRef.current) return;
    if (!DESMOS_API_KEY) {
      setGraphError("Missing Desmos API key.");
      return;
    }

    loadDesmos()
      .then((Desmos) => {
        if (!active || !graphRef.current) return;
        calculatorRef.current = Desmos.GraphingCalculator(graphRef.current, {
          expressions: false,
          keypad: false,
          settingsMenu: false,
          zoomButtons: false,
          expressionsCollapsed: true,
          lockViewport: true,
          pointsOfInterest: false,
          trace: false,
        });
        updateExpressions(activeTab);
      })
      .catch(() => {
        if (active) {
          setGraphError("Unable to load Desmos.");
        }
      });

    return () => {
      active = false;
      calculatorRef.current?.destroy();
      calculatorRef.current = null;
    };
  }, []);

  useEffect(() => {
    updateExpressions(activeTab);
  }, [activeTab, triangle, showAltitude]);

  useEffect(() => {
    calculatorRef.current?.resize();
  }, [activeTab]);

  const handleSetAngleA = (value: number) => {
    const clamped = clampAngle(value, 20, 140);
    const maxA = 170 - safeAngles.B;
    setAngleA(Math.min(clamped, maxA));
  };

  const handleSetAngleB = (value: number) => {
    const clamped = clampAngle(value, 20, 140);
    const maxB = 170 - safeAngles.A;
    setAngleB(Math.min(clamped, maxB));
  };

  const handleResetActivity = () => {
    setAngleA(50);
    setAngleB(60);
    setShowAltitude(true);
    setActiveTab("decompose");
  };

  const handleResetView = () => {
    calculatorRef.current?.setMathBounds(DEFAULT_BOUNDS);
  };

  return (
    <PlaygroundShell
      title="Triangle Laws"
      prompt="Drop an altitude and compare how the triangle's ratios stay consistent."
      mainVariant="plain"
      drawerSpacing="tight"
      showDrawer={false}
      showActionBar
      onResetActivity={handleResetActivity}
      onResetView={handleResetView}
      topNav={
        <TopNav
          backHref="/d/trig"
          backLabel="Trig"
          contextLabel="Triangle Laws"
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] md:items-start">
        <nav className="flex gap-2 overflow-x-auto rounded-full border border-amber-200 bg-white/70 p-2 text-sm font-semibold text-amber-900 md:col-span-2">
          {[
            { id: "decompose", label: "Decompose" },
            { id: "sine", label: "Sine Law" },
            { id: "cosine", label: "Cosine Law" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id as "decompose" | "sine" | "cosine")
              }
              className={`min-h-[44px] flex-1 rounded-full px-4 ${
                activeTab === tab.id
                  ? "bg-amber-950 text-amber-50"
                  : "bg-amber-50 text-amber-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="grid gap-4">
          <section className="rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-950">
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-amber-700">
              <h2>Live Readout</h2>
              <span className="font-semibold text-amber-800/80">
                A = {formatNumber(safeAngles.A, 0)}° · B ={" "}
                {formatNumber(safeAngles.B, 0)}° · C ={" "}
                {formatNumber(triangle.angleC, 0)}°
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <p>
                Base split: x = {formatNumber(triangle.xC, 2)} · c − x ={" "}
                {formatNumber(BASE_LENGTH - triangle.xC, 2)}
              </p>
              <p>
                Height: h = {formatNumber(triangle.yC, 2)}
              </p>
              <p>
                Side lengths: a = {formatNumber(triangle.a, 2)}, b ={" "}
                {formatNumber(triangle.b, 2)}, c = {BASE_LENGTH}
              </p>
            </div>
          </section>

          {activeTab === "sine" ? (
            <section className="rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-950">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-amber-700">
                <h2>Sine Law Ratios</h2>
                <span
                  className={`font-semibold ${
                    ratioMatch ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {ratioMatch ? "They match" : "Close match"}
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                <p>sin(A) / a = {formatNumber(sineRatios.ratioA)}</p>
                <p>sin(B) / b = {formatNumber(sineRatios.ratioB)}</p>
                <p>sin(C) / c = {formatNumber(sineRatios.ratioC)}</p>
              </div>
            </section>
          ) : null}

          {activeTab === "cosine" ? (
            <section className="rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-950">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-amber-700">
                <h2>Cosine Law Check</h2>
                <span className="font-semibold text-amber-800/80">
                  c² = a² + b² − 2ab cos C
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                <p>c² = {formatNumber(cosineLaw.c2, 2)}</p>
                <p>a² + b² = {formatNumber(cosineLaw.a2b2, 2)}</p>
                <p>2ab cos C = {formatNumber(cosineLaw.correction, 2)}</p>
                <p>Difference = {formatNumber(cosineLaw.diff, 4)}</p>
                <p className="text-amber-900/80">
                  When C ≈ 90°, cos C ≈ 0 → c² ≈ a² + b²
                </p>
              </div>
            </section>
          ) : null}

          <div className="rounded-[28px] border border-amber-200 bg-white/80 p-3 shadow-[0_18px_40px_-32px_rgba(120,60,20,0.6)]">
            <div className="relative w-full aspect-[7/6] max-h-[60vh] min-h-[260px] rounded-[22px] bg-white">
              <div ref={graphRef} className="desmos-graph h-full w-full" />
            </div>
            {graphError ? (
              <p className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {graphError} Add `NEXT_PUBLIC_DESMOS_API_KEY` to `.env.local`.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[26px] border border-amber-200 bg-white/80 px-5 pb-5 pt-4 shadow-[0_18px_40px_-32px_rgba(120,60,20,0.6)]">
          <div className="text-base font-semibold text-amber-950">
            Control Panel
          </div>
          <div className="mt-4 grid gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                <span>Angle A</span>
                <span>{formatNumber(safeAngles.A, 0)}°</span>
              </div>
              <input
                className="h-2 w-full accent-amber-700"
                type="range"
                min={20}
                max={140}
                step={1}
                value={safeAngles.A}
                onChange={(event) => handleSetAngleA(Number(event.target.value))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                <span>Angle B</span>
                <span>{formatNumber(safeAngles.B, 0)}°</span>
              </div>
              <input
                className="h-2 w-full accent-amber-700"
                type="range"
                min={20}
                max={140}
                step={1}
                value={safeAngles.B}
                onChange={(event) => handleSetAngleB(Number(event.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                className={`h-11 rounded-full text-sm font-semibold ${
                  showAltitude
                    ? "bg-amber-950 text-amber-50"
                    : "border border-amber-200 bg-white text-amber-900"
                }`}
                onClick={() => setShowAltitude((prev) => !prev)}
              >
                Show altitude
              </button>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                className="h-11 rounded-full border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-900"
                onClick={() => {
                  setAngleA(50);
                  setAngleB(60);
                }}
              >
                Acute preset
              </button>
              <button
                type="button"
                className="h-11 rounded-full border border-amber-200 bg-white text-sm font-semibold text-amber-900"
                onClick={() => {
                  setAngleA(110);
                  setAngleB(40);
                }}
              >
                Obtuse preset
              </button>
              <button
                type="button"
                className="h-12 rounded-full border border-amber-200 bg-amber-950 text-base font-semibold text-amber-50"
                onClick={handleResetActivity}
              >
                Reset
              </button>
            </div>
          </div>
        </aside>
      </div>
    </PlaygroundShell>
  );
}
