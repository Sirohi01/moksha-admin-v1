export default function AdminFooter() {
  return (
    <footer className="shrink-0 border-t border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 text-center text-[11px] font-medium text-slate-600">
      &copy; {new Date().getFullYear()} <span className="font-bold text-slate-900">Namo Gange Trust</span> — Free Cremation
      Assistance. Admin Panel. All rights reserved.
    </footer>
  );
}
