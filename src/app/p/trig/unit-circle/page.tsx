"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import PlaygroundShell from "@/components/PlaygroundShell";
import TopNav from "@/components/TopNav";
import {
  TWO_PI,
  degreesToRadians,
  formatNumber,
  normalizeRadians,
  quadrantLabel,
  radiansToDegrees,
  sinCosTan,
} from "@/lib/trig";
import type {
  DesmosCalculator,
  DesmosGlobal,
  DesmosWindow,
} from "@/types/desmos";

const DESMOS_API_KEY = process.env.NEXT_PUBLIC_DESMOS_API_KEY ?? "";
const DESMOS_SRC = `https://www.desmos.com/api/v1.6/calculator.js?apiKey=${encodeURIComponent(
  DESMOS_API_KEY
)}`;

const CIRCLE_BOUNDS = { left: -1.6, right: 1.6, bottom: -1.6, top: 1.6 };
const TRIANGLE_BOUNDS = { left: -1.6, right: 1.6, bottom: -1.6, top: 1.6 };
const GRAPH_BOUNDS = {
  left: -Math.PI / 4,
  right: TWO_PI * 1.25,
  bottom: -1.5,
  top: 1.5,
};

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

const anglePresets = [
  { label: "0° / 0", radians: 0 },
  { label: "30° / π/6", radians: Math.PI / 6 },
  { label: "45° / π/4", radians: Math.PI / 4 },
  { label: "60° / π/3", radians: Math.PI / 3 },
  { label: "90° / π/2", radians: Math.PI / 2 },
  { label: "180° / π", radians: Math.PI },
  { label: "270° / 3π/2", radians: (3 * Math.PI) / 2 },
];

