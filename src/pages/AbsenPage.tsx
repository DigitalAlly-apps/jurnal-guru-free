import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, CheckCircle, Pencil, ChevronDown } from 'lucide-react';
import type { AbsenRecord, PeriodeUjian } from '@/types';

type AbsenStatus = 'H' | 'S' | 'I' | 'A';
const PERIODE_OPTIONS: PeriodeUjian[] = ['Harian', 'UTS', 'UAS'];

// Saran keterangan per status
const KETERANGAN_SUGGESTIONS: Record<AbsenStatus, string[]> = {
  H: [],
  S: ['Sakit perut', 'Demam', 'Flu / pilek', 'Sakit kepala', 'Sakit gigi', 'Rawat inap'],
  I: ['Keperluan keluarga', 'Acara keluarga', 'Izin dokter', 'Perjalanan dinas orang tua', 'Kegiatan sekolah lain'],
  A: [],
};

export function AbsenPage() {
  const { kelasList, activeKelas, absenRecords, addAbsenRecords, jadwalList, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);

  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [periode, setPeriode]         = useState<PeriodeUjian>('Harian');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [search, setSearch]           = useState('');
  const [localStatus, setLocalStatus] = useState<Record<string, AbsenStatus>>({});
  const [localKet, setLocalKet]       = useState<Record<string, string>>({});  // keterangan per siswa
  const [expandedId, setExpandedId]   = useState<string | null>(null);         // siswa yang sedang buka keterangan
  const [showPreview, setShowPreview] = useState(false);

  const hariIni       = new Date(date).toLocaleDateString('id-ID', { weekday: 'long' });
  const jadwalHariIni = jadwalList.filter(j => j.kelasId === activeKelas && j.hari === hariIni);

  const existingForDate = useMemo(() =>
    absenRecords.filter(a => a.date === date && a.kelasId === activeKelas),
    [absenRecords, date, activeKelas]
  );

  const isEditMode = existingForDate.length > 0 && Object.keys(localStatus).length === 0;

  const students = useMemo(() => {
    if (!kelas) return [];
    return kelas.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [kelas, search]);

  const getStatus = (studentId: string): AbsenStatus => {
    if (localStatus[studentId] !== undefined) return localStatus[studentId];
    return existingForDate.find(a => a.studentId === studentId)?.status || 'H';
  };

  const getKet = (studentId: string): string => {
    if (localKet[studentId] !== undefined) return localKet[studentId];
    return existingForDate.find(a => a.studentId === studentId)?.keterangan || '';
  };

  const toggleStatus = (studentId: string, status: AbsenStatus) => {
    setLocalStatus(prev => ({ ...prev, [studentId]: status }));
    // Kalau balik ke Hadir, clear keterangan & collapse
    if (status === 'H') {
      setLocalKet(prev => ({ ...prev, [studentId]: '' }));
      setExpandedId(null);
    } else {
      // Auto expand keterangan saat pilih S/I/A
      setExpandedId(studentId);
    }
  };

  const startEdit = () => {
    const prefilled: Record<string, AbsenStatus> = {};
    const prefilledKet: Record<string, string> = {};
    kelas?.students.forEach(s => {
      const rec = existingForDate.find(a => a.studentId === s.id);
      prefilled[s.id]    = rec?.status      || 'H';
      prefilledKet[s.id] = rec?.keterangan  || '';
    });
    setLocalStatus(prefilled);
    setLocalKet(prefilledKet);
    showToast('Mode edit aktif — perubahan belum disimpan');
  };

  const markAllHadir = () => {
    const all: Record<string, AbsenStatus> = {};
    kelas?.students.forEach(s => { all[s.id] = 'H'; });
    setLocalStatus(all);
    setLocalKet({});
    setExpandedId(null);
  };

  const handleSave = () => {
    if (!kelas) return;
    const records: AbsenRecord[] = kelas.students.map(s => ({
      id:             `${date}_${s.id}_${activeKelas}`,
      studentId:      s.id,
      studentName:    s.name,
      date,
      status:         getStatus(s.id),
      keterangan:     getKet(s.id) || undefined,
      kelasId:        activeKelas,
      periodeUjian:   periode,
      mataPelajaran:  mataPelajaran || undefined,
    }));
    addAbsenRecords(records);
    setLocalStatus({});
    setLocalKet({});
    setExpandedId(null);
    setShowPreview(false);
    showToast('Absensi berhasil disimpan');
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setLocalStatus({});
    setLocalKet({});
    setExpandedId(null);
    setShowPreview(false);
  };

  const statuses: AbsenStatus[] = ['H', 'S', 'I', 'A'];
  const statusColors: Record<AbsenStatus, string> = {
    H: 'bg-primary text-primary-foreground',
    S: 'bg-semantic-blue text-white',
    I: 'bg-semantic-yellow text-white',
    A: 'bg-semantic-red text-white',
  };

  const statusLabel: Record<AbsenStatus, string> = {
    H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alpha',
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
          <button onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-semantic-blue text-white rounded-lg text-[12px] font-semibold flex-shrink-0 hover:bg-blue-600 transition-colors">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
      )}

      {/* Search + Hadir Semua */}
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

      {/* Daftar Siswa */}
      <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
        {students.map((s, i) => {
          const status   = getStatus(s.id);
          const ket      = getKet(s.id);
          const isOpen   = expandedId === s.id;
          const needsKet = status !== 'H';
          const suggestions = KETERANGAN_SUGGESTIONS[status] || [];

          return (
            <div key={s.id}
              className={`${i < students.length - 1 ? 'border-b border-border' : ''}`}>

              {/* Baris utama */}
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                {/* Nama */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{s.name}</p>
                  {/* Tampilkan keterangan singkat kalau ada */}
                  {ket && !isOpen && (
                    <p className="text-[11px] text-text-tertiary truncate mt-0.5 italic">"{ket}"</p>
                  )}
                </div>

                {/* Tombol status H/S/I/A */}
                <div className="flex rounded-xl overflow-hidden border border-border flex-shrink-0">
                  {statuses.map(st => (
                    <button key={st} onClick={() => toggleStatus(s.id, st)}
                      className={`px-3 py-1.5 text-[12px] font-semibold transition-all duration-150 ${
                        status === st ? statusColors[st] : 'bg-surface text-text-tertiary hover:bg-bg-2'
                      } ${st !== 'A' ? 'border-r border-border' : ''}`}>
                      {st}
                    </button>
                  ))}
                </div>

                {/* Tombol expand keterangan — hanya muncul kalau S/I/A */}
                {needsKet && (
                  <button
                    onClick={() => setExpandedId(isOpen ? null : s.id)}
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isOpen ? 'bg-bg-3 text-text-secondary' : 'bg-bg-2 text-text-tertiary hover:bg-bg-3'
                    }`}
                    title="Tambah keterangan"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {/* Panel keterangan — slide down */}
              {needsKet && isOpen && (
                <div className="px-4 pb-3 flex flex-col gap-2 bg-bg-2 border-t border-border">
                  <label className="label-upper pt-2 block">
                    Keterangan {statusLabel[status]}
                  </label>

                  {/* Input teks bebas */}
                  <input
                    type="text"
                    value={ket}
                    onChange={e => setLocalKet(prev => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder={`Contoh: ${suggestions[0] || 'Tulis keterangan...'}`}
                    className="input-soft text-[13px]"
                    autoFocus
                  />

                  {/* Saran cepat */}
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map(sug => (
                        <button
                          key={sug}
                          onClick={() => setLocalKet(prev => ({ ...prev, [s.id]: sug }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            ket === sug
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-surface border-border text-text-secondary hover:border-primary hover:text-primary'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview & Simpan */}
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
              const st  = getStatus(s.id);
              const ket = getKet(s.id);
              if (st === 'H') return null;
              return (
                <div key={s.id}
                  className={`flex justify-between items-start px-4 py-3 gap-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{s.name}</p>
                    {ket && <p className="text-[11px] text-text-tertiary italic mt-0.5">"{ket}"</p>}
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${
                    st === 'S' ? 'bg-semantic-blue-light text-semantic-blue' :
                    st === 'I' ? 'bg-semantic-yellow-light text-semantic-yellow' :
                    'bg-semantic-red-light text-semantic-red'
                  }`}>
                    {statusLabel[st]}
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
