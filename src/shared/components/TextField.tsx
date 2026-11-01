"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Icon } from "./Icon";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  leadingIcon?: string;
  trailing?: ReactNode;
  labelAction?: ReactNode;
  error?: string;
};

export function TextField({
  label,
  leadingIcon,
  trailing,
  labelAction,
  error,
  id,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [iconFocused, setIconFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          className="font-label-md text-label-md font-semibold text-primary"
          htmlFor={inputId}
        >
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative flex items-center">
        {leadingIcon ? (
          <Icon
            name={leadingIcon}
            className={`pointer-events-none absolute left-3 text-[18px] transition-colors duration-150 ${
              iconFocused ? "text-secondary" : "text-outline"
            }`}
          />
        ) : null}
        <input
          id={inputId}
          className={`h-11 w-full rounded bg-surface-container-lowest font-body-md text-body-md text-primary placeholder:text-outline-variant transition-all duration-150 focus:bg-surface-container-low focus:outline-none ${
            leadingIcon ? "pl-10" : "pl-3.5"
          } ${trailing ? "pr-11" : "pr-3.5"}`}
          onFocus={(event) => {
            setIconFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIconFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {trailing ? (
          <div className="absolute right-2.5 flex items-center justify-center">
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="font-body-sm text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