export default function UnitCirclePlaygroundPage() {
  const [thetaRadians, setThetaRadians] = useState(0);
  const [angleMode, setAngleMode] = useState<"degrees" | "radians">(
    "degrees"
  );
  const [activeTab, setActiveTab] = useState<"circle" | "graph">("circle");
  const [graphError, setGraphError] = useState<string | null>(null);
  const graphRef = useRef<HTMLDivElement | null>(null);
  const calculatorRef = useRef<DesmosCalculator | null>(null);

  const normalizedTheta = useMemo(
    () => normalizeRadians(thetaRadians),
    [thetaRadians]
  );

  const { sinValue, cosValue, tanValue } = useMemo(
    () => sinCosTan(normalizedTheta),
    [normalizedTheta]
  );

  const thetaDisplay = useMemo(() => {
    if (angleMode === "degrees") {
      return `${formatNumber(radiansToDegrees(normalizedTheta), 2)}°`;
    }
    return formatNumber(normalizedTheta, 3);
  }, [angleMode, normalizedTheta]);

  const updateExpressions = (mode: "circle" | "graph") => {
    if (!calculatorRef.current) return;
    const t = normalizedTheta;
    const cosRounded = Number(cosValue.toFixed(6));
    const sinRounded = Number(sinValue.toFixed(6));

    const setExpr = (
      id: string,
      latex: string,
      hidden = false,
      options: { color?: string; lineWidth?: number; fillOpacity?: number } = {}
    ) => {
      calculatorRef.current?.setExpression({
        id,
        latex,
        hidden,
        ...options,
      });
    };

    setExpr("theta", `t=${t}`);

    if (mode === "circle") {
      calculatorRef.current.setMathBounds(CIRCLE_BOUNDS);
    }
    if (mode === "graph") {
      calculatorRef.current.setMathBounds(GRAPH_BOUNDS);
    }

    const showCircle = mode === "circle";
    const showGraph = mode === "graph";

    setExpr("unit-circle", "x^2+y^2=1", !showCircle);
    setExpr("point", "P=(\\cos(t),\\sin(t))", !showCircle);
    setExpr("origin-point", "(0,0)", !showCircle, {
      color: "#2f4f6f",
      lineWidth: 3,
    });
    setExpr("x-axis-point", "(\\cos(t),0)", !showCircle, {
      color: "#2f4f6f",
      lineWidth: 3,
    });
    setExpr(
      "radius",
      "segment((0,0),(\\cos(t),\\sin(t)))",
      !showCircle
    );
    setExpr("triangle-A", "", true);
    setExpr("triangle-B", "", true);
    setExpr("triangle-C", "", true);
    setExpr("triangle-base", "", true);
    setExpr("triangle-vertical", "", true);
    setExpr("triangle-hyp", "", true);
    setExpr("triangle-fill", "", true);

    setExpr("sin-graph", "y=\\sin(x)", !showGraph);
    setExpr("cos-graph", "y=\\cos(x)", !showGraph);
    setExpr("cursor", `x=${t}`, !showGraph);
    setExpr("sin-point", `S=(${t},\\sin(${t}))`, !showGraph);
    setExpr("cos-point", `C=(${t},\\cos(${t}))`, !showGraph);

    const piLabel = `${formatNumber(Math.PI, 2)} (π)`;
    const twoPiLabel = `${formatNumber(TWO_PI, 2)} (2π)`;
    calculatorRef.current.setExpression({
      id: "tick-0",
      latex: "(0,0)",
      hidden: !showGraph,
      label: "0 (0)",
      showLabel: showGraph,
    });
    calculatorRef.current.setExpression({
      id: "tick-halfpi",
      latex: "(pi/2,0)",
      hidden: !showGraph,
      label: `${formatNumber(Math.PI / 2, 2)} (π/2)`,
      showLabel: showGraph,
    });
    calculatorRef.current.setExpression({
      id: "tick-pi",
      latex: "(pi,0)",
      hidden: !showGraph,
      label: piLabel,
      showLabel: showGraph,
    });
    calculatorRef.current.setExpression({
      id: "tick-3halfpi",
      latex: "(3pi/2,0)",
      hidden: !showGraph,
      label: `${formatNumber((3 * Math.PI) / 2, 2)} (3π/2)`,
      showLabel: showGraph,
    });
    calculatorRef.current.setExpression({
      id: "tick-2pi",
      latex: "(2pi,0)",
      hidden: !showGraph,
      label: twoPiLabel,
      showLabel: showGraph,
    });
    calculatorRef.current.setExpression({
      id: "tick-5halfpi",
      latex: "(5pi/2,0)",
      hidden: !showGraph,
      label: `${formatNumber((5 * Math.PI) / 2, 2)} (5π/2)`,
      showLabel: showGraph,
    });
  };

  const createCalculator = (mode: "circle" | "graph") => {
    if (!graphRef.current) return;
    if (!DESMOS_API_KEY) {
      setGraphError("Missing Desmos API key.");
      return;
    }

    loadDesmos()
      .then((Desmos) => {
        if (!graphRef.current) return;
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
        updateExpressions(mode);
      })
      .catch(() => {
        setGraphError("Unable to load Desmos.");
      });
  };

  useEffect(() => {
    createCalculator(activeTab);

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
  }, [activeTab]);

  useEffect(() => {
    updateExpressions(activeTab);
  }, [normalizedTheta]);

  const sliderValue =
    angleMode === "degrees"
      ? radiansToDegrees(normalizedTheta)
      : normalizedTheta;

  const handleSliderChange = (value: number) => {
    const radians =
      angleMode === "degrees" ? degreesToRadians(value) : value;
    setThetaRadians(radians);
  };

  const handleResetActivity = () => {
    setThetaRadians(0);
    setAngleMode("degrees");
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const baseStep = angleMode === "degrees" ? 1 : 0.01;
      const step = event.shiftKey ? baseStep * 5 : baseStep;
      const nextValue = sliderValue + direction * step;
      const maxValue = angleMode === "degrees" ? 360 : TWO_PI;
      const clamped = Math.max(0, Math.min(maxValue, nextValue));

      handleSliderChange(clamped);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [angleMode, sliderValue]);

  const handleResetView = () => {
    if (!calculatorRef.current) return;
    if (activeTab === "graph") {
      calculatorRef.current.setMathBounds(GRAPH_BOUNDS);
    } else {
      calculatorRef.current.setMathBounds(CIRCLE_BOUNDS);
    }
  };

  const tanDisplay =
    tanValue === null ? "undefined" : formatNumber(tanValue, 3);

  return (
    <PlaygroundShell
      title="Unit Circle"
      prompt="Move theta to connect the circle, triangle, and sine/cosine graphs."
      mainVariant="plain"
      drawerSpacing="tight"
      drawerDefaultOpen
      mainGrow={false}
      showActionBar={false}
      drawerMaxHeight="38vh"
      drawerCollapsible={false}
      showDrawer={false}
      onResetActivity={handleResetActivity}
      onResetView={handleResetView}
      topNav={
        <TopNav
          backHref="/d/trig"
          backLabel="Trigonometry"
          contextLabel="Unit Circle"
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] md:items-start">
        <nav className="flex gap-2 overflow-x-auto rounded-full border border-amber-200 bg-white/70 p-2 text-sm font-semibold text-amber-900 md:col-span-2">
          {[
            { id: "circle", label: "Circle" },
            { id: "graph", label: "Graph" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id as "circle" | "graph")
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
                θ = {thetaDisplay}
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-start">
              <div className="grid gap-3 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <p>
                    sin(θ):{" "}
                    <span className="font-semibold">
                      {formatNumber(sinValue, 3)}
                    </span>
                  </p>
                  <p>
                    cos(θ):{" "}
                    <span className="font-semibold">
                      {formatNumber(cosValue, 3)}
                    </span>
                  </p>
                  <p>
                    tan(θ): <span className="font-semibold">{tanDisplay}</span>
                  </p>
                  <p>
                    Quadrant:{" "}
                    <span className="font-semibold">
                      {quadrantLabel(normalizedTheta)}
                    </span>
                  </p>
                </div>
                <div className="grid gap-2 text-amber-900/80">
                  <p>
                    Unit circle point:{" "}
                    <span className="font-semibold">
                      ({formatNumber(cosValue, 3)}, {formatNumber(sinValue, 3)})
                    </span>
                  </p>
                  <p>
                    Triangle lengths:{" "}
                    <span className="font-semibold">
                      adj {formatNumber(cosValue, 3)}, opp{" "}
                      {formatNumber(sinValue, 3)}, hyp 1
                    </span>
                  </p>
                </div>
              </div>
              <div className="rounded-[18px] border border-amber-200 bg-white/70 px-4 py-3 text-xs text-amber-900">
                <p className="font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Key Values
                </p>
                <div className="mt-3 grid gap-2 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">30°</span>
                    <span>sin = 1/2 ≈ 0.50</span>
                    <span>cos = √3/2 ≈ 0.87</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">45°</span>
                    <span>sin = √2/2 ≈ 0.71</span>
                    <span>cos = √2/2 ≈ 0.71</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">60°</span>
                    <span>sin = √3/2 ≈ 0.87</span>
                    <span>cos = 1/2 ≈ 0.50</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-[28px] border border-amber-200 bg-white/80 p-3 shadow-[0_18px_40px_-32px_rgba(120,60,20,0.6)]">
            <div
              className={`relative w-full rounded-[22px] bg-white ${
                activeTab === "graph"
                  ? "h-[45vh] min-h-[280px]"
                  : "aspect-square max-h-[60vh] md:max-w-[520px] md:mx-auto"
              }`}
            >
              <div ref={graphRef} className="desmos-graph h-full w-full" />
              {activeTab !== "graph" ? (
                <svg
                  className="pointer-events-none absolute inset-0"
                  viewBox="-1.6 -1.6 3.2 3.2"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <polygon
                    points={`0,0 ${cosValue},0 ${cosValue},${-sinValue}`}
                    fill="rgba(224,121,43,0.12)"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2={cosValue}
                    y2={-sinValue}
                    stroke="#e0792b"
                    strokeWidth="0.04"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2={cosValue}
                    y2="0"
                    stroke="#e0792b"
                    strokeWidth="0.04"
                  />
                  <line
                    x1={cosValue}
                    y1="0"
                    x2={cosValue}
                    y2={-sinValue}
                    stroke="#e0792b"
                    strokeWidth="0.04"
                  />
                </svg>
              ) : null}
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
                <span>θ (theta)</span>
                <span>{thetaDisplay}</span>
              </div>
              <input
                className="h-2 w-full accent-amber-700"
                type="range"
                min={0}
                max={angleMode === "degrees" ? 360 : TWO_PI}
                step={angleMode === "degrees" ? 1 : 0.01}
                value={sliderValue}
                onChange={(event) =>
                  handleSliderChange(Number(event.target.value))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`h-11 rounded-full text-sm font-semibold ${
                  angleMode === "degrees"
                    ? "bg-amber-950 text-amber-50"
                    : "border border-amber-200 bg-white text-amber-900"
                }`}
                onClick={() => setAngleMode("degrees")}
              >
                Degrees
              </button>
              <button
                type="button"
                className={`h-11 rounded-full text-sm font-semibold ${
                  angleMode === "radians"
                    ? "bg-amber-950 text-amber-50"
                    : "border border-amber-200 bg-white text-amber-900"
                }`}
                onClick={() => setAngleMode("radians")}
              >
                Radians
              </button>
            </div>

            <div className="grid gap-2">
              {anglePresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="h-11 rounded-full border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-900"
                  onClick={() => setThetaRadians(preset.radians)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="h-12 rounded-full border border-amber-200 bg-amber-950 text-base font-semibold text-amber-50"
              onClick={handleResetActivity}
            >
              Reset Activity
            </button>
          </div>
        </aside>
      </div>
    </PlaygroundShell>
  );
}
