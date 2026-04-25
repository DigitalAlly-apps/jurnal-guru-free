import { useState, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Moon, Calendar, Download, Upload, Smartphone, User, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDarkMode } from '@/hooks/use-dark-mode';
import type { BackupData, SemesterConfig, UjianSchedule } from '@/types';
import { InformasiPage } from './InformasiPage';

export function SetelanPage() {
  const { namaGuru, setNamaGuru, semester, setSemester, exportBackup, importBackup, resetAll, showToast } = useApp();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [showInstall, setShowInstall] = useState(false);
  const [showSemesterConfig, setShowSemesterConfig] = useState(false);
  const [namaInput, setNamaInput] = useState(namaGuru);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        importBackup(data as BackupData);
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

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">

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
            onKeyDown={e => e.key === 'Enter' && saveNama()}
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
          <Switch checked={isDark} onCheckedChange={val => toggleDark(val)} />
        </div>
      </div>

      {/* Semester & Jadwal (Collapsible) */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <button
          onClick={() => setShowSemesterConfig(!showSemesterConfig)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-foreground">Semester & Jadwal Ujian</h3>
              <p className="text-[12px] text-text-tertiary">
                {semester.tahunAjaran} • {semester.semester === 'ganjil' ? 'Ganjil' : 'Genap'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-bg-2 flex items-center justify-center transition-transform">
            {showSemesterConfig ? (
              <ChevronUp className="w-4 h-4 text-text-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            )}
          </div>
        </button>

        {showSemesterConfig && (
          <div className="mt-5 space-y-4 pt-4 border-t border-border/50 animate-fade-in">
            {/* Periode & Tahun Ajaran */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-upper block mb-1.5">Tahun Ajaran</label>
                <select value={semester.tahunAjaran} onChange={e => handleSemesterChange({ tahunAjaran: e.target.value })} className="input-soft w-full text-xs py-2">
                  {tahunOptions().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label-upper block mb-1.5">Periode</label>
                <div className="flex flex-col sm:flex-row bg-bg-2 rounded-xl p-1 gap-1">
                  {(['ganjil', 'genap'] as const).map(p => (
                    <button key={p} onClick={() => handleSemesterChange({ semester: p })}
                      className={`flex-1 py-1.5 px-2 text-[12px] font-semibold rounded-lg transition-all capitalize ${
                        semester.semester === p ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jadwal Simple */}
            {([
              { key: 'ganjil' as const, label: 'Jadwal Ganjil', data: semester.ganjil },
              { key: 'genap' as const, label: 'Jadwal Genap', data: semester.genap }
            ]).map(item => (
              <div key={item.key} className={`p-3 rounded-xl border border-border/40 ${semester.semester === item.key ? 'bg-primary/5 border-primary/20' : 'bg-bg-2/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-upper block !mb-0">{item.label}</label>
                  {semester.semester === item.key && <span className="text-[10px] text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10">Aktif</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-text-tertiary mb-1 block">Mulai UTS</span>
                    <input type="date" value={item.data.utsStart} onChange={e => handleScheduleChange(item.key, { utsStart: e.target.value })} className="input-soft text-[11px] w-full py-1.5 px-2" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary mb-1 block">Selesai UTS</span>
                    <input type="date" value={item.data.utsEnd} onChange={e => handleScheduleChange(item.key, { utsEnd: e.target.value })} className="input-soft text-[11px] w-full py-1.5 px-2" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary mb-1 block">Mulai UAS</span>
                    <input type="date" value={item.data.uasStart} onChange={e => handleScheduleChange(item.key, { uasStart: e.target.value })} className="input-soft text-[11px] w-full py-1.5 px-2" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary mb-1 block">Selesai UAS</span>
                    <input type="date" value={item.data.uasEnd} onChange={e => handleScheduleChange(item.key, { uasEnd: e.target.value })} className="input-soft text-[11px] w-full py-1.5 px-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* Reset Data */}
      <div className="bg-surface rounded-2xl shadow-soft p-5 border border-red-200 dark:border-red-900/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Reset Semua Data</h3>
            <p className="text-[12px] text-text-tertiary">Hapus seluruh data jurnal secara permanen</p>
          </div>
        </div>
        <p className="text-[12px] text-red-500/80 dark:text-red-400/80 mb-3 mt-2 leading-relaxed">
          ⚠️ Tindakan ini tidak dapat dibatalkan. Pastikan sudah backup sebelum melanjutkan.
        </p>
        <button
          onClick={() => { setResetInput(''); setShowResetDialog(true); }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          Reset Data...
        </button>
      </div>

      {/* Reset Confirmation Dialog — mengganti window.confirm() */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Konfirmasi Reset</h3>
                <p className="text-[12px] text-text-tertiary">Semua data akan dihapus permanen</p>
              </div>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Ketik <span className="font-bold text-red-500 font-mono">RESET</span> di bawah untuk mengkonfirmasi.
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={e => setResetInput(e.target.value)}
              placeholder="Ketik RESET"
              className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-red-400 outline-none bg-bg-2 text-sm font-mono tracking-widest text-center transition-colors"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border bg-bg-2 text-text-secondary hover:bg-border transition-colors"
              >
                Batal
              </button>
              <button
                disabled={resetInput !== 'RESET'}
                onClick={() => { resetAll(); setShowResetDialog(false); setResetInput(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}



      <p className="text-[14px] text-text-tertiary text-center mt-2 font-bold">Jurnal Guru Pro v5</p>
    </div>
  );
}

