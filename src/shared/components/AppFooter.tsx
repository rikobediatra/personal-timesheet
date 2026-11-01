const footerLinks = [
  { label: "Security & Compliance", href: "#" },
  { label: "Privacy Notice", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Audit Reports", href: "#" },
] as const;

export function AppFooter() {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="flex w-full flex-col items-center justify-between gap-space-md px-margin-sm py-space-lg sm:flex-row lg:px-margin-lg">
        <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <span className="font-headline-sm text-headline-sm text-primary">
            Daily Timesheet
          </span>
          <span>© 2026 Daily Timesheet Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-space-lg">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
