"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import PlaygroundShell from "@/components/PlaygroundShell";
import TopNav from "@/components/TopNav";
import type {
  DesmosCalculator,
  DesmosGlobal,
  DesmosWindow,
} from "@/types/desmos";

const DESMOS_API_KEY = process.env.NEXT_PUBLIC_DESMOS_API_KEY ?? "";
const DESMOS_SRC = `https://www.desmos.com/api/v1.6/calculator.js?apiKey=${encodeURIComponent(
  DESMOS_API_KEY
)}`;

const DEFAULT_BOUNDS = { left: -5, right: 5, bottom: -10, top: 10 };
const DEFAULTS = { a: 1, b: 2, k: 0 };

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

const formatNumber = (value: number) => {
  const fixed = value.toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

const formatSigned = (value: number) => {
  const sign = value >= 0 ? "+" : "-";
  return `${sign} ${formatNumber(Math.abs(value))}`;
};

export default function ExponentialGrowthPlaygroundPage() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [k, setK] = useState(DEFAULTS.k);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "table">("graph");
  const graphRef = useRef<HTMLDivElement | null>(null);
  const calculatorRef = useRef<DesmosCalculator | null>(null);

  const signedK = useMemo(() => formatSigned(k), [k]);
  const formatNumberWithMax = (value: number, maxDecimals: number) => {
    const fixed = value.toFixed(maxDecimals);
    return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  };
  const bMax = useMemo(() => (b < 1 ? 1 : 3), [b]);

  const percentChange = useMemo(() => (b - 1) * 100, [b]);
  const doublingTime = useMemo(() => {
    if (b <= 1) return null;
    return Math.log(2) / Math.log(b);
  }, [b]);
  const halfLife = useMemo(() => {
    if (b >= 1) return null;
    return Math.log(0.5) / Math.log(b);
  }, [b]);

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
        if (!calculatorRef.current) {
          calculatorRef.current = Desmos.GraphingCalculator(graphRef.current, {
            expressions: false,
            keypad: false,
            settingsMenu: false,
            zoomButtons: false,
            expressionsCollapsed: true,
            lockViewport: false,
            pointsOfInterest: false,
            trace: false,
          });
          calculatorRef.current.setMathBounds(DEFAULT_BOUNDS);
          const latex = `y=${a}*${b}^{x}+${k}`;
          calculatorRef.current.setExpression({ id: "exp", latex });
        }
      })
      .catch(() => {
        if (active) {
          setGraphError("Unable to load Desmos.");
        }
      });

    return () => {
      active = false;
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!calculatorRef.current) return;
    const latex = `y=${a}*${b}^{x}+${k}`;
    calculatorRef.current.setExpression({ id: "exp", latex });
  }, [a, b, k]);

  useEffect(() => {
    if (activeTab !== "graph") return;
    calculatorRef.current?.resize();
  }, [activeTab]);

  const handleResetActivity = () => {
    setA(DEFAULTS.a);
    setB(DEFAULTS.b);
    setK(DEFAULTS.k);
  };

  const handleResetView = () => {
    if (!calculatorRef.current) return;
    calculatorRef.current.setMathBounds(DEFAULT_BOUNDS);
  };

  return (
    <PlaygroundShell
      title="Exponential Growth"
      prompt="Use the sliders to explore how each parameter shapes the exponential curve."
      mainVariant="plain"
      drawerSpacing="tight"
      showActionBar={false}
      drawerDefaultOpen
      mainGrow={false}
      drawerMaxHeight="38vh"
      drawerCollapsible={false}
      showDrawer={false}
      topNav={
        <TopNav
          backHref="/d/exp-log"
          backLabel="Exponential & Logarithmic"
          contextLabel="Exponential Growth"
        />
      }
      onResetActivity={handleResetActivity}
      onResetView={handleResetView}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] md:items-start">
        <nav className="flex gap-2 overflow-x-auto rounded-full border border-amber-200 bg-white/70 p-2 text-sm font-semibold text-amber-900 md:col-span-2">
          {[
            { id: "graph", label: "Graph" },
            { id: "table", label: "Table" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "graph" | "table")}
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
                y = a * b<sup>x</sup> + k
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <p className="font-semibold">
                y = {formatNumber(a)} * {formatNumber(b)}
                <sup>x</sup> {signedK}
              </p>
              <div className="grid gap-1 text-amber-900/80">
                <p>a = initial scale</p>
                <p>b = growth factor per +1 in x</p>
                <p>k = vertical shift</p>
              </div>
              <p>
                Percent change per +1 in x:{" "}
                <span className="font-semibold">
                  {formatNumber(percentChange)}%
                </span>
              </p>
              <p>
                Doubling time:{" "}
                <span className="font-semibold">
                  {doublingTime ? `${formatNumber(doublingTime)}` : "N/A"}
                </span>
              </p>
              <p>
                Half-life:{" "}
                <span className="font-semibold">
                  {halfLife ? `${formatNumber(halfLife)}` : "N/A"}
                </span>
              </p>
            </div>
          </section>

          <div className={activeTab === "graph" ? "block" : "hidden"}>
            <div className="rounded-[28px] border border-amber-200 bg-white/80 p-3 shadow-[0_18px_40px_-32px_rgba(120,60,20,0.6)]">
              <div
                ref={graphRef}
                className="desmos-graph h-[45vh] min-h-[280px] w-full rounded-[22px] bg-white"
              />
              {graphError ? (
                <p className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {graphError} Add `NEXT_PUBLIC_DESMOS_API_KEY` to `.env.local`.
                </p>
              ) : null}
            </div>
          </div>

          <section
            className={`rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-950 ${
              activeTab === "table" ? "block" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-amber-700">
              <h2>Table View</h2>
              <span className="font-semibold text-amber-800/80">
                x = -3..6
              </span>
            </div>
            <div className="mt-3 max-h-[360px] overflow-auto rounded-[18px] border border-amber-200 bg-white/70">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-amber-100 text-amber-900">
                  <tr>
                    <th className="px-4 py-2 font-semibold">x</th>
                    <th className="px-4 py-2 font-semibold">y</th>
                  </tr>
                </thead>
                <tbody>
                  {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((x) => {
                    const y = a * b ** x + k;
                    return (
                      <tr key={x} className="border-t border-amber-200/60">
                        <td className="px-4 py-2 font-semibold text-amber-950">
                          {x}
                        </td>
                        <td className="px-4 py-2 text-amber-900">
                          {formatNumberWithMax(y, 2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="rounded-[26px] border border-amber-200 bg-white/80 px-5 pb-5 pt-4 shadow-[0_18px_40px_-32px_rgba(120,60,20,0.6)]">
          <div className="text-base font-semibold text-amber-950">
            Control Panel
          </div>
          <div className="mt-4 grid gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                <span>a (scale)</span>
                <span>{formatNumber(a)}</span>
              </div>
              <input
                className="h-2 w-full accent-amber-700"
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={a}
                onChange={(event) => setA(Number(event.target.value))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                <span>b (growth factor)</span>
                <span>{formatNumber(b)}</span>
              </div>
              <input
                className="h-2 w-full accent-amber-700"
                type="range"
                min={0.2}
                max={bMax}
                step={0.05}
                value={b}
                onChange={(event) => setB(Number(event.target.value))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                <span>k (vertical shift)</span>
                <span>{formatNumber(k)}</span>
              </div>
              <input
                className="h-2 w-full accent-amber-700"
                type="range"
                min={-10}
                max={10}
                step={0.5}
                value={k}
                onChange={(event) => setK(Number(event.target.value))}
              />
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                className="h-12 rounded-full border border-amber-200 bg-amber-50 text-base font-semibold text-amber-900"
                onClick={() => setB(2)}
              >
                Growth (b=2)
              </button>
              <button
                type="button"
                className="h-12 rounded-full border border-amber-200 bg-white text-base font-semibold text-amber-900"
                onClick={() => setB(0.5)}
              >
                Decay (b=0.5)
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
