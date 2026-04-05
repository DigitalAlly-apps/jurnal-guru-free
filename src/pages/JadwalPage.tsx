import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Trash2, Clock } from 'lucide-react';
import type { JadwalSlot, HariSekolah } from '@/types';

const HARI_LIST: HariSekolah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function JadwalPage() {
  const { activeKelas, kelasList, jadwalList, addJadwal, deleteJadwal, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);

  const [showForm, setShowForm] = useState(false);
  const [hari, setHari] = useState<HariSekolah>('Senin');
  const [jamMulai, setJamMulai] = useState('07:00');
  const [jamSelesai, setJamSelesai] = useState('08:30');
  const [mataPelajaran, setMataPelajaran] = useState('');

  const jadwalKelas = jadwalList
    .filter(j => j.kelasId === activeKelas)
    .sort((a, b) => HARI_LIST.indexOf(a.hari) - HARI_LIST.indexOf(b.hari) || a.jamMulai.localeCompare(b.jamMulai));

  const handleSave = () => {
    if (!mataPelajaran.trim()) { showToast('Isi nama mata pelajaran'); return; }
    const slot: JadwalSlot = {
      id: `j_${Date.now()}`,
      hari, jamMulai, jamSelesai,
      mataPelajaran: mataPelajaran.trim(),
      kelasId: activeKelas,
    };
    addJadwal(slot);
    setMataPelajaran('');
    setShowForm(false);
    showToast('Jadwal berhasil ditambahkan');
  };

  // Group by hari
  const grouped = HARI_LIST.map(h => ({
    hari: h,
    slots: jadwalKelas.filter(j => j.hari === h),
  })).filter(g => g.slots.length > 0 || showForm);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {kelas ? `Jadwal Kelas ${kelas.name}` : 'Pilih kelas terlebih dahulu'}
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-soft btn-primary-soft text-xs py-2 px-3 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface rounded-2xl shadow-soft p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">Jadwal Baru</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-upper block mb-1.5">Hari</label>
              <select value={hari} onChange={e => setHari(e.target.value as HariSekolah)} className="input-soft">
                {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="label-upper block mb-1.5">Mata Pelajaran</label>
              <input value={mataPelajaran} onChange={e => setMataPelajaran(e.target.value)}
                placeholder="Contoh: Matematika" className="input-soft" />
            </div>
            <div>
              <label className="label-upper block mb-1.5">Jam Mulai</label>
              <input type="time" value={jamMulai} onChange={e => setJamMulai(e.target.value)} className="input-soft" />
            </div>
            <div>
              <label className="label-upper block mb-1.5">Jam Selesai</label>
              <input type="time" value={jamSelesai} onChange={e => setJamSelesai(e.target.value)} className="input-soft" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-soft btn-secondary-soft flex-1 py-2.5 text-sm">Batal</button>
            <button onClick={handleSave} className="btn-soft btn-primary-soft flex-1 py-2.5 text-sm">Simpan</button>
          </div>
        </div>
      )}

      {/* Jadwal kosong */}
      {jadwalKelas.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Clock className="w-10 h-10 text-text-tertiary opacity-40" />
          <p className="text-sm text-text-secondary">Belum ada jadwal pelajaran.</p>
          <p className="text-xs text-text-tertiary">Jadwal yang ditambahkan akan muncul sebagai pilihan di form Absensi.</p>
        </div>
      )}

      {/* Grouped by hari */}
      {HARI_LIST.map(h => {
        const slots = jadwalKelas.filter(j => j.hari === h);
        if (slots.length === 0) return null;
        return (
          <div key={h} className="bg-surface rounded-2xl shadow-soft overflow-hidden">
            <div className="px-4 py-2.5 bg-bg-2 border-b border-border">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{h}</span>
            </div>
            <div className="divide-y divide-border">
              {slots.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{s.mataPelajaran}</p>
                    <p className="text-xs text-text-tertiary">{s.jamMulai} – {s.jamSelesai}</p>
                  </div>
                  <button onClick={() => deleteJadwal(s.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-text-tertiary hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
