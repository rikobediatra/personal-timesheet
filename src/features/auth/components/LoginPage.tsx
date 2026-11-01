"use client";

import { useActionState, useState } from "react";
import {
  AppFooter,
  AppHeader,
  Button,
  Icon,
  TextField,
} from "@/shared/components";
import { loginAction, type LoginState } from "../actions/login";

const initialState: LoginState = {};

export function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background font-body-md text-on-surface antialiased">
      <AppHeader activeNav="sign-in" />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-margin-sm pt-16 lg:px-margin-lg">
        <div className="flex w-full flex-col items-center justify-center px-margin-sm py-space-xl">
          <div className="relative flex w-full max-w-115 flex-col items-center">
            <div className="pointer-events-none absolute -top-12 -left-12 -z-10 h-64 w-64 rounded-full bg-secondary-fixed/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 -z-10 h-72 w-72 rounded-full bg-surface-container-highest/60 blur-3xl" />

            <div className="relative flex w-full flex-col rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl">
              <div className="mb-space-lg text-left">
                <h1 className="mb-space-xs font-headline-xl text-headline-xl font-medium tracking-tight text-primary">
                  Sign In to Daily Timesheet
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Access your Daily Timesheet work suite, task tracking, and work
                  logs.
                </p>
              </div>

              <form className="flex flex-col gap-space-md" action={formAction}>
                <TextField
                  label="Work Email"
                  name="email"
                  leadingIcon="alternate_email"
                  autoComplete="username"
                  placeholder="work.email@company.com"
                  required
                  disabled={isPending}
                />

                <TextField
                  label="Password"
                  name="password"
                  leadingIcon="key"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  disabled={isPending}
                  trailing={
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      className="flex items-center justify-center rounded p-1 text-outline transition-colors hover:text-primary"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      <Icon
                        name={showPassword ? "visibility_off" : "visibility"}
                        className="text-[18px]"
                      />
                    </button>
                  }
                />

                {state.error ? (
                  <p
                    className="rounded bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
                    role="alert"
                  >
                    {state.error}
                  </p>
                ) : null}

                <div className="pt-space-sm">
                  <Button
                    type="submit"
                    trailingIcon="arrow_forward"
                    loading={isPending}
                    loadingLabel="Verifying Credentials..."
                  >
                    Sign In to Workspace
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
