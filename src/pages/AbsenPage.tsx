import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search } from 'lucide-react';
import type { AbsenRecord } from '@/types';

type AbsenStatus = 'H' | 'S' | 'I' | 'A';

export function AbsenPage() {
  const { kelasList, activeKelas, absenRecords, addAbsenRecords, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [localStatus, setLocalStatus] = useState<Record<string, AbsenStatus>>({});
  const [showPreview, setShowPreview] = useState(false);

  const existingForDate = useMemo(() => {
    return absenRecords.filter(a => a.date === date && a.kelasId === activeKelas);
  }, [absenRecords, date, activeKelas]);

  const hasExisting = existingForDate.length > 0;

  const students = useMemo(() => {
    if (!kelas) return [];
    return kelas.students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [kelas, search]);

  const getStatus = (studentId: string): AbsenStatus => {
    if (localStatus[studentId]) return localStatus[studentId];
    const existing = existingForDate.find(a => a.studentId === studentId);
    return existing?.status || 'H';
  };

  const toggleStatus = (studentId: string, status: AbsenStatus) => {
    setLocalStatus(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (!kelas) return;
    const records: AbsenRecord[] = kelas.students.map(s => ({
      id: `${date}_${s.id}_${activeKelas}`,
      studentId: s.id,
      studentName: s.name,
      date,
      status: getStatus(s.id),
      kelasId: activeKelas,
    }));
    addAbsenRecords(records);
    setLocalStatus({});
    setShowPreview(false);
    showToast('Absensi berhasil disimpan');
  };

  const statuses: AbsenStatus[] = ['H', 'S', 'I', 'A'];
  const statusColors: Record<AbsenStatus, string> = {
    H: 'bg-primary text-primary-foreground',
    S: 'bg-semantic-blue text-primary-foreground',
    I: 'bg-semantic-yellow text-primary-foreground',
    A: 'bg-semantic-red text-primary-foreground',
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex gap-3">
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setLocalStatus({}); }}
          className="input-soft flex-1"
        />
      </div>

      {hasExisting && Object.keys(localStatus).length === 0 && (
        <div className="bg-semantic-yellow-light rounded-xl px-4 py-3 text-[13px] text-semantic-yellow font-medium">
          Data absensi untuk tanggal ini sudah ada. Perubahan akan menimpa data sebelumnya.
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Cari nama siswa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-soft pl-10"
        />
      </div>

      <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
        {students.map((s, i) => (
          <div key={s.id} className={`flex items-center justify-between px-4 py-3 ${i < students.length - 1 ? 'border-b border-border' : ''}`}>
            <div>
              <span className="text-[13px] font-medium text-foreground">{s.name}</span>
              <span className="text-[11px] text-text-tertiary ml-2">{s.nis}</span>
            </div>
            <div className="flex rounded-xl overflow-hidden border border-border">
              {statuses.map(st => (
                <button
                  key={st}
                  onClick={() => toggleStatus(s.id, st)}
                  className={`px-3 py-1.5 text-[12px] font-semibold transition-all duration-150 ${
                    getStatus(s.id) === st
                      ? statusColors[st]
                      : 'bg-surface text-text-tertiary hover:bg-bg-2'
                  } ${st !== 'A' ? 'border-r border-border' : ''}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!showPreview ? (
        <button
          onClick={() => setShowPreview(true)}
          className="btn-soft btn-primary-soft w-full py-3"
        >
          Pratinjau & Simpan
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="label-upper">Pratinjau Absensi — {date}</h3>
          <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
            {kelas?.students.map((s, i, arr) => {
              const st = getStatus(s.id);
              if (st === 'H') return null;
              return (
                <div key={s.id} className={`flex justify-between items-center px-4 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-[13px] font-medium">{s.name}</span>
                  <span className="text-[12px] font-semibold text-text-secondary">{st === 'S' ? 'Sakit' : st === 'I' ? 'Izin' : 'Alpha'}</span>
                </div>
              );
            })}
            {kelas?.students.every(s => getStatus(s.id) === 'H') && (
              <p className="px-4 py-4 text-sm text-text-tertiary text-center">Semua siswa hadir ✓</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPreview(false)} className="btn-soft btn-secondary-soft flex-1 py-3">
              Batal
            </button>
            <button onClick={handleSave} className="btn-soft btn-primary-soft flex-1 py-3">
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
