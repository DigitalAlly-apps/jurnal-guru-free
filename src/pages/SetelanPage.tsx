import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Moon, Calendar, LogOut } from 'lucide-react';

export function SetelanPage() {
  const [startDate, setStartDate] = useState('2024-07-15');
  const [endDate, setEndDate] = useState('2024-12-20');
  const [saved, setSaved] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = (checked: boolean) => {
    setIsDark(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Dark mode */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg-2 flex items-center justify-center">
              <Moon className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Mode Gelap</h3>
              <p className="text-[12px] text-text-tertiary">Tampilan nyaman untuk mata</p>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleDark} />
        </div>
      </div>

      {/* Semester period */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Periode Semester</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="label-upper block mb-1.5">Tanggal Mulai</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-soft" />
          </div>
          <div>
            <label className="label-upper block mb-1.5">Tanggal Selesai</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-soft" />
          </div>
          <button onClick={handleSave} className="btn-soft btn-primary-soft w-full py-3">
            {saved ? 'Tersimpan! ✓' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Akun</h3>
        <p className="text-[13px] text-text-secondary mb-4">guru@sekolah.id</p>
        <button className="btn-soft w-full py-3 bg-semantic-red-light text-semantic-red font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>

      <p className="text-[11px] text-text-tertiary text-center mt-2">Jurnal Guru Pro v2.0</p>
    </div>
  );
}
