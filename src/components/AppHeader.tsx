export function AppHeader({ title }: { title: string }) {
  return (
    <header className="h-[52px] flex items-center justify-between px-[16px] bg-surface border-b border-border sticky top-0 z-50">
      <span className="text-[14px] font-semibold text-foreground">{title}</span>
      <span className="text-[12px] text-text-tertiary">Jurnal Guru Pro</span>
    </header>
  );
}
