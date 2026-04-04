import { useState, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Moon, Calendar, Download, Upload, Smartphone, User, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BackupData, SemesterConfig, UjianSchedule } from '@/types';

export function SetelanPage() {
  const { namaGuru, setNamaGuru, semester, setSemester, exportBackup, importBackup, showToast } = useApp();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [showInstall, setShowInstall] = useState(false);
  const [namaInput, setNamaInput] = useState(namaGuru);
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
    showToast('Semester diperbarui');
  };

  const handleScheduleChange = (which: 'ganjil' | 'genap', updates: Partial<UjianSchedule>) => {
    setSemester(prev => ({
      ...prev,
      [which]: { ...prev[which], ...updates },
    }));
  };

  const saveNama = () => {
    setNamaGuru(namaInput.trim());
    showToast('Nama guru disimpan');
  };

  const activeSched = semester.semester === 'ganjil' ? semester.ganjil : semester.genap;
  const activeKey   = semester.semester as 'ganjil' | 'genap';

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* Nama Guru */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Profil Guru</h3>
        </div>
        <label className="label-upper block mb-1.5">Nama Guru</label>
        <div className="flex gap-2">
          <input
            value={namaInput}
            onChange={e => setNamaInput(e.target.value)}
            placeholder="Contoh: Pak Budi / Bu Sari"
            className="input-soft flex-1"
          />
          <button onClick={saveNama} className="btn-soft btn-primary-soft px-4 py-2 text-sm">
            Simpan
          </button>
        </div>
      </div>

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

        {/* Tahun Ajaran */}
        <div className="mb-3">
          <label className="label-upper block mb-1.5">Tahun Ajaran</label>
          <select value={semester.tahunAjaran} onChange={e => handleSemesterChange({ tahunAjaran: e.target.value })} className="input-soft">
            {tahunOptions().map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Aktif Semester */}
        <div>
          <label className="label-upper block mb-1.5">Periode Aktif</label>
          <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
            {(['ganjil', 'genap'] as const).map(p => (
              <button key={p} onClick={() => handleSemesterChange({ semester: p })}
                className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all capitalize ${
                  semester.semester === p ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
                }`}>
                {p === 'ganjil' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jadwal UTS & UAS — Semester 1 (Ganjil) */}
      <UjianScheduleCard
        label="Jadwal UTS & UAS — Semester 1 (Ganjil)"
        schedule={semester.ganjil}
        isActive={semester.semester === 'ganjil'}
        onChange={u => handleScheduleChange('ganjil', u)}
      />

      {/* Jadwal UTS & UAS — Semester 2 (Genap) */}
      <UjianScheduleCard
        label="Jadwal UTS & UAS — Semester 2 (Genap)"
        schedule={semester.genap}
        isActive={semester.semester === 'genap'}
        onChange={u => handleScheduleChange('genap', u)}
      />

      {/* Backup & Restore */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Backup & Restore</h3>
        <p className="text-[12px] text-text-tertiary mb-4">Simpan atau pulihkan semua data jurnal</p>
        <div className="flex flex-col gap-2">
          <button onClick={exportBackup} className="btn-soft btn-primary-soft w-full py-3 gap-2 flex items-center justify-center">
            <Download className="w-4 h-4" /> Backup Data (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-soft btn-secondary-soft w-full py-3 gap-2 flex items-center justify-center">
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

      <p className="text-[11px] text-text-tertiary text-center mt-2">Jurnal Guru Pro v2.0</p>
    </div>
  );
}

// Sub-component: Ujian schedule card
function UjianScheduleCard({
  label, schedule, isActive, onChange,
}: {
  label: string;
  schedule: UjianSchedule;
  isActive: boolean;
  onChange: (u: Partial<UjianSchedule>) => void;
}) {
  return (
    <div className={`bg-surface rounded-2xl shadow-soft p-5 ${isActive ? 'ring-2 ring-primary/30' : 'opacity-80'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-bg-2 flex items-center justify-center">
          <Clock className="w-4 h-4 text-text-secondary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          {isActive && <span className="text-[11px] text-primary font-semibold">● Aktif</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-upper block mb-1.5">UTS Mulai</label>
          <input type="date" value={schedule.utsStart} onChange={e => onChange({ utsStart: e.target.value })} className="input-soft text-xs" />
        </div>
        <div>
          <label className="label-upper block mb-1.5">UTS Selesai</label>
          <input type="date" value={schedule.utsEnd} onChange={e => onChange({ utsEnd: e.target.value })} className="input-soft text-xs" />
        </div>
        <div>
          <label className="label-upper block mb-1.5">UAS Mulai</label>
          <input type="date" value={schedule.uasStart} onChange={e => onChange({ uasStart: e.target.value })} className="input-soft text-xs" />
        </div>
        <div>
          <label className="label-upper block mb-1.5">UAS Selesai</label>
          <input type="date" value={schedule.uasEnd} onChange={e => onChange({ uasEnd: e.target.value })} className="input-soft text-xs" />
        </div>
      </div>
    </div>
  );
}
