import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

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
    <div className="flex flex-col gap-[16px]">
      <div className="bg-surface border border-border rounded-lg p-[16px]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Mode Gelap</h3>
            <p className="text-[13px] text-text-secondary">Tampilan gelap untuk mata nyaman</p>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleDark} />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-[16px]">
        <h3 className="text-[14px] font-semibold text-foreground mb-[12px]">Periode Semester</h3>
        <div className="flex flex-col gap-[12px]">
          <div>
            <label className="label-upper block mb-[4px]">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="label-upper block mb-[4px]">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full py-[9px] bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:bg-accent-hover transition-colors"
          >
            {saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-[16px]">
        <h3 className="text-[14px] font-semibold text-foreground mb-[8px]">Akun</h3>
        <p className="text-[13px] text-text-secondary mb-[12px]">guru@sekolah.id</p>
        <button className="w-full py-[9px] bg-destructive-light border border-transparent text-semantic-red rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity">
          Keluar
        </button>
      </div>

      <p className="text-[11px] text-text-tertiary text-center">Jurnal Guru Pro v1.0</p>
    </div>
  );
}
