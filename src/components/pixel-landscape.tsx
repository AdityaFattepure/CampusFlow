"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * PixelLandscape — an infinite, seamless parallax pixel-art scene for the
 * dashboard hero. Theme-aware:
 *   - Day (light mode): dawn sky, bobbing pixel sun, drifting clouds, green
 *     mountains.
 *   - Night (dark mode): deep navy→black sky, a pixel moon, twinkling stars,
 *     dark mountain silhouettes. No clouds.
 *
 * All CSS/SVG — no video file, loops perfectly, respects prefers-reduced-motion.
 */

/** One tileable pixel-mountain ridge as an SVG path (viewBox 0 0 240 120). */
function MountainTile({
  className,
  fill,
  shape,
}: {
  className?: string;
  fill: string;
  shape: "far" | "mid" | "near";
}) {
  const paths: Record<typeof shape, string> = {
    far: "M0,120 L0,90 L16,90 L16,78 L32,78 L32,86 L48,86 L48,64 L64,64 L64,72 L80,72 L80,58 L96,58 L96,68 L112,68 L112,52 L128,52 L128,62 L144,62 L144,74 L160,74 L160,60 L176,60 L176,80 L192,80 L192,70 L208,70 L208,84 L224,84 L224,76 L240,76 L240,120 Z",
    mid: "M0,120 L0,96 L14,96 L14,72 L28,72 L28,84 L42,84 L42,56 L56,56 L56,70 L70,70 L70,46 L84,46 L84,62 L98,62 L98,40 L112,40 L112,58 L126,58 L126,72 L140,72 L140,50 L154,50 L154,66 L168,66 L168,80 L182,80 L182,60 L196,60 L196,78 L210,78 L210,66 L224,66 L224,84 L240,84 L240,120 Z",
    near: "M0,120 L0,104 L12,104 L12,82 L24,82 L24,92 L36,92 L36,60 L48,60 L48,76 L60,76 L60,50 L72,50 L72,66 L84,66 L84,44 L96,44 L96,62 L108,62 L108,74 L120,74 L120,54 L132,54 L132,72 L144,72 L144,86 L156,86 L156,64 L168,64 L168,80 L180,80 L180,70 L192,70 L192,88 L204,88 L204,76 L216,76 L216,94 L228,94 L228,86 L240,86 L240,120 Z",
  };
  return (
    <svg
      className={cn("h-full w-auto", className)}
      viewBox="0 0 240 120"
      preserveAspectRatio="xMidYEnd meet"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d={paths[shape]} fill={fill} />
    </svg>
  );
}

/** A single pixel-cloud shape (day only). */
function Cloud({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={cn("h-6 w-12", className)}
      shapeRendering="crispEdges"
      aria-hidden
    >
      <g fill="currentColor">
        <rect x="8" y="4" width="32" height="6" />
        <rect x="12" y="2" width="8" height="2" />
        <rect x="24" y="0" width="10" height="6" />
        <rect x="4" y="6" width="40" height="4" />
      </g>
    </svg>
  );
}

function CloudRow() {
  return (
    <div className="absolute inset-x-0 top-6 overflow-hidden">
      <div
        className="px-cloud flex gap-24 text-background/70"
        style={{ animationDuration: "80s", width: "200%" }}
      >
        <div className="flex w-1/2 justify-between px-8">
          <Cloud />
          <Cloud className="opacity-70" />
          <Cloud />
        </div>
        <div className="flex w-1/2 justify-between px-8" aria-hidden>
          <Cloud />
          <Cloud className="opacity-70" />
          <Cloud />
        </div>
      </div>
    </div>
  );
}

