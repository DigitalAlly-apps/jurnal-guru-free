import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export function LaporanPage() {
  const { kelasList, activeKelas, absenRecords, kasusRecords, catatanRecords } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [period, setPeriod] = useState<'minggu' | 'bulan' | 'semua'>('semua');

  const filterByPeriod = (date: string) => {
    if (period === 'semua') return true;
    const d = new Date(date);
    const now = new Date();
    if (period === 'minggu') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    }
    if (period === 'bulan') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredAbsen = useMemo(() => {
    return absenRecords.filter(a =>
      a.kelasId === activeKelas &&
      (!selectedStudent || a.studentId === selectedStudent) &&
      filterByPeriod(a.date)
    );
  }, [absenRecords, activeKelas, selectedStudent, period]);

  const filteredKasus = useMemo(() => {
    return kasusRecords.filter(k =>
      k.kelasId === activeKelas &&
      (!selectedStudent || k.studentId === selectedStudent) &&
      filterByPeriod(k.date)
    );
  }, [kasusRecords, activeKelas, selectedStudent, period]);

  const filteredCatatan = useMemo(() => {
    return catatanRecords.filter(c =>
      c.kelasId === activeKelas &&
      (!selectedStudent || c.studentId === selectedStudent) &&
      filterByPeriod(c.date)
    );
  }, [catatanRecords, activeKelas, selectedStudent, period]);

  // Recap
  const recap = useMemo(() => {
    const students = kelas?.students || [];
    return students.map(s => {
      const absen = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id && filterByPeriod(a.date));
      return {
        name: s.name,
        hadir: absen.filter(a => a.status === 'H').length,
        sakit: absen.filter(a => a.status === 'S').length,
        izin: absen.filter(a => a.status === 'I').length,
        alpha: absen.filter(a => a.status === 'A').length,
        kasus: kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id && filterByPeriod(k.date)).length,
      };
    }).filter(r => !selectedStudent || kelas?.students.find(s => s.id === selectedStudent)?.name === r.name);
  }, [kelas, absenRecords, kasusRecords, activeKelas, selectedStudent, period]);

  const exportCSV = () => {
    const headers = ['Nama', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Kasus'];
    const rows = recap.map(r => [r.name, r.hadir, r.sakit, r.izin, r.alpha, r.kasus].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `laporan_${activeKelas}_${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periods: { id: 'minggu' | 'bulan' | 'semua'; label: string }[] = [
    { id: 'minggu', label: 'Minggu Ini' },
    { id: 'bulan', label: 'Bulan Ini' },
    { id: 'semua', label: 'Semua' },
  ];

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Filters */}
      <div className="flex flex-col gap-[8px]">
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors">
          <option value="">Semua Siswa</option>
          {kelas?.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex border border-border rounded-md overflow-hidden">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-[8px] text-[12px] font-medium transition-colors ${
                period === p.id ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-secondary hover:bg-bg-2'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recap Table */}
      <div>
        <h3 className="label-upper mb-[8px]">Rekap Kehadiran</h3>
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-medium tracking-[.05em] uppercase text-text-tertiary px-[10px] py-[8px] border-b border-border">Nama</th>
                <th className="text-left text-[11px] font-medium tracking-[.05em] uppercase text-text-tertiary px-[10px] py-[8px] border-b border-border">H</th>
                <th className="text-left text-[11px] font-medium tracking-[.05em] uppercase text-text-tertiary px-[10px] py-[8px] border-b border-border">S</th>
                <th className="text-left text-[11px] font-medium tracking-[.05em] uppercase text-text-tertiary px-[10px] py-[8px] border-b border-border">I</th>
                <th className="text-left text-[11px] font-medium tracking-[.05em] uppercase text-text-tertiary px-[10px] py-[8px] border-b border-border">A</th>
              </tr>
            </thead>
            <tbody>
              {recap.map((r, i) => (
                <tr key={i} className="hover:bg-bg-2">
                  <td className="px-[10px] py-[10px] border-b border-border text-foreground">{r.name}</td>
                  <td className="px-[10px] py-[10px] border-b border-border">{r.hadir}</td>
                  <td className="px-[10px] py-[10px] border-b border-border">{r.sakit}</td>
                  <td className="px-[10px] py-[10px] border-b border-border">{r.izin}</td>
                  <td className="px-[10px] py-[10px] border-b border-border">{r.alpha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kasus Log */}
      {filteredKasus.length > 0 && (
        <div>
          <h3 className="label-upper mb-[8px]">Log Kasus</h3>
          <div className="bg-surface border border-border rounded-lg">
            {filteredKasus.map((k, i) => (
              <div key={k.id} className={`px-[16px] py-[10px] ${i < filteredKasus.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex justify-between items-center mb-[2px]">
                  <span className="text-[13px] font-medium text-foreground">{k.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{k.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary">{k.description}</p>
                <span className="inline-flex items-center px-[8px] py-[2px] rounded-sm text-[11px] font-medium bg-bg-3 text-text-secondary mt-[4px]">{k.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catatan */}
      {filteredCatatan.length > 0 && (
        <div>
          <h3 className="label-upper mb-[8px]">Catatan Anekdot</h3>
          <div className="bg-surface border border-border rounded-lg">
            {filteredCatatan.map((c, i) => (
              <div key={c.id} className={`px-[16px] py-[10px] ${i < filteredCatatan.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex justify-between items-center mb-[2px]">
                  <span className="text-[13px] font-medium text-foreground">{c.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{c.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={exportCSV} className="w-full py-[9px] bg-transparent border border-border-2 text-text-secondary rounded-md text-[13px] font-medium hover:bg-bg-2 transition-colors">
        Export CSV
      </button>
    </div>
  );
}
