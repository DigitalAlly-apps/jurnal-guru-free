import { Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { JurnalGuruLogo } from '@/components/JurnalGuruLogo';
import type { TabId } from '@/types';

const TAB_TITLES: Record<TabId, string> = {
  home: 'Beranda',
  absen: 'Absensi',
  kasus: 'Kasus',
  laporan: 'Laporan',
  catatan: 'Catatan',
  siswa: 'Profil Siswa',
  setelan: 'Setelan',
};

export function AppHeader() {
  const { activeTab, kelasList, activeKelas, setActiveKelas } = useApp();
  const isHome = activeTab === 'home';

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-surface border-b border-border sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-text-secondary hover:text-foreground transition-colors">
          <Menu className="w-5 h-5" />
        </SidebarTrigger>

        {/* On home screen show compact logo; on other tabs show page title */}
        {isHome ? (
          <JurnalGuruLogo size={36} showText={false} className="md:hidden" />
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-tight">{TAB_TITLES[activeTab]}</h2>
            <p className="text-[11px] text-text-tertiary">Kelas {kelasList.find(k => k.id === activeKelas)?.name}</p>
          </div>
        )}

        {/* Always show title on desktop */}
        <div className="hidden md:block">
          <h2 className="text-sm font-semibold text-foreground leading-tight">{TAB_TITLES[activeTab]}</h2>
          <p className="text-[11px] text-text-tertiary">Kelas {kelasList.find(k => k.id === activeKelas)?.name}</p>
        </div>
      </div>

      <select
        value={activeKelas}
        onChange={e => setActiveKelas(e.target.value)}
        className="px-3 py-1.5 bg-bg-2 border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-primary transition-colors md:hidden"
      >
        {kelasList.map(k => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>
    </header>
  );
}
