import { ShieldCheck, ShieldAlert, Moon, Sun, Menu, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { JurnalGuruLogo } from '@/components/JurnalGuruLogo';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { InformasiPage } from '@/pages/InformasiPage';
import type { TabId } from '@/types';

const TAB_TITLES: Record<TabId, string> = {
  home:      'Beranda',
  siswa:     'Data Kelas & Siswa',
  absen:     'Absensi Harian',
  jurnal:    'Buku Jurnal Guru',
  jadwal:    'Jadwal Pelajaran',
  laporan:   'Buku Induk & Laporan',
  setelan:   'Setelan & Informasi',
};

const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

// Fix: tanggal tidak berubah selama sesi — tidak perlu interval
const today = new Date();
const tanggalStr = `${HARI[today.getDay()]}, ${today.getDate()} ${today.toLocaleString('id-ID', { month: 'short' })}`;

export function AppHeader() {
  const { activeTab, kelasList, activeKelas, setActiveKelas, namaGuru, lastBackupDate, semester } = useApp();
  const { isDark, toggle: toggleDark } = useDarkMode();
  
  const semLabel = semester.semester === 'ganjil' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)';
  const currentSchedule = semester.semester === 'ganjil' ? semester.ganjil : semester.genap;

  const isHome = activeTab === 'home';
  const kelasName = kelasList.find(k => k.id === activeKelas)?.name;

  const backupOk = (() => {
    if (!lastBackupDate) return false;
    return (Date.now() - new Date(lastBackupDate).getTime()) / 86400000 <= 7;
  })();

  const firstName = namaGuru ? namaGuru.split(' ')[0] : null;

  return (
    <header className="header-rich">
      {/* Left */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="icon-btn-rich w-auto h-9 px-2.5 rounded-xl border border-border/40 hover:bg-bg-2 flex items-center gap-1.5 transition-all active:scale-95 shadow-soft">
          <Menu className="w-4 h-4 text-text-secondary" />
          <span className="text-[12px] font-bold text-foreground pr-0.5">Menu</span>
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
            <span className="text-[12px] font-semibold text-foreground leading-tight">{firstName}</span>
          )}
          <span className="text-[11px] text-text-tertiary leading-tight font-mono-rich">{tanggalStr}</span>
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
        <button onClick={() => toggleDark()} className="icon-btn-rich" title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Info & Tutorial Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="icon-btn-rich" title="Informasi & Bantuan">
              <Info className="w-3.5 h-3.5 text-primary" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90vw] sm:max-w-md p-0 overflow-y-auto">
            <div className="p-6">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-lg font-bold">Informasi Sistem</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Semester Summary */}
                <div className="card-soft bg-accent-light/30 border-accent/20">
                  <h4 className="label-upper mb-2">Periode Aktif</h4>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-foreground">{semester.tahunAjaran}</p>
                    <p className="text-xs text-text-secondary">{semLabel}</p>
                  </div>
                  
                  {(currentSchedule.utsStart || currentSchedule.uasStart) && (
                    <div className="mt-4 pt-4 border-t border-accent/10 grid grid-cols-2 gap-3">
                      {currentSchedule.utsStart && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-text-tertiary">Mulai UTS</p>
                          <p className="text-xs font-semibold">{currentSchedule.utsStart}</p>
                        </div>
                      )}
                      {currentSchedule.uasStart && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-text-tertiary">Mulai UAS</p>
                          <p className="text-xs font-semibold">{currentSchedule.uasStart}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tutorials */}
                <div className="-mx-6">
                  <div className="px-6 py-2 bg-bg-2 border-y border-border mb-4">
                    <p className="label-upper">Tutorial & Bantuan</p>
                  </div>
                  <InformasiPage />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
