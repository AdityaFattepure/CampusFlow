"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PixelLandscape — an infinite, seamless parallax pixel-art scene for the
 * dashboard hero: a dawn sky, a bobbing pixel sun, drifting clouds, and
 * three scrolling mountain layers (far / mid / near) plus a dithered ground
 * strip. All CSS/SVG — no video file, loops perfectly, respects
 * prefers-reduced-motion.
 *
 * Layered as doubled rows translated 0 -> -50% for a gap-free loop.
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
  // Each ridge is a stepped (pixelated) silhouette using crispEdges.
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

/** A row of repeated mountain tiles wide enough to scroll -50% seamlessly. */
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

/** A single pixel-cloud shape. */
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

export function PixelLandscape({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {/* Sky: banded dawn gradient (amber -> sage -> teal) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--accent) 0 36%, var(--primary) 36% 64%, var(--chart-4) 64% 100%)",
        }}
      />

      {/* Pixel sun (square + inner block), gently bobbing */}
      <div className="px-sun-bob absolute right-8 top-5">
        <div className="relative h-12 w-12 border-2 border-[var(--pixel-line)] bg-background">
          <div className="absolute right-1.5 top-1.5 h-6 w-6 border-2 border-[var(--pixel-line)] bg-accent" />
        </div>
      </div>

      {/* Dither transition bands at the color steps */}
      <div className="pixel-dither absolute inset-x-0 top-[34%] h-2 opacity-70" />
      <div className="pixel-dither absolute inset-x-0 top-[60%] h-2 opacity-70" />
      {/* Horizon line */}
      <div className="absolute inset-x-0 top-[64%] h-[2px] bg-[var(--pixel-line)]" />

      {/* Drifting clouds */}
      <CloudRow />

      {/* Parallax mountain layers (far -> near, slow -> fast) */}
      <ScrollLayer className="h-[34%]" duration="60s">
        {Array.from({ length: 4 }).map((_, i) => (
          <MountainTile
            key={i}
            shape="far"
            fill="color-mix(in oklch, var(--primary) 55%, var(--background))"
            className="h-full flex-1"
          />
        ))}
      </ScrollLayer>
      <ScrollLayer className="h-[28%]" duration="36s">
        {Array.from({ length: 4 }).map((_, i) => (
          <MountainTile
            key={i}
            shape="mid"
            fill="color-mix(in oklch, var(--primary) 80%, var(--foreground) 8%)"
            className="h-full flex-1"
          />
        ))}
      </ScrollLayer>
      <ScrollLayer className="h-[22%]" duration="20s">
        {Array.from({ length: 4 }).map((_, i) => (
          <MountainTile
            key={i}
            shape="near"
            fill="color-mix(in oklch, var(--foreground) 32%, var(--primary) 60%)"
            className="h-full flex-1"
          />
        ))}
      </ScrollLayer>

      {/* Dithered ground strip */}
      <div className="pixel-dither absolute inset-x-0 bottom-0 h-7" />
    </div>
  );
}
