import type { CSSProperties } from "react";

export type BrandIconName =
  | "heart-pulse"
  | "stethoscope"
  | "user-medical"
  | "shield-check"
  | "passport"
  | "siren"
  | "home"
  | "lock"
  | "check-circle"
  | "arrow-right"
  | "refresh"
  | "alert-triangle"
  | "info"
  | "user"
  | "eye"
  | "eye-off";

export function BrandIcon({ name, size = 24, className = "" }: {
  name: BrandIconName;
  size?: number;
  className?: string;
}) {
  const iconStyle = {
    "--icon-size": `${size}px`,
    "--icon-mask": `url("/icons/svg/${name}.svg")`,
  } as CSSProperties;

  return <span aria-hidden="true" className={`brand-icon ${className}`.trim()} style={iconStyle} />;
}
