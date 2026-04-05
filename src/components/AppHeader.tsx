import { useState, useEffect } from 'react';
import { Moon, Sun, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { JurnalGuruLogo } from '@/components/JurnalGuruLogo';
import type { TabId } from '@/types';

const TAB_TITLES: Record<TabId, string> = {
  home:      'Beranda',
  absen:     'Absensi',
  kasus:     'Kasus',
  jadwal:    'Jadwal',
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

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const backupOk = (() => {
    if (!lastBackupDate) return false;
    return (Date.now() - new Date(lastBackupDate).getTime()) / 86400000 <= 7;
  })();

  const tanggal = `${HARI[now.getDay()]}, ${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })}`;
  const firstName = namaGuru ? namaGuru.split(' ')[0] : null;

  return (
    <header className="header-rich">
      {/* Left */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="icon-btn-rich w-8 h-8 rounded-lg">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M1.5 3h12M1.5 7.5h12M1.5 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </SidebarTrigger>

        {isHome ? (
          <JurnalGuruLogo size={30} showText={false} className="md:hidden" />
        ) : (
          <div className="md:hidden">
            <h2 className="text-[13px] font-semibold text-foreground leading-tight">{TAB_TITLES[activeTab]}</h2>
            {kelasName && <p className="text-[11px] text-text-tertiary">{kelasName}</p>}
          </div>
        )}

        <div className="hidden md:block">
          <h2 className="text-[13px] font-semibold text-foreground leading-tight">{TAB_TITLES[activeTab]}</h2>
          {kelasName && <p className="text-[11px] text-text-tertiary">{kelasName}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">

        {/* Kelas selector — mobile */}
        {kelasList.length > 1 && (
          <select
            value={activeKelas}
            onChange={e => setActiveKelas(e.target.value)}
            className="input-soft px-2 py-1.5 text-xs w-auto max-w-[120px] md:hidden"
          >
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        )}

        {/* Date + greeting */}
        <div className="hidden sm:flex flex-col items-end gap-0 mr-1">
          {firstName && (
            <span className="text-[12px] font-semibold text-foreground leading-tight">
              {firstName}
            </span>
          )}
          <span className="text-[11px] text-text-tertiary leading-tight font-mono-rich">{tanggal}</span>
        </div>

        {/* Backup indicator */}
        <button
          title={backupOk ? `Backup: ${lastBackupDate}` : 'Belum backup minggu ini'}
          className={`icon-btn-rich ${
            backupOk
              ? 'text-semantic-green hover:bg-semantic-green-light'
              : 'text-semantic-red hover:bg-semantic-red-light'
          }`}
        >
          {backupOk
            ? <ShieldCheck className="w-3.5 h-3.5" />
            : <ShieldAlert className="w-3.5 h-3.5" />
          }
        </button>

        {/* Theme toggle */}
        <button onClick={toggleDark} className="icon-btn-rich" title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
          {isDark
            ? <Sun className="w-3.5 h-3.5" />
            : <Moon className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </header>
  );
}
