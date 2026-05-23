import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Download, FileSpreadsheet, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import type { PeriodeUjian } from '@/types';

const STATUS_LABEL: Record<string, string> = { S: 'Sakit', I: 'Izin', A: 'Alpha' };
const STATUS_COLOR: Record<string, string> = {
  S: 'bg-semantic-blue-light text-semantic-blue',
  I: 'bg-semantic-yellow-light text-semantic-yellow',
  A: 'bg-semantic-red-light text-semantic-red',
};

export function RekapUjianPage() {
  const { kelasList, activeKelas, absenRecords, semester } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);

  const [periodeFilter, setPeriodeFilter] = useState<'UTS' | 'UAS'>('UTS');
  const [expandedMapel, setExpandedMapel] = useState<string | null>(null);

  // Ambil semua record ujian untuk kelas ini
  const ujianRecords = useMemo(() =>
    absenRecords.filter(a =>
      a.kelasId === activeKelas &&
      a.periodeUjian === periodeFilter &&
      a.mataPelajaran
    ),
    [absenRecords, activeKelas, periodeFilter]
  );

  // Daftar mapel unik, diurutkan
  const mapelList = useMemo(() => {
    const set = new Set<string>();
    ujianRecords.forEach(a => set.add(a.mataPelajaran!));
    return Array.from(set).sort();
  }, [ujianRecords]);

  // Daftar tanggal unik per mapel
  const tanggalPerMapel = useMemo(() => {
    const map: Record<string, string[]> = {};
    ujianRecords.forEach(a => {
      if (!map[a.mataPelajaran!]) map[a.mataPelajaran!] = [];
      if (!map[a.mataPelajaran!].includes(a.date)) map[a.mataPelajaran!].push(a.date);
    });
    Object.keys(map).forEach(k => map[k].sort());
    return map;
  }, [ujianRecords]);

  // Siswa yang tidak hadir per mapel: { mapel -> { studentId -> { date, status, keterangan }[] } }
  const absenPerMapel = useMemo(() => {
    const result: Record<string, Record<string, { date: string; status: string; keterangan?: string }[]>> = {};
    ujianRecords
      .filter(a => a.status !== 'H')
      .forEach(a => {
        const mapel = a.mataPelajaran!;
        if (!result[mapel]) result[mapel] = {};
        if (!result[mapel][a.studentId]) result[mapel][a.studentId] = [];
        result[mapel][a.studentId].push({ date: a.date, status: a.status, keterangan: a.keterangan });
      });
    return result;
  }, [ujianRecords]);

  // Ringkasan per siswa: berapa mapel yang tidak hadir
  const ringkasanSiswa = useMemo(() => {
    if (!kelas) return [];
    return kelas.students.map(s => {
      const mapelTidakHadir = mapelList.filter(m => absenPerMapel[m]?.[s.id]?.length > 0);
      const totalAbsen = mapelList.reduce((acc, m) => acc + (absenPerMapel[m]?.[s.id]?.length || 0), 0);
      return { ...s, mapelTidakHadir, totalAbsen };
    }).filter(s => s.totalAbsen > 0).sort((a, b) => b.totalAbsen - a.totalAbsen);
  }, [kelas, mapelList, absenPerMapel]);

  const exportExcel = () => {
    if (!kelas || mapelList.length === 0) return;

    const students = kelas.students;
    const headers = ['No', 'Nama', 'NIS', ...mapelList, 'Total Tidak Hadir'];

    const rows = students.map((s, i) => {
      const mapelCols = mapelList.map(m => {
        const records = absenPerMapel[m]?.[s.id];
        if (!records || records.length === 0) return '✓';
        return records.map(r => STATUS_LABEL[r.status] || r.status).join(', ');
      });
      const total = mapelList.reduce((acc, m) => acc + (absenPerMapel[m]?.[s.id]?.length || 0), 0);
      return [i + 1, s.name, s.nis, ...mapelCols, total].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_${periodeFilter}_${kelas.name}_${semester.tahunAjaran.replace('/', '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcelFull = () => {
    if (!kelas || mapelList.length === 0) return;
    const students = kelas.students;

    const thStyle = 'border:1px solid #ccc;padding:4px 8px;background:#f0f0f0;font-weight:bold;font-family:Arial;font-size:10pt;text-align:center';
    const tdStyle = 'border:1px solid #ccc;padding:4px 8px;font-family:Arial;font-size:10pt';
    const tdGreen = 'border:1px solid #ccc;padding:4px 8px;font-family:Arial;font-size:10pt;background:#e8f5e9;color:#2e7d32;text-align:center';
    const tdRed   = 'border:1px solid #ccc;padding:4px 8px;font-family:Arial;font-size:10pt;background:#ffebee;color:#c62828;text-align:center';

    const headerRow = `<tr>
      <th style="${thStyle}">No</th>
      <th style="${thStyle}">Nama</th>
      <th style="${thStyle}">NIS</th>
      ${mapelList.map(m => `<th style="${thStyle}">${m}</th>`).join('')}
      <th style="${thStyle}">Total Tidak Hadir</th>
    </tr>`;

    const dataRows = students.map((s, i) => {
      const mapelCols = mapelList.map(m => {
        const records = absenPerMapel[m]?.[s.id];
        if (!records || records.length === 0) return `<td style="${tdGreen}">✓</td>`;
        const label = records.map(r => STATUS_LABEL[r.status] || r.status).join(', ');
        return `<td style="${tdRed}">${label}</td>`;
      }).join('');
      const total = mapelList.reduce((acc, m) => acc + (absenPerMapel[m]?.[s.id]?.length || 0), 0);
      return `<tr>
        <td style="${tdStyle};text-align:center">${i + 1}</td>
        <td style="${tdStyle}">${s.name}</td>
        <td style="${tdStyle};font-family:monospace">${s.nis}</td>
        ${mapelCols}
        <td style="${total > 0 ? tdRed : tdGreen};font-weight:bold">${total}</td>
      </tr>`;
    }).join('');

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8"></head><body>
      <h3 style="font-family:Arial">Rekap Absensi ${periodeFilter} — Kelas ${kelas.name} — ${semester.tahunAjaran}</h3>
      <table>${headerRow}${dataRows}</table>
      </body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_${periodeFilter}_${kelas.name}_${semester.tahunAjaran.replace('/', '-')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!kelas || kelas.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <GraduationCap className="w-10 h-10 text-text-tertiary opacity-40" />
        <p className="text-text-secondary text-sm">Belum ada siswa di kelas ini.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">

      {/* Filter UTS / UAS */}
      <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
        {(['UTS', 'UAS'] as const).map(p => (
          <button key={p} onClick={() => setPeriodeFilter(p)}
            className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all ${
              periodeFilter === p ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
            }`}>
            {p}
          </button>
        ))}
      </div>

      {mapelList.length === 0 ? (
        <div className="bg-surface rounded-2xl shadow-soft p-8 flex flex-col items-center gap-3 text-center">
          <GraduationCap className="w-10 h-10 text-text-tertiary opacity-40" />
          <p className="text-sm font-semibold text-text-secondary">Belum ada data absensi {periodeFilter}</p>
          <p className="text-xs text-text-tertiary">Input absensi dengan periode {periodeFilter} dan isi mata pelajaran terlebih dahulu.</p>
        </div>
      ) : (
        <>
          {/* Ringkasan siswa bermasalah */}
          {ringkasanSiswa.length > 0 && (
            <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Siswa Tidak Hadir</span>
                <span className="ml-auto text-xs bg-semantic-red-light text-semantic-red px-2 py-0.5 rounded-full font-semibold">
                  {ringkasanSiswa.length} siswa
                </span>
              </div>
              <div className="divide-y divide-border">
                {ringkasanSiswa.map(s => (
                  <div key={s.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{s.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.mapelTidakHadir.map(m => {
                          const records = absenPerMapel[m]?.[s.id] || [];
                          const label = records.map(r => STATUS_LABEL[r.status] || r.status).join(', ');
                          return (
                            <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-semantic-red-light text-semantic-red font-semibold">
                              {m}: {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-semantic-red flex-shrink-0 bg-semantic-red-light px-2 py-1 rounded-lg">
                      {s.totalAbsen}×
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabel per mapel */}
          {mapelList.map(mapel => {
            const isExpanded = expandedMapel === mapel;
            const absenMapel = absenPerMapel[mapel] || {};
            const jumlahTidakHadir = Object.keys(absenMapel).length;
            const tanggalList = tanggalPerMapel[mapel] || [];

            return (
              <div key={mapel} className="bg-surface rounded-2xl shadow-soft overflow-hidden">
                {/* Header mapel — collapsible */}
                <button
                  onClick={() => setExpandedMapel(isExpanded ? null : mapel)}
                  className="w-full px-4 py-3 border-b border-border flex items-center gap-3 hover:bg-bg-2 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{mapel}</p>
                    <p className="text-[11px] text-text-tertiary">
                      {tanggalList.join(', ')} · {jumlahTidakHadir} siswa tidak hadir
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {jumlahTidakHadir > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-semantic-red-light text-semantic-red">
                        {jumlahTidakHadir}
                      </span>
                    )}
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-text-tertiary" />
                      : <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    }
                  </div>
                </button>

                {/* Detail siswa tidak hadir */}
                {isExpanded && (
                  <div className="divide-y divide-border">
                    {jumlahTidakHadir === 0 ? (
                      <p className="px-4 py-4 text-sm text-text-tertiary text-center">Semua siswa hadir ✓</p>
                    ) : (
                      Object.entries(absenMapel).map(([studentId, records]) => {
                        const siswa = kelas.students.find(s => s.id === studentId);
                        if (!siswa) return null;
                        return (
                          <div key={studentId} className="px-4 py-3 flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground">{siswa.name}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {records.map((r, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_COLOR[r.status] || 'bg-bg-2 text-text-secondary'}`}>
                                      {STATUS_LABEL[r.status] || r.status}
                                    </span>
                                    <span className="text-[10px] text-text-tertiary">{r.date}</span>
                                    {r.keterangan && (
                                      <span className="text-[10px] text-text-tertiary italic">"{r.keterangan}"</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Tabel rekap lengkap — scrollable */}
          <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Tabel Rekap Lengkap</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">✓ = hadir · S/I/A = tidak hadir</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-bg-2">
                    <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-text-tertiary px-4 py-2.5 sticky left-0 bg-bg-2 z-10 min-w-[140px]">Nama</th>
                    {mapelList.map(m => (
                      <th key={m} className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-2.5 min-w-[80px]">{m}</th>
                    ))}
                    <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-2.5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {kelas.students.map((s, i) => {
                    const total = mapelList.reduce((acc, m) => acc + (absenPerMapel[m]?.[s.id]?.length || 0), 0);
                    return (
                      <tr key={s.id} className={`hover:bg-bg-2 transition-colors ${i % 2 === 0 ? '' : 'bg-bg-2/30'}`}>
                        <td className="px-4 py-2.5 border-b border-border font-medium text-foreground sticky left-0 bg-surface z-10">
                          {s.name}
                        </td>
                        {mapelList.map(m => {
                          const records = absenPerMapel[m]?.[s.id];
                          if (!records || records.length === 0) {
                            return (
                              <td key={m} className="px-3 py-2.5 border-b border-border text-center text-green-600 dark:text-green-400 font-bold">
                                ✓
                              </td>
                            );
                          }
                          const label = records.map(r => STATUS_LABEL[r.status]?.[0] || r.status).join('/');
                          const firstStatus = records[0].status;
                          return (
                            <td key={m} className={`px-3 py-2.5 border-b border-border text-center font-bold text-[11px] ${
                              firstStatus === 'S' ? 'text-semantic-blue' :
                              firstStatus === 'I' ? 'text-semantic-yellow' :
                              'text-semantic-red'
                            }`}>
                              {label}
                            </td>
                          );
                        })}
                        <td className={`px-3 py-2.5 border-b border-border text-center font-bold ${total > 0 ? 'text-semantic-red' : 'text-green-600 dark:text-green-400'}`}>
                          {total > 0 ? total : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export */}
          <div className="flex gap-3">
            <button onClick={exportExcel} className="btn-soft btn-secondary-soft flex-1 py-3 gap-2 flex items-center justify-center">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={exportExcelFull} className="btn-soft btn-primary-soft flex-1 py-3 gap-2 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
