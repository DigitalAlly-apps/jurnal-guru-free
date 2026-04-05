import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, CheckCircle, Pencil } from 'lucide-react';
import type { AbsenRecord, PeriodeUjian } from '@/types';

type AbsenStatus = 'H' | 'S' | 'I' | 'A';
const PERIODE_OPTIONS: PeriodeUjian[] = ['Harian', 'UTS', 'UAS'];

export function AbsenPage() {
  const { kelasList, activeKelas, absenRecords, addAbsenRecords, jadwalList, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [periode, setPeriode] = useState<PeriodeUjian>('Harian');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [search, setSearch] = useState('');
  const [localStatus, setLocalStatus] = useState<Record<string, AbsenStatus>>({});
  const [showPreview, setShowPreview] = useState(false);

  const hariIni = new Date(date).toLocaleDateString('id-ID', { weekday: 'long' });
  const jadwalHariIni = jadwalList.filter(j => j.kelasId === activeKelas && j.hari === hariIni);

  const existingForDate = useMemo(() =>
    absenRecords.filter(a => a.date === date && a.kelasId === activeKelas),
    [absenRecords, date, activeKelas]
  );

  // Edit mode: data sudah ada DAN user belum mulai mengedit
  const isEditMode = existingForDate.length > 0 && Object.keys(localStatus).length === 0;

  const students = useMemo(() => {
    if (!kelas) return [];
    return kelas.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [kelas, search]);

  const getStatus = (studentId: string): AbsenStatus => {
    if (localStatus[studentId] !== undefined) return localStatus[studentId];
    // Existing record — exception only (S/I/A). Default to H if no exception stored.
    return existingForDate.find(a => a.studentId === studentId)?.status || 'H';
  };

  const toggleStatus = (studentId: string, status: AbsenStatus) => {
    setLocalStatus(prev => ({ ...prev, [studentId]: status }));
  };

  // Load existing data into localStatus to enter edit mode
  const startEdit = () => {
    const prefilled: Record<string, AbsenStatus> = {};
    kelas?.students.forEach(s => {
      prefilled[s.id] = existingForDate.find(a => a.studentId === s.id)?.status || 'H';
    });
    setLocalStatus(prefilled);
    showToast('Mode edit aktif — perubahan belum disimpan');
  };

  const markAllHadir = () => {
    const all: Record<string, AbsenStatus> = {};
    kelas?.students.forEach(s => { all[s.id] = 'H'; });
    setLocalStatus(all);
  };

  const handleSave = () => {
    if (!kelas) return;
    const records: AbsenRecord[] = kelas.students.map(s => ({
      id: `${date}_${s.id}_${activeKelas}`,
      studentId: s.id, studentName: s.name,
      date, status: getStatus(s.id),
      kelasId: activeKelas,
      periodeUjian: periode,
      mataPelajaran: mataPelajaran || undefined,
    }));
    addAbsenRecords(records);
    setLocalStatus({});
    setShowPreview(false);
    showToast('Absensi berhasil disimpan');
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setLocalStatus({});
    setShowPreview(false);
  };

  const statuses: AbsenStatus[] = ['H', 'S', 'I', 'A'];
  const statusColors: Record<AbsenStatus, string> = {
    H: 'bg-primary text-primary-foreground',
    S: 'bg-semantic-blue text-white',
    I: 'bg-semantic-yellow text-white',
    A: 'bg-semantic-red text-white',
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

      {/* Tanggal, Periode, Mata Pelajaran */}
      <div className="bg-surface rounded-2xl shadow-soft p-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <input type="date" value={date}
            onChange={e => handleDateChange(e.target.value)}
            className="input-soft flex-1" />
          <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
            {PERIODE_OPTIONS.map(p => (
              <button key={p} onClick={() => setPeriode(p)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                  periode === p ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary'
                }`}>{p}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-upper block mb-1.5">Mata Pelajaran (opsional)</label>
          {jadwalHariIni.length > 0 ? (
            <select value={mataPelajaran} onChange={e => setMataPelajaran(e.target.value)} className="input-soft">
              <option value="">-- Pilih dari jadwal --</option>
              {jadwalHariIni.map(j => (
                <option key={j.id} value={j.mataPelajaran}>{j.mataPelajaran} ({j.jamMulai}–{j.jamSelesai})</option>
              ))}
              <option value="__custom">Lainnya...</option>
            </select>
          ) : (
            <input value={mataPelajaran} onChange={e => setMataPelajaran(e.target.value)}
              placeholder="Contoh: Matematika, IPA..."
              className="input-soft" />
          )}
          {mataPelajaran === '__custom' && (
            <input className="input-soft mt-2" placeholder="Nama mata pelajaran"
              onChange={e => setMataPelajaran(e.target.value)} autoFocus />
          )}
        </div>
      </div>

      {/* Edit mode banner */}
      {isEditMode && (
        <div className="bg-semantic-blue-light rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] text-semantic-blue font-semibold">Data absensi sudah ada</p>
            <p className="text-[11px] text-semantic-blue/70 mt-0.5">
              {existingForDate.filter(a => a.status !== 'H').length} siswa tidak hadir tercatat
            </p>
          </div>
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-semantic-blue text-white rounded-lg text-[12px] font-semibold flex-shrink-0 hover:bg-blue-600 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
      )}

      {/* Hadir Semua + Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input type="text" placeholder="Cari nama siswa..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-soft pl-10 w-full" />
        </div>
        <button onClick={markAllHadir}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent-light text-primary rounded-xl text-xs font-semibold hover:bg-primary hover:text-white transition-all flex-shrink-0">
          <CheckCircle className="w-3.5 h-3.5" /> Hadir Semua
        </button>
      </div>

      {/* Student List */}
      <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
        {students.map((s, i) => (
          <div key={s.id} className={`flex items-center justify-between px-4 py-3 ${i < students.length - 1 ? 'border-b border-border' : ''}`}>
            <div>
              <span className="text-[13px] font-medium text-foreground">{s.name}</span>
              <span className="text-[11px] text-text-tertiary ml-2">{s.nis}</span>
            </div>
            <div className="flex rounded-xl overflow-hidden border border-border">
              {statuses.map(st => (
                <button key={st} onClick={() => toggleStatus(s.id, st)}
                  className={`px-3 py-1.5 text-[12px] font-semibold transition-all duration-150 ${
                    getStatus(s.id) === st ? statusColors[st] : 'bg-surface text-text-tertiary hover:bg-bg-2'
                  } ${st !== 'A' ? 'border-r border-border' : ''}`}>
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview & Save */}
      {!showPreview ? (
        <button onClick={() => setShowPreview(true)} className="btn-soft btn-primary-soft w-full py-3">
          {isEditMode ? 'Edit & Simpan' : 'Pratinjau & Simpan'}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="label-upper">
            Pratinjau — {date} · {periode}{mataPelajaran && mataPelajaran !== '__custom' ? ` · ${mataPelajaran}` : ''}
          </h3>
          <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
            {kelas?.students.map((s, i, arr) => {
              const st = getStatus(s.id);
              if (st === 'H') return null;
              return (
                <div key={s.id} className={`flex justify-between items-center px-4 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-[13px] font-medium">{s.name}</span>
                  <span className="text-[12px] font-semibold text-text-secondary">
                    {st === 'S' ? 'Sakit' : st === 'I' ? 'Izin' : 'Alpha'}
                  </span>
                </div>
              );
            })}
            {kelas?.students.every(s => getStatus(s.id) === 'H') && (
              <p className="px-4 py-4 text-sm text-text-tertiary text-center">Semua siswa hadir ✓</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPreview(false)} className="btn-soft btn-secondary-soft flex-1 py-3">Batal</button>
            <button onClick={handleSave} className="btn-soft btn-primary-soft flex-1 py-3">Simpan</button>
          </div>
        </div>
      )}
    </div>
  );
}
