import Link from "next/link";
import { Icon } from "./Icon";

type AppHeaderProps = {
  activeNav?: "sign-in";
};

export function AppHeader({ activeNav = "sign-in" }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between px-margin-sm lg:px-margin-lg">
        <div className="flex items-center gap-space-lg">
          <Link href="/login" className="flex items-center gap-space-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <Icon
                name="schedule"
                className="select-none text-[18px] text-on-primary"
              />
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-md text-headline-md tracking-tight text-primary">
                Daily
              </span>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Timesheet
              </span>
            </div>
          </Link>
        </div>
        <nav className="flex items-center gap-space-lg">
          <Link
            href="/login"
            aria-current={activeNav === "sign-in" ? "page" : undefined}
            className="font-label-md text-label-md font-semibold text-primary transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
