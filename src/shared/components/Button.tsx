import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  trailingIcon?: string;
  children: ReactNode;
};

export function Button({
  loading = false,
  loadingLabel = "Loading...",
  trailingIcon,
  children,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`group flex h-11 w-full cursor-pointer items-center justify-center gap-space-sm rounded bg-primary font-label-lg text-label-lg text-on-primary shadow-md transition-all duration-150 hover:bg-primary-container active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-90 ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
          <span className="font-label-lg text-label-lg">{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {trailingIcon ? (
            <Icon
              name={trailingIcon}
              className="text-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
            />
          ) : null}
        </>
      )}
    </button>
  );
}
