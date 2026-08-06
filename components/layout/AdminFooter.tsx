export default function AdminFooter() {
  return (
    <footer className="shrink-0 border-t border-sidebar-border bg-sidebar-bg px-4 py-2 text-center text-[11px] font-medium text-sidebar-text/85">
      &copy; {new Date().getFullYear()} <span className="text-sidebar-accent">Namo Gange Trust</span> — Free Cremation
      Assistance. Admin Panel. All rights reserved.
    </footer>
  );
}
