import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { KasusRecord, PeriodeUjian } from '@/types';

const KATEGORI = ['Akademik', 'Kedisiplinan', 'Perilaku', 'Kehadiran', 'Lainnya'];
const PERIODE_OPTIONS: PeriodeUjian[] = ['Harian', 'UTS', 'UAS'];

export function KasusPage() {
  const { kelasList, activeKelas, addKasusRecord, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);

  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [periode, setPeriode] = useState<PeriodeUjian>('Harian');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(KATEGORI[0]);

  const handleSave = () => {
    if (!studentId || !description.trim()) {
      showToast('Pilih siswa dan isi deskripsi kasus');
      return;
    }
    const student = kelas?.students.find(s => s.id === studentId);
    if (!student) return;
    const record: KasusRecord = {
      id: `k_${Date.now()}`,
      studentId,
      studentName: student.name,
      date,
      description: description.trim(),
      category,
      kelasId: activeKelas,
      periodeUjian: periode,
    };
    addKasusRecord(record);
    setDescription('');
    setStudentId('');
    showToast('Kasus berhasil disimpan');
  };

  if (!kelas || kelas.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-text-secondary text-sm">Belum ada siswa di kelas ini.</p>
        <p className="text-text-tertiary text-xs">Tambahkan siswa di menu <strong>Profil Siswa</strong> terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
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

        {/* Tanggal & Periode */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label-upper block mb-1.5">Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-soft" />
          </div>
          <div className="flex-1">
            <label className="label-upper block mb-1.5">Periode</label>
            <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
              {PERIODE_OPTIONS.map(p => (
                <button key={p} onClick={() => setPeriode(p)}
                  className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                    periode === p ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="label-upper block mb-1.5">Kategori</label>
          <div className="flex flex-wrap gap-2">
            {KATEGORI.map(k => (
              <button key={k} onClick={() => setCategory(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === k ? 'bg-primary text-white' : 'bg-bg-2 text-text-secondary hover:bg-bg-3'
                }`}>
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="label-upper block mb-1.5">Deskripsi Kasus</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tuliskan deskripsi kejadian atau catatan perilaku..."
            rows={4}
            className="input-soft resize-none"
          />
        </div>

        <button onClick={handleSave} className="btn-soft btn-primary-soft w-full py-3">
          Simpan Kasus
        </button>
      </div>
    </div>
  );
}
