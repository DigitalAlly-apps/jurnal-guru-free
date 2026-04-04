import { useState, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Moon, Calendar, LogOut, Download, Upload, Smartphone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BackupData, SemesterConfig } from '@/types';

export function SetelanPage() {
  const { semester, setSemester, exportBackup, importBackup, showToast } = useApp();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [showInstall, setShowInstall] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleDark = (checked: boolean) => {
    setIsDark(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as BackupData;
        importBackup(data);
      } catch {
        showToast('File backup tidak valid');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tahunOptions = () => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const start = y - 2 + i;
      return `${start}/${start + 1}`;
    });
  };

  const handleSemesterChange = (updates: Partial<SemesterConfig>) => {
    setSemester(prev => ({ ...prev, ...updates }));
    showToast('Semester berhasil diperbarui');
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

      {/* Semester */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Semester</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="label-upper block mb-1.5">Tahun Ajaran</label>
            <select
              value={semester.tahunAjaran}
              onChange={e => handleSemesterChange({ tahunAjaran: e.target.value })}
              className="input-soft"
            >
              {tahunOptions().map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-upper block mb-1.5">Periode</label>
            <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
              {(['ganjil', 'genap'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => handleSemesterChange({ semester: p })}
                  className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all capitalize ${
                    semester.semester === p
                      ? 'bg-surface shadow-soft text-foreground'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  Semester {p === 'ganjil' ? '1 (Ganjil)' : '2 (Genap)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Backup & Restore</h3>
        <p className="text-[12px] text-text-tertiary mb-4">Simpan atau pulihkan semua data jurnal</p>
        <div className="flex flex-col gap-2">
          <button onClick={exportBackup} className="btn-soft btn-primary-soft w-full py-3 gap-2">
            <Download className="w-4 h-4" /> Backup Data (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-soft btn-secondary-soft w-full py-3 gap-2">
            <Upload className="w-4 h-4" /> Restore dari Backup
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {/* Install PWA */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-semantic-blue-light flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-semantic-blue" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Install Aplikasi</h3>
              <p className="text-[12px] text-text-tertiary">Pasang di home screen HP</p>
            </div>
          </div>
          <button onClick={() => setShowInstall(!showInstall)} className="btn-soft btn-secondary-soft text-[12px] py-2 px-3">
            Cara Install
          </button>
        </div>
        {showInstall && (
          <div className="mt-3 bg-bg-2 rounded-xl p-4 text-[12px] text-text-secondary leading-relaxed">
            <p className="font-semibold text-foreground mb-2">Android (Chrome):</p>
            <p>Ketuk menu ⋮ → "Install app" atau "Add to Home screen"</p>
            <p className="font-semibold text-foreground mb-2 mt-3">iPhone (Safari):</p>
            <p>Ketuk tombol Share ↗ → "Add to Home Screen"</p>
          </div>
        )}
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
