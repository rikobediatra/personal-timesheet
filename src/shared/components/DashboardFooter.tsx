export function DashboardFooter() {
  return (
    <footer className="w-full border-t border-outline-variant/30 bg-surface-container-lowest py-space-md">
      <div className="flex w-full flex-col items-center justify-between gap-space-sm px-gutter-lg font-label-md text-label-md text-on-surface-variant sm:flex-row">
        <div>© 2024 Daily Timesheet. Enterprise Timesheet & Task Systems.</div>
        <div className="flex items-center gap-space-lg">
          <a className="transition-colors hover:text-primary" href="#">
            Security Policy
          </a>
          <a className="transition-colors hover:text-primary" href="#">
            Audit Logs
          </a>
          <a className="transition-colors hover:text-primary" href="#">
            Support Desk
          </a>
        </div>
      </div>
    </footer>
  );
}
