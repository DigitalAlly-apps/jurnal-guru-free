import { BarChart3, ClipboardCheck, LayoutDashboard, NotebookPen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TabId } from '@/types';

const items: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'home', label: 'Beranda', icon: LayoutDashboard },
  { id: 'absen', label: 'Absen', icon: ClipboardCheck },
  { id: 'jurnal', label: 'Jurnal', icon: NotebookPen },
  { id: 'laporan', label: 'Buku Induk', icon: BarChart3 },
];

export function MobileBottomNav() {
  const { activeTab, setActiveTab, setActiveStudentId } = useApp();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none lg:hidden">
      <nav className="glass-panel-jurnal mx-auto flex min-h-[72px] max-w-[372px] items-center justify-between rounded-3xl px-2.5 pointer-events-auto overflow-hidden relative">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => { setActiveStudentId(null); setActiveTab(id); }} className={`relative flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-bold transition-all ${active ? 'text-primary-foreground' : 'text-text-tertiary hover:text-foreground'}`}>
              {active && <span className="absolute inset-1 rounded-2xl bg-gradient-to-br from-primary to-blue shadow-accent" />}
              <Icon className={`relative z-10 h-5 w-5 ${active ? 'scale-110' : 'opacity-75'}`} strokeWidth={active ? 2.7 : 2.2} />
              <span className="relative z-10 whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
