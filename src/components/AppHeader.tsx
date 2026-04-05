import { useState, useEffect } from 'react';
import { Menu, Moon, Sun, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { JurnalGuruLogo } from '@/components/JurnalGuruLogo';
import type { TabId } from '@/types';

const TAB_TITLES: Record<TabId, string> = {
  home:      'Beranda',
  absen:     'Absensi',
  kasus:     'Input Kasus',
  jadwal:    'Jadwal Pelajaran',
  riwayat:   'Riwayat',
  laporan:   'Laporan',
  siswa:     'Data Siswa',
  informasi: 'Informasi',
  setelan:   'Setelan',
};

const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function AppHeader() {
  const { activeTab, kelasList, activeKelas, setActiveKelas, namaGuru, lastBackupDate } = useApp();
  const isHome = activeTab === 'home';
  const kelasName = kelasList.find(k => k.id === activeKelas)?.name;
  const now = useNow();

  // Dark mode
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // Backup status
  const backupOk = (() => {
    if (!lastBackupDate) return false;
    const diff = (Date.now() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  })();

  const tanggal = `${HARI[now.getDay()]}, ${now.getDate()} ${now.toLocaleString('id-ID', { month: 'long' })}`;
  const firstName = namaGuru ? namaGuru.split(' ')[0] : null;

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-surface border-b border-border sticky top-0 z-40">
      {/* Kiri: hamburger + judul */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-text-secondary hover:text-foreground transition-colors">
          <Menu className="w-5 h-5" />
        </SidebarTrigger>
        {isHome ? (
          <JurnalGuruLogo size={36} showText={false} className="md:hidden" />
        ) : (
          <div className="md:hidden">
            <h2 className="text-sm font-semibold text-foreground leading-tight">{TAB_TITLES[activeTab]}</h2>
            {kelasName && <p className="text-[11px] text-text-tertiary">Kelas {kelasName}</p>}
          </div>
        )}
        <div className="hidden md:block">
          <h2 className="text-sm font-semibold text-foreground leading-tight">{TAB_TITLES[activeTab]}</h2>
          {kelasName && <p className="text-[11px] text-text-tertiary">Kelas {kelasName}</p>}
        </div>
      </div>

      {/* Kanan: info + aksi */}
      <div className="flex items-center gap-1.5">

        {/* Kelas selector (mobile, jika >1 kelas) */}
        {kelasList.length > 1 && (
          <select value={activeKelas} onChange={e => setActiveKelas(e.target.value)}
            className="px-2 py-1 bg-bg-2 border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:border-primary transition-colors md:hidden mr-1">
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        )}

        {/* Tanggal — hidden di mobile kecil */}
        <div className="hidden sm:flex flex-col items-end mr-1">
          {firstName && (
            <span className="text-[11px] font-semibold text-foreground leading-tight">
              Halo, {firstName} 👋
            </span>
          )}
          <span className="text-[11px] text-text-tertiary leading-tight">{tanggal}</span>
        </div>

        {/* Backup indicator */}
        <button
          title={backupOk ? `Backup terakhir: ${lastBackupDate}` : 'Belum backup minggu ini!'}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            backupOk
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'
          }`}
        >
          {backupOk
            ? <ShieldCheck className="w-4 h-4" />
            : <ShieldAlert className="w-4 h-4" />
          }
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          className="w-8 h-8 rounded-xl bg-bg-2 flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-border transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
