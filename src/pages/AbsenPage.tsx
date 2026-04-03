import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
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

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex gap-[8px]">
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setLocalStatus({}); }}
          className="flex-1 px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors"
        />
      </div>

      {hasExisting && Object.keys(localStatus).length === 0 && (
        <div className="bg-semantic-yellow-light border border-border rounded-md px-[12px] py-[8px] text-[12px] text-semantic-yellow">
          Data absensi untuk tanggal ini sudah ada. Perubahan akan menimpa data sebelumnya.
        </div>
      )}

      <input
        type="text"
        placeholder="Cari nama siswa..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors"
      />

      <div className="bg-surface border border-border rounded-lg">
        {students.map((s, i) => (
          <div key={s.id} className={`flex items-center justify-between px-[16px] py-[10px] ${i < students.length - 1 ? 'border-b border-border' : ''}`}>
            <div>
              <span className="text-[13px] text-foreground">{s.name}</span>
              <span className="text-[11px] text-text-tertiary ml-[8px]">{s.nis}</span>
            </div>
            <div className="flex border border-border rounded-md overflow-hidden">
              {statuses.map(st => (
                <button
                  key={st}
                  onClick={() => toggleStatus(s.id, st)}
                  className={`px-[10px] py-[4px] text-[12px] font-medium transition-colors duration-150 ${
                    getStatus(s.id) === st
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface text-text-secondary hover:bg-bg-2'
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
          className="w-full py-[9px] bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:bg-accent-hover transition-colors"
        >
          Pratinjau & Simpan
        </button>
      ) : (
        <div className="flex flex-col gap-[8px]">
          <h3 className="label-upper">Pratinjau Absensi — {date}</h3>
          <div className="bg-surface border border-border rounded-lg">
            {kelas?.students.map((s, i, arr) => {
              const st = getStatus(s.id);
              if (st === 'H') return null;
              return (
                <div key={s.id} className={`flex justify-between items-center px-[16px] py-[8px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-[13px]">{s.name}</span>
                  <span className="text-[12px] font-medium text-text-secondary">{st === 'S' ? 'Sakit' : st === 'I' ? 'Izin' : 'Alpha'}</span>
                </div>
              );
            })}
            {kelas?.students.every(s => getStatus(s.id) === 'H') && (
              <p className="px-[16px] py-[10px] text-[13px] text-text-tertiary">Semua siswa hadir</p>
            )}
          </div>
          <div className="flex gap-[8px]">
            <button onClick={() => setShowPreview(false)} className="flex-1 py-[9px] bg-transparent border border-border-2 text-text-secondary rounded-md text-[13px] font-medium hover:bg-bg-2 transition-colors">
              Batal
            </button>
            <button onClick={handleSave} className="flex-1 py-[9px] bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:bg-accent-hover transition-colors">
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