/** Twinkling pixel stars (night only). Fixed scatter + a slow twinkle. */
function Stars() {
  // deterministic scatter so it doesn't reshuffle per render
  const stars = [
    { x: 6, y: 14, d: 0 },
    { x: 18, y: 8, d: 0.4 },
    { x: 28, y: 18, d: 0.8 },
    { x: 40, y: 6, d: 1.2 },
    { x: 52, y: 20, d: 1.6 },
    { x: 64, y: 10, d: 2.0 },
    { x: 74, y: 16, d: 2.4 },
    { x: 86, y: 6, d: 2.8 },
    { x: 12, y: 24, d: 3.2 },
    { x: 46, y: 24, d: 3.6 },
    { x: 68, y: 26, d: 4.0 },
    { x: 92, y: 22, d: 4.4 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="px-twinkle absolute h-1 w-1 bg-foreground"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.d}s`,
          }}
        />
      ))}
    </div>
  );
}

function ScrollLayer({
  className,
  duration,
  children,
}: {
  className?: string;
  duration: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 overflow-hidden">
      <div
        className={cn("px-scroll-x flex", className)}
        style={{ animationDuration: duration, width: "200%" }}
      >
        <div className="flex h-full w-1/2">{children}</div>
        <div className="flex h-full w-1/2" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

export function PixelLandscape({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const night = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={
          night
            ? {
                // Night sky: deep navy → black, banded for pixel feel.
                background:
                  "linear-gradient(to bottom, oklch(0.16 0.03 265) 0 38%, oklch(0.12 0.02 265) 38% 68%, oklch(0.1 0.01 260) 68% 100%)",
              }
            : {
                // Dawn sky (day).
                background:
                  "linear-gradient(to bottom, var(--accent) 0 36%, var(--primary) 36% 64%, var(--chart-4) 64% 100%)",
              }
        }
      />

      {/* Celestial body: moon at night, sun by day. */}
      <div className="px-sun-bob absolute right-8 top-5">
        {night ? (
          // Pixel moon: outer disc + a crescent shadow cut from the right.
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 border-2 border-[var(--pixel-line)] bg-[oklch(0.9_0.01_250)]" />
            {/* crescent shadow overlapping the right side */}
            <div className="absolute -right-2 top-1 h-11 w-11 border-2 border-transparent bg-[oklch(0.14_0.02_265)]" style={{ clipPath: "inset(0 0 0 30%)" }} />
            {/* a couple of pixel craters */}
            <div className="absolute left-2 top-3 h-1.5 w-1.5 bg-[oklch(0.6_0.01_250)]" />
            <div className="absolute left-4 top-6 h-1 w-1 bg-[oklch(0.6_0.01_250)]" />
          </div>
        ) : (
          // Pixel sun.
          <div className="relative h-12 w-12 border-2 border-[var(--pixel-line)] bg-background">
            <div className="absolute right-1.5 top-1.5 h-6 w-6 border-2 border-[var(--pixel-line)] bg-accent" />
          </div>
        )}
      </div>

      {/* Dither transition bands + horizon */}
      <div className="pixel-dither absolute inset-x-0 top-[34%] h-2 opacity-70" />
      <div className="pixel-dither absolute inset-x-0 top-[60%] h-2 opacity-70" />
      <div className="absolute inset-x-0 top-[64%] h-[2px] bg-[var(--pixel-line)]" />

      {/* Stars (night) or clouds (day) */}
      {night ? <Stars /> : <CloudRow />}

      {/* Parallax mountain layers. At night these render as dark silhouettes. */}
      <ScrollLayer className="h-[34%]" duration="60s">
        {Array.from({ length: 4 }).map((_, i) => (
          <MountainTile
            key={i}
            shape="far"
            fill={
              night
                ? "oklch(0.2 0.02 262)"
                : "color-mix(in oklch, var(--primary) 55%, var(--background))"
            }
            className="h-full flex-1"
          />
        ))}
      </ScrollLayer>
      <ScrollLayer className="h-[28%]" duration="36s">
        {Array.from({ length: 4 }).map((_, i) => (
          <MountainTile
            key={i}
            shape="mid"
            fill={
              night
                ? "oklch(0.15 0.015 262)"
                : "color-mix(in oklch, var(--primary) 80%, var(--foreground) 8%)"
            }
            className="h-full flex-1"
          />
        ))}
      </ScrollLayer>
      <ScrollLayer className="h-[22%]" duration="20s">
        {Array.from({ length: 4 }).map((_, i) => (
          <MountainTile
            key={i}
            shape="near"
            fill={
              night
                ? "oklch(0.1 0.008 262)"
                : "color-mix(in oklch, var(--foreground) 32%, var(--primary) 60%)"
            }
            className="h-full flex-1"
          />
        ))}
      </ScrollLayer>

      {/* Ground strip */}
      <div className="pixel-dither absolute inset-x-0 bottom-0 h-7" />
    </div>
  );
}
