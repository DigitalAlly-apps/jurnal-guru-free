import { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Download, BarChart3, AlertTriangle, BookOpen, FileSpreadsheet } from 'lucide-react';

export function LaporanPage() {
  const { kelasList, activeKelas, absenRecords, kasusRecords, catatanRecords, semester } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [period, setPeriod] = useState<'minggu' | 'bulan' | 'semua'>('semua');

  // Fix 6: filterByPeriod as useCallback so it's stable for useMemo deps
  const filterByPeriod = useCallback((date: string) => {
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
  }, [period]); // period in dependency array — reactive!

  const filteredKasus = useMemo(() => {
    return kasusRecords.filter(k =>
      k.kelasId === activeKelas &&
      (!selectedStudent || k.studentId === selectedStudent) &&
      filterByPeriod(k.date)
    );
  }, [kasusRecords, activeKelas, selectedStudent, filterByPeriod]);

  const filteredCatatan = useMemo(() => {
    return catatanRecords.filter(c =>
      c.kelasId === activeKelas &&
      (!selectedStudent || c.studentId === selectedStudent) &&
      filterByPeriod(c.date)
    );
  }, [catatanRecords, activeKelas, selectedStudent, filterByPeriod]);

  const recap = useMemo(() => {
    const students = kelas?.students || [];
    return students.map(s => {
      const absen = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id && filterByPeriod(a.date));
      const totalSakit = absen.filter(a => a.status === 'S').length;
      const totalIzin  = absen.filter(a => a.status === 'I').length;
      const totalAlpha = absen.filter(a => a.status === 'A').length;

      // Fix 6: Kolom Hadir = totalHariSekolah - S - I - A
      // Total unique school days this student was recorded for in the period
      const uniqueDates = new Set(
        absenRecords.filter(a => a.kelasId === activeKelas && filterByPeriod(a.date)).map(a => a.date)
      ).size;
      const totalHadir = Math.max(0, uniqueDates - totalSakit - totalIzin - totalAlpha);

      return {
        name: s.name,
        nis: s.nis,
        studentId: s.id,
        hadir: totalHadir,
        sakit: totalSakit,
        izin: totalIzin,
        alpha: totalAlpha,
        kasus: kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id && filterByPeriod(k.date)).length,
        totalHari: uniqueDates,
      };
    }).filter(r => !selectedStudent || r.studentId === selectedStudent);
  }, [kelas, absenRecords, kasusRecords, activeKelas, selectedStudent, filterByPeriod]);

  const generateCSV = () => {
    // Fix 6: Export CSV/Excel now includes "Total Hari" column
    const headers = ['No', 'Nama', 'NIS', 'Total Hari', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Kasus'];
    const rows = recap.map((r, i) => [i + 1, r.name, r.nis, r.totalHari, r.hadir, r.sakit, r.izin, r.alpha, r.kasus].join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const exportCSV = () => {
    const csv = generateCSV();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_${kelas?.name}_${semester.tahunAjaran.replace('/', '-')}_${semester.semester}_${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    // Fix 6: Excel also includes "Total Hari" column
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8">
      <style>td,th{border:1px solid #ccc;padding:4px 8px;font-family:Arial;font-size:11pt}th{background:#f0f0f0;font-weight:bold}</style>
      </head><body>
      <h3>Laporan Kelas ${kelas?.name} — ${semester.tahunAjaran} Semester ${semester.semester === 'ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</h3>
      <table><thead><tr><th>No</th><th>Nama</th><th>NIS</th><th>Total Hari</th><th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alpha</th><th>Kasus</th></tr></thead>
      <tbody>${recap.map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.nis}</td><td>${r.totalHari}</td><td>${r.hadir}</td><td>${r.sakit}</td><td>${r.izin}</td><td>${r.alpha}</td><td>${r.kasus}</td></tr>`).join('')}</tbody></table>
      </body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_${kelas?.name}_${semester.tahunAjaran.replace('/', '-')}_${semester.semester}.xls`;
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
      {/* Semester info */}
      <div className="bg-accent-light rounded-xl px-4 py-3 text-[13px] text-primary font-medium">
        📅 {semester.tahunAjaran} — Semester {semester.semester === 'ganjil' ? '1 (Ganjil)' : '2 (Genap)'}
      </div>

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

      {/* Recap Table — includes Total Hari and correct Hadir */}
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
                <th className="text-center text-[11px] font-semibold tracking-wider uppercase text-text-tertiary px-2 py-2.5">Hari</th>
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
                  <td className="px-2 py-3 border-b border-border text-center text-text-secondary">{r.totalHari}</td>
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

      {/* Export buttons */}
      <div className="flex gap-3">
        <button onClick={exportCSV} className="btn-soft btn-secondary-soft flex-1 py-3 gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button onClick={exportExcel} className="btn-soft btn-primary-soft flex-1 py-3 gap-2">
          <FileSpreadsheet className="w-4 h-4" /> Export Excel
        </button>
      </div>
    </div>
  );
}
