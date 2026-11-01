import type { HTMLAttributes } from "react";

type IconProps = HTMLAttributes<HTMLSpanElement> & {
  name: string;
  filled?: boolean;
};

export function Icon({
  name,
  filled = false,
  className = "",
  style,
  ...props
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={{
        fontVariationSettings: filled
          ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24'
          : undefined,
        ...style,
      }}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {name}
    </span>
  );
}
