"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pixel-art graduation cap rendered as crisp SVG squares (image-rendering:
 * pixelated). Compact 14×14 grid on a 0..14 viewBox so it scales cleanly.
 * On-theme for CampusFlow's Pixelscape identity.
 */
export function PixelLogo({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      shapeRendering="crispEdges"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      {/* Cap board (diamond, seen from front-below) */}
      <g fill="currentColor">
        {/* top diamond */}
        <rect x="6" y="2" width="2" height="1" />
        <rect x="5" y="3" width="1" height="1" />
        <rect x="6" y="3" width="2" height="1" />
        <rect x="8" y="3" width="1" height="1" />
        <rect x="3" y="4" width="1" height="1" />
        <rect x="4" y="4" width="1" height="1" />
        <rect x="5" y="4" width="4" height="1" />
        <rect x="9" y="4" width="1" height="1" />
        <rect x="10" y="4" width="1" height="1" />
        <rect x="1" y="5" width="2" height="1" />
        <rect x="3" y="5" width="8" height="1" />
        <rect x="11" y="5" width="2" height="1" />
        <rect x="0" y="6" width="2" height="1" />
        <rect x="2" y="6" width="10" height="1" />
        <rect x="12" y="6" width="2" height="1" />
      </g>
      {/* Cap base / head underneath */}
      <g fill="color-mix(in oklch, currentColor 65%, transparent)">
        <rect x="4" y="7" width="6" height="1" />
        <rect x="3" y="8" width="8" height="1" />
        <rect x="4" y="9" width="6" height="1" />
        <rect x="5" y="10" width="4" height="1" />
      </g>
      {/* Tassel */}
      <g fill="var(--accent, currentColor)">
        <rect x="11" y="4" width="1" height="1" />
        <rect x="11" y="5" width="1" height="3" />
        <rect x="10" y="8" width="3" height="2" />
        <rect x="11" y="10" width="1" height="1" />
      </g>
    </svg>
  );
}
