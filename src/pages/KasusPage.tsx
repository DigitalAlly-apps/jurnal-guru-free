import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, BookOpen, Zap } from 'lucide-react';
import type { KasusRecord, CatatanRecord, PeriodeUjian } from '@/types';

const KATEGORI = ['Akademik', 'Kedisiplinan', 'Perilaku', 'Kehadiran', 'Lainnya'];
const PERIODE_OPTIONS: PeriodeUjian[] = ['Harian', 'UTS', 'UAS'];
type InputMode = 'kasus' | 'catatan';

const TEMPLATE_KASUS = [
  'Tidak mengerjakan PR',
  'Terlambat masuk kelas',
  'Mengganggu teman saat pelajaran',
  'Tidak membawa perlengkapan belajar',
  'Berbicara tidak sopan',
  'Bermain HP saat pelajaran',
  'Tidak mengikuti pelajaran dengan serius',
  'Berkelahi dengan teman',
];

const TIPE_CATATAN = [
  { id: 'prestasi',     label: '🏆 Prestasi',     desc: 'Pencapaian atau penghargaan' },
  { id: 'perkembangan', label: '📈 Perkembangan',  desc: 'Kemajuan belajar atau sikap' },
  { id: 'umum',         label: '📝 Umum',          desc: 'Catatan observasi lainnya' },
] as const;

export function KasusPage() {
  const { kelasList, activeKelas, addKasusRecord, addCatatanRecord, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);

  const [mode, setMode] = useState<InputMode>('kasus');
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [periode, setPeriode] = useState<PeriodeUjian>('Harian');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(KATEGORI[0]);
  const [tipeCatatan, setTipeCatatan] = useState<'prestasi' | 'perkembangan' | 'umum'>('umum');
  const [showTemplates, setShowTemplates] = useState(false);
  const [waktuPemanggilan, setWaktuPemanggilan] = useState('');

  const reset = () => { setDescription(''); setStudentId(''); setShowTemplates(false); setWaktuPemanggilan(''); };

  const handleSave = () => {
    if (!studentId || !description.trim()) {
      showToast('Pilih siswa dan isi deskripsi');
      return;
    }
    const student = kelas?.students.find(s => s.id === studentId);
    if (!student) return;

    if (mode === 'kasus') {
      const record: KasusRecord = {
        id: `k_${Date.now()}`,
        studentId, studentName: student.name,
        date, description: description.trim(),
        category, kelasId: activeKelas, periodeUjian: periode,
        waktuPemanggilan: waktuPemanggilan || undefined,
      };
      addKasusRecord(record);
      showToast('Kasus berhasil disimpan');
    } else {
      const record: CatatanRecord = {
        id: `cat_${Date.now()}`,
        studentId, studentName: student.name,
        date, content: description.trim(),
        kelasId: activeKelas, tipe: tipeCatatan,
      };
      addCatatanRecord(record);
      showToast('Catatan anekdot berhasil disimpan');
    }
    reset();
  };

  if (!kelas || kelas.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-text-secondary text-sm">Belum ada siswa di kelas ini.</p>
        <p className="text-text-tertiary text-xs">Tambahkan siswa di menu <strong>Data Siswa</strong> terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Toggle */}
      <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
        <button onClick={() => setMode('kasus')}
          className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${
            mode === 'kasus' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}>
          <AlertTriangle className="w-3.5 h-3.5" /> Input Kasus
        </button>
        <button onClick={() => setMode('catatan')}
          className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${
            mode === 'catatan' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}>
          <BookOpen className="w-3.5 h-3.5" /> Catatan Anekdot
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft p-5 flex flex-col gap-4">
        {/* Siswa */}
        <div>
          <label className="label-upper block mb-1.5">Siswa</label>
          <select value={studentId} onChange={e => setStudentId(e.target.value)} className="input-soft">
            <option value="">-- Pilih Siswa --</option>
            {kelas.students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
            ))}
          </select>
        </div>

        {/* Tanggal + Periode (kasus) / Tipe (catatan) */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label-upper block mb-1.5">Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-soft" />
          </div>
          {mode === 'kasus' ? (
            <div className="flex-1">
              <label className="label-upper block mb-1.5">Periode</label>
              <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
                {PERIODE_OPTIONS.map(p => (
                  <button key={p} onClick={() => setPeriode(p)}
                    className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                      periode === p ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary'
                    }`}>{p}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <label className="label-upper block mb-1.5">Tipe</label>
              <select value={tipeCatatan} onChange={e => setTipeCatatan(e.target.value as any)} className="input-soft text-sm">
                {TIPE_CATATAN.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Kategori (kasus saja) */}
        {mode === 'kasus' && (
          <div>
            <label className="label-upper block mb-1.5">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {KATEGORI.map(k => (
                <button key={k} onClick={() => setCategory(k)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === k ? 'bg-primary text-white' : 'bg-bg-2 text-text-secondary hover:bg-bg-3'
                  }`}>{k}</button>
              ))}
            </div>
          </div>
        )}

        {/* Waktu Pemanggilan (kasus saja, opsional) */}
        {mode === 'kasus' && (
          <div>
            <label className="label-upper block mb-1.5">
              Waktu Pemanggilan
              <span className="ml-1.5 text-[10px] text-text-tertiary normal-case font-normal">(opsional)</span>
            </label>
            <input
              type="time"
              value={waktuPemanggilan}
              onChange={e => setWaktuPemanggilan(e.target.value)}
              className="input-soft w-40"
            />
          </div>
        )}

        {/* Deskripsi + Template */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-upper">{mode === 'kasus' ? 'Deskripsi Kasus' : 'Catatan / Anekdot'}</label>
            {mode === 'kasus' && (
              <button onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline">
                <Zap className="w-3 h-3" /> Template
              </button>
            )}
          </div>

          {/* Template chips */}
          {showTemplates && mode === 'kasus' && (
            <div className="flex flex-wrap gap-2 mb-2">
              {TEMPLATE_KASUS.map(t => (
                <button key={t} onClick={() => { setDescription(t); setShowTemplates(false); }}
                  className="text-[11px] px-2.5 py-1 bg-accent-light text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                  {t}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={mode === 'kasus'
              ? 'Tuliskan deskripsi kejadian...'
              : 'Tuliskan catatan perkembangan, prestasi, atau anekdot siswa...'}
            rows={4}
            className="input-soft resize-none"
          />
        </div>

        <button onClick={handleSave} className="btn-soft btn-primary-soft w-full py-3">
          {mode === 'kasus' ? 'Simpan Kasus' : 'Simpan Catatan Anekdot'}
        </button>
      </div>
    </div>
  );
}
