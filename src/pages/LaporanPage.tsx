import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Download, BarChart3, AlertTriangle, BookOpen } from 'lucide-react';

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
    { id: 'minggu', label: 'Minggu' },
    { id: 'bulan', label: 'Bulan' },
    { id: 'semua', label: 'Semua' },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="input-soft">
          <option value="">Semua Siswa</option>
          {kelas?.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all ${
                period === p.id
                  ? 'bg-surface shadow-soft text-foreground'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Rekap Kehadiran</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-bg-2">
                <th className="text-left text-[11px] font-semibold tracking-wider uppercase text-text-tertiary px-4 py-2.5">Nama</th>
                <th className="text-center text-[11px] font-semibold tracking-wider uppercase text-text-tertiary px-3 py-2.5">H</th>
                <th className="text-center text-[11px] font-semibold tracking-wider uppercase text-text-tertiary px-3 py-2.5">S</th>
                <th className="text-center text-[11px] font-semibold tracking-wider uppercase text-text-tertiary px-3 py-2.5">I</th>
                <th className="text-center text-[11px] font-semibold tracking-wider uppercase text-text-tertiary px-3 py-2.5">A</th>
              </tr>
            </thead>
            <tbody>
              {recap.map((r, i) => (
                <tr key={i} className="hover:bg-bg-2 transition-colors">
                  <td className="px-4 py-3 border-b border-border text-foreground font-medium">{r.name}</td>
                  <td className="px-3 py-3 border-b border-border text-center text-primary font-semibold">{r.hadir}</td>
                  <td className="px-3 py-3 border-b border-border text-center text-semantic-blue">{r.sakit}</td>
                  <td className="px-3 py-3 border-b border-border text-center text-semantic-yellow">{r.izin}</td>
                  <td className="px-3 py-3 border-b border-border text-center text-semantic-red">{r.alpha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kasus Log */}
      {filteredKasus.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-semantic-red" />
            <h3 className="text-sm font-semibold text-foreground">Log Kasus</h3>
          </div>
          <div className="flex flex-col gap-2">
            {filteredKasus.map(k => (
              <div key={k.id} className="bg-bg-2 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-medium text-foreground">{k.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{k.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary">{k.description}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-3 text-text-secondary mt-1.5">{k.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catatan */}
      {filteredCatatan.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Catatan Anekdot</h3>
          </div>
          <div className="flex flex-col gap-2">
            {filteredCatatan.map(c => (
              <div key={c.id} className="bg-bg-2 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-medium text-foreground">{c.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{c.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={exportCSV} className="btn-soft btn-secondary-soft w-full py-3 gap-2">
        <Download className="w-4 h-4" /> Export CSV
      </button>
    </div>
  );
}
