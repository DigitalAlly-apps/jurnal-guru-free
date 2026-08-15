import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Download, FileSpreadsheet, Search } from 'lucide-react';

type Period = 'semester' | 'bulan' | 'semua';

export function LaporanPage() {
  const { kelasList, activeKelas, absenRecords, kasusRecords, catatanRecords, semester } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const [tab, setTab] = useState<'pantauan' | 'rekap'>('pantauan');
  const [period, setPeriod] = useState<Period>('semester');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inPeriod = (date: string) => {
    if (period === 'semua') return true;
    const value = new Date(`${date}T00:00:00`), now = new Date();
    if (period === 'bulan') return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
    const start = Number(semester.tahunAjaran.split('/')[0]);
    return value.getFullYear() === (semester.semester === 'ganjil' ? start : start + 1) && (semester.semester === 'ganjil' ? value.getMonth() >= 6 : value.getMonth() <= 5);
  };
  const rows = useMemo(() => (kelas?.students || []).map(s => {
    const absen = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id && inPeriod(a.date));
    const cases = kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id && inPeriod(k.date));
    const sakit = absen.filter(a => a.status === 'S').length, izin = absen.filter(a => a.status === 'I').length, alpha = absen.filter(a => a.status === 'A').length;
    const aktif = cases.filter(k => k.status === 'baru' || k.status === 'proses').length;
    return { ...s, sakit, izin, alpha, aktif, tidakHadir: sakit + izin + alpha };
  }).sort((a, b) => b.aktif - a.aktif || b.alpha - a.alpha || b.tidakHadir - a.tidakHadir || a.name.localeCompare(b.name)), [kelas, absenRecords, kasusRecords, activeKelas, period, semester]);
  const selected = rows.find(s => s.id === selectedId);
  const totals = rows.reduce((r, s) => ({ alpha: r.alpha + s.alpha, si: r.si + s.sakit + s.izin, aktif: r.aktif + s.aktif }), { alpha: 0, si: 0, aktif: 0 });
  const exportFile = (kind: 'csv' | 'xls') => {
    const headings = ['No', 'Nama', 'NIS', 'Sakit', 'Izin', 'Alpha', 'Kasus aktif'];
    const values = rows.map((s, i) => [i + 1, s.name, s.nis, s.sakit, s.izin, s.alpha, s.aktif]);
    const content = kind === 'csv' ? [headings, ...values].map(row => row.join(',')).join('\n') : `<html><meta charset="utf-8"><table><tr>${headings.map(h => `<th>${h}</th>`).join('')}</tr>${values.map(row => `<tr>${row.map(v => `<td>${v ?? ''}</td>`).join('')}</tr>`).join('')}</table></html>`;
    const blob = new Blob([kind === 'csv' ? '\ufeff' + content : content], { type: kind === 'csv' ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `buku_induk_${kelas?.name || 'kelas'}.${kind}`; link.click(); URL.revokeObjectURL(link.href);
  };
  if (!kelas) return <p className="py-16 text-center text-sm text-text-tertiary">Pilih kelas terlebih dahulu.</p>;
  if (selected) {
    const history = [
      ...absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === selected.id && inPeriod(a.date)).map(a => ({ id: `a-${a.id}`, date: a.date, label: `Absensi · ${a.status === 'S' ? 'Sakit' : a.status === 'I' ? 'Izin' : 'Alpha'}`, note: a.keterangan })),
      ...kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === selected.id && inPeriod(k.date)).map(k => ({ id: `k-${k.id}`, date: k.date, label: `Kasus · ${k.category}`, note: k.description })),
      ...catatanRecords.filter(c => c.kelasId === activeKelas && c.studentId === selected.id && inPeriod(c.date)).map(c => ({ id: `c-${c.id}`, date: c.date, label: `Catatan · ${c.tipe || 'umum'}`, note: c.content })),
    ].sort((a, b) => b.date.localeCompare(a.date));
    return <div className="mx-auto max-w-3xl space-y-4"><button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-xs font-bold text-text-secondary"><ArrowLeft className="w-4 h-4" /> Kembali ke pantauan</button><section className="rounded-2xl bg-surface p-5 shadow-soft"><p className="label-upper">Buku Induk Siswa</p><h2 className="mt-1 text-xl font-bold">{selected.name}</h2><p className="text-xs text-text-tertiary">{selected.nis || 'NIS belum diisi'}</p><div className="mt-4 grid grid-cols-4 gap-2"><Metric label="Sakit" value={selected.sakit} /><Metric label="Izin" value={selected.izin} /><Metric label="Alpha" value={selected.alpha} danger /><Metric label="Kasus aktif" value={selected.aktif} danger={selected.aktif > 0} /></div></section><section className="overflow-hidden rounded-2xl bg-surface shadow-soft"><div className="border-b border-border px-4 py-3"><h3 className="text-sm font-bold">Riwayat siswa</h3><p className="text-xs text-text-tertiary">Absensi, kasus, dan catatan</p></div>{history.length ? history.map(item => <div key={item.id} className="border-b border-border px-4 py-3 last:border-0"><div className="flex justify-between gap-2"><b className="text-xs">{item.label}</b><span className="text-[11px] text-text-tertiary">{item.date}</span></div>{item.note && <p className="mt-1 text-xs text-text-secondary">{item.note}</p>}</div>) : <p className="p-8 text-center text-xs text-text-tertiary">Belum ada riwayat pada periode ini.</p>}</section></div>;
  }
  const shown = rows.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-4xl space-y-4"><div className="flex rounded-xl bg-bg-2 p-1"><button onClick={() => setTab('pantauan')} className={`flex-1 rounded-lg py-2.5 text-xs font-bold ${tab === 'pantauan' ? 'bg-surface shadow-soft' : 'text-text-tertiary'}`}>Pantauan siswa</button><button onClick={() => setTab('rekap')} className={`flex-1 rounded-lg py-2.5 text-xs font-bold ${tab === 'rekap' ? 'bg-surface shadow-soft' : 'text-text-tertiary'}`}>Rekap kelas</button></div><div className="flex gap-2 overflow-x-auto">{([['semester','Semester aktif'],['bulan','Bulan ini'],['semua','Semua data']] as [Period,string][]).map(([id,label]) => <button key={id} onClick={() => setPeriod(id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${period === id ? 'bg-primary text-primary-foreground' : 'bg-bg-2 text-text-secondary'}`}>{label}</button>)}</div><div className="grid grid-cols-4 gap-2"><Metric label="Siswa" value={rows.length} /><Metric label="Alpha" value={totals.alpha} danger={totals.alpha > 0} /><Metric label="Sakit/Izin" value={totals.si} /><Metric label="Kasus aktif" value={totals.aktif} danger={totals.aktif > 0} /></div>{tab === 'pantauan' ? <><label className="relative block"><Search className="absolute left-3 top-1/2 w-4 -translate-y-1/2 text-text-tertiary" /><input className="input-soft w-full pl-10" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama siswa" /></label><section className="overflow-hidden rounded-2xl bg-surface shadow-soft"><div className="border-b border-border p-4"><h2 className="text-sm font-bold">Siswa yang perlu dipantau</h2><p className="text-xs text-text-tertiary">Kasus aktif dan ketidakhadiran terbanyak tampil dahulu.</p></div>{shown.map((s, i) => <button key={s.id} onClick={() => setSelectedId(s.id)} className="flex w-full items-center gap-3 border-b border-border p-4 text-left last:border-0 hover:bg-bg-2"><span className="w-5 text-center text-[11px] text-text-tertiary">{i + 1}</span><div className="min-w-0 flex-1"><b className="block truncate text-sm">{s.name}</b><span className="text-[11px] text-text-tertiary">S {s.sakit} · I {s.izin} · A {s.alpha}</span></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${s.aktif ? 'bg-semantic-red-light text-semantic-red' : s.tidakHadir ? 'bg-semantic-yellow-light text-semantic-yellow' : 'bg-accent-light text-primary'}`}>{s.aktif ? `${s.aktif} kasus aktif` : s.tidakHadir ? 'Perlu dipantau' : 'Aman'}</span></button>)}</section></> : <><section className="overflow-x-auto rounded-2xl bg-surface shadow-soft"><table className="w-full text-sm"><thead className="bg-bg-2 text-[11px] uppercase text-text-tertiary"><tr><th className="p-3 text-left">Nama</th><th>S</th><th>I</th><th>A</th><th>Kasus</th></tr></thead><tbody>{rows.map(s => <tr key={s.id} className="border-t border-border"><td className="p-3 font-medium">{s.name}</td><td className="text-center">{s.sakit}</td><td className="text-center">{s.izin}</td><td className="text-center text-semantic-red">{s.alpha}</td><td className="text-center">{s.aktif}</td></tr>)}</tbody></table></section><div className="flex gap-2"><button onClick={() => exportFile('csv')} className="btn-soft btn-secondary-soft flex-1 py-3"><Download className="w-4 h-4" /> CSV</button><button onClick={() => exportFile('xls')} className="btn-soft btn-primary-soft flex-1 py-3"><FileSpreadsheet className="w-4 h-4" /> Excel</button></div></>}</div>;
}

function Metric({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) { return <div className="rounded-xl bg-surface p-3 text-center shadow-soft"><b className={danger ? 'text-semantic-red' : ''}>{value}</b><p className="mt-1 text-[9px] font-bold uppercase text-text-tertiary">{label}</p></div>; }
