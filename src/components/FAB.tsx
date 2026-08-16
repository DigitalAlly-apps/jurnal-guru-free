import { useState } from 'react';
import { BarChart3, ClipboardCheck, FilePenLine, Plus, Users, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TabId } from '@/types';

type Action = { tab: TabId; label: string; detail: string; icon: typeof Plus };

const actionsByTab: Partial<Record<TabId, Action[]>> = {
  home: [{ tab: 'absen', label: 'Catat absensi', detail: 'Buka absensi kelas aktif', icon: ClipboardCheck }, { tab: 'jurnal', label: 'Catatan jurnal', detail: 'Kasus atau perkembangan siswa', icon: FilePenLine }],
  absen: [{ tab: 'absen', label: 'Lanjut absensi', detail: 'Tandai kehadiran siswa', icon: ClipboardCheck }],
  jurnal: [{ tab: 'jurnal', label: 'Catat jurnal', detail: 'Kasus atau catatan siswa', icon: FilePenLine }],
  siswa: [{ tab: 'siswa', label: 'Kelola siswa', detail: 'Tambah kelas atau siswa', icon: Users }],
  laporan: [{ tab: 'laporan', label: 'Buka rekap', detail: 'Pantauan dan laporan kelas', icon: BarChart3 }],
};

export function FAB() {
  const [open, setOpen] = useState(false);
  const { activeTab, setActiveTab, setActiveStudentId } = useApp();
  const actions = actionsByTab[activeTab] ?? [];
  if (!actions.length || activeTab === 'setelan' || activeTab === 'auth') return null;

  return <div className="fixed bottom-[calc(94px+env(safe-area-inset-bottom))] right-5 z-50 lg:bottom-7 lg:right-7">
    {open && <button aria-label="Tutup aksi cepat" onClick={() => setOpen(false)} className="fixed inset-0 -z-10 bg-black/15 backdrop-blur-[1px]" />}
    {open && <div className="glass-panel-jurnal absolute bottom-16 right-0 w-64 rounded-3xl p-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Aksi cepat</div>
      {actions.map(({ tab, label, detail, icon: Icon }) => <button key={label} onClick={() => { setActiveStudentId(null); setActiveTab(tab); setOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-accent-light/70">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        <span><span className="block text-[12px] font-bold text-foreground">{label}</span><span className="block text-[10px] text-text-tertiary">{detail}</span></span>
      </button>)}
    </div>}
    <button onClick={() => setOpen(value => !value)} aria-label="Aksi cepat" className={`grid h-14 w-14 place-items-center rounded-2xl border border-primary/25 text-primary-foreground shadow-accent transition-all ${open ? 'rotate-45 bg-surface text-primary' : 'bg-gradient-to-br from-primary to-blue hover:scale-105'}`}>
      {open ? <X className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
    </button>
  </div>;
}
