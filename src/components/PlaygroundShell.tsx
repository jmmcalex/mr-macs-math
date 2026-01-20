"use client";

// PlaygroundShell is the shared scaffold for all playground pages.
// It standardizes layout, readout placement, and control affordances so
// each playground stays guardrailed and mobile-first.

import { useState } from "react";

type PlaygroundShellProps = {
  title: string;
  prompt: string;
  children?: React.ReactNode;
  drawerContent?: React.ReactNode;
  topNav?: React.ReactNode;
  onResetActivity?: () => void;
  onResetView?: () => void;
  mainVariant?: "framed" | "plain";
  drawerSpacing?: "default" | "tight";
  showActionBar?: boolean;
  drawerDefaultOpen?: boolean;
  mainGrow?: boolean;
  drawerMaxHeight?: string;
  drawerCollapsible?: boolean;
  showDrawer?: boolean;
};

export default function PlaygroundShell({
  title,
  prompt,
  children,
  drawerContent,
  topNav,
  onResetActivity,
  onResetView,
  mainVariant = "framed",
  drawerSpacing = "default",
  showActionBar = true,
  drawerDefaultOpen = true,
  mainGrow = true,
  drawerMaxHeight = "45vh",
  drawerCollapsible = true,
  showDrawer = true,
}: PlaygroundShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(drawerDefaultOpen);

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-8 pt-8">
      <header className="space-y-3">
        {topNav}
        <p className="font-display text-xs uppercase tracking-[0.2em] text-amber-700">
          Playground
        </p>
        <h1 className="font-display text-3xl text-amber-950">{title}</h1>
        <p className="text-base text-amber-900/80">{prompt}</p>
      </header>

      <main className={`mt-8 ${mainGrow ? "flex-1" : "flex-none"}`}>
        {mainVariant === "plain" ? (
          children
        ) : (
          <div className="min-h-[260px] rounded-[28px] border border-dashed border-amber-300/80 bg-amber-50/60 p-6 text-sm text-amber-900/70">
            {children ?? "Interactive content will live here."}
          </div>
        )}
      </main>

      {showDrawer ? (
        <section className={drawerSpacing === "tight" ? "mt-5" : "mt-8"}>
          <div className="rounded-[26px] border border-amber-200 bg-white/80 shadow-[0_18px_40px_-32px_rgba(120,60,20,0.6)]">
            {drawerCollapsible ? (
              <details
                open={drawerOpen}
                onToggle={(event) =>
                  setDrawerOpen(
                    (event.currentTarget as HTMLDetailsElement).open
                  )
                }
                className="group"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-base font-semibold text-amber-950">
                  <span>Control Drawer</span>
                  <span className="text-sm font-medium text-amber-700 transition group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <div
                  className="overflow-auto border-t border-amber-100 px-5 pb-5 pt-4"
                  style={{ maxHeight: drawerMaxHeight }}
                >
                  {drawerContent ?? (
                    <div className="grid gap-3">
                      <button className="h-12 rounded-full border border-amber-200 bg-amber-50 text-base font-semibold text-amber-900">
                        Primary Control
                      </button>
                      <button className="h-12 rounded-full border border-amber-200 bg-white text-base font-semibold text-amber-900">
                        Secondary Control
                      </button>
                    </div>
                  )}
                </div>
              </details>
            ) : (
              <div>
                <div className="px-5 pt-4 text-base font-semibold text-amber-950">
                  Control Panel
                </div>
                <div
                  className="overflow-auto border-t border-amber-100 px-5 pb-5 pt-4"
                  style={{ maxHeight: drawerMaxHeight }}
                >
                  {drawerContent ?? (
                    <div className="grid gap-3">
                      <button className="h-12 rounded-full border border-amber-200 bg-amber-50 text-base font-semibold text-amber-900">
                        Primary Control
                      </button>
                      <button className="h-12 rounded-full border border-amber-200 bg-white text-base font-semibold text-amber-900">
                        Secondary Control
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {showActionBar ? (
        <div className="sticky bottom-0 z-20 mt-6">
          <div className="safe-area-bottom flex gap-3 rounded-full border border-amber-200 bg-amber-950 px-4 py-3 text-amber-50 shadow-lg">
            <button
              type="button"
              onClick={onResetActivity}
              className="flex-1 rounded-full border border-amber-200/30 px-4 py-2 text-sm font-semibold"
            >
              Reset Activity
            </button>
            <button
              type="button"
              onClick={onResetView}
              className="flex-1 rounded-full border border-amber-200/30 px-4 py-2 text-sm font-semibold"
            >
              Reset View
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
