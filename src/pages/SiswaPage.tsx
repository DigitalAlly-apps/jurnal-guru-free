import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { User, ArrowLeft, CheckCircle, AlertTriangle, BookOpen, Clock } from 'lucide-react';

export function SiswaPage() {
  const { kelasList, activeKelas, activeStudentId, setActiveStudentId, absenRecords, kasusRecords, catatanRecords } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);

  // If a student is selected, show detail
  if (activeStudentId) {
    return <StudentDetail />;
  }

  // Show student list with cards
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <p className="text-sm text-text-secondary">{kelas?.students.length} siswa terdaftar</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {kelas?.students.map(s => {
          const absen = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id);
          const kasusCount = kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id).length;
          const catatanCount = catatanRecords.filter(c => c.kelasId === activeKelas && c.studentId === s.id).length;
          const alphaCount = absen.filter(a => a.status === 'A').length;
          
          return (
            <button
              key={s.id}
              onClick={() => setActiveStudentId(s.id)}
              className="bg-surface rounded-2xl shadow-soft p-4 text-left hover:shadow-soft-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                  <p className="text-[11px] text-text-tertiary">{s.nis}</p>
                </div>
              </div>
              <div className="flex gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-semantic-red">
                  <AlertTriangle className="w-3 h-3" /> {kasusCount} kasus
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <BookOpen className="w-3 h-3" /> {catatanCount} catatan
                </span>
                {alphaCount > 0 && (
                  <span className="flex items-center gap-1 text-semantic-yellow">
                    <Clock className="w-3 h-3" /> {alphaCount} alpha
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StudentDetail() {
  const { kelasList, activeKelas, activeStudentId, setActiveStudentId, absenRecords, kasusRecords, catatanRecords } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const student = kelas?.students.find(s => s.id === activeStudentId);

  const absen = useMemo(() =>
    absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === activeStudentId).sort((a, b) => b.date.localeCompare(a.date)),
    [absenRecords, activeKelas, activeStudentId]
  );

  const kasus = useMemo(() =>
    kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === activeStudentId).sort((a, b) => b.date.localeCompare(a.date)),
    [kasusRecords, activeKelas, activeStudentId]
  );

  const catatan = useMemo(() =>
    catatanRecords.filter(c => c.kelasId === activeKelas && c.studentId === activeStudentId).sort((a, b) => b.date.localeCompare(a.date)),
    [catatanRecords, activeKelas, activeStudentId]
  );

  if (!student) return null;

  const hadirCount = absen.filter(a => a.status === 'H').length;
  const sakitCount = absen.filter(a => a.status === 'S').length;
  const izinCount = absen.filter(a => a.status === 'I').length;
  const alphaCount = absen.filter(a => a.status === 'A').length;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Back button */}
      <button
        onClick={() => setActiveStudentId(null)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Profile header */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
            <p className="text-sm text-text-secondary">NIS: {student.nis} · Kelas {kelas?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Hadir', val: hadirCount, cls: 'text-primary bg-accent-light' },
          { label: 'Sakit', val: sakitCount, cls: 'text-semantic-blue bg-semantic-blue-light' },
          { label: 'Izin', val: izinCount, cls: 'text-semantic-yellow bg-semantic-yellow-light' },
          { label: 'Alpha', val: alphaCount, cls: 'text-semantic-red bg-semantic-red-light' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 text-center ${s.cls}`}>
            <span className="text-lg font-bold block">{s.val}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Kasus */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-semantic-red" />
          <h3 className="text-sm font-semibold text-foreground">Kasus ({kasus.length})</h3>
        </div>
        {kasus.length === 0 ? (
          <p className="text-sm text-text-tertiary">Tidak ada kasus tercatat</p>
        ) : (
          <div className="flex flex-col gap-2">
            {kasus.map(k => (
              <div key={k.id} className="bg-bg-2 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-semantic-red-light text-semantic-red">{k.category}</span>
                  <span className="text-[11px] text-text-tertiary">{k.date}</span>
                </div>
                <p className="text-[13px] text-text-secondary">{k.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Catatan */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Catatan Anekdot ({catatan.length})</h3>
        </div>
        {catatan.length === 0 ? (
          <p className="text-sm text-text-tertiary">Belum ada catatan</p>
        ) : (
          <div className="flex flex-col gap-2">
            {catatan.map(c => (
              <div key={c.id} className="bg-bg-2 rounded-xl p-3">
                <span className="text-[11px] text-text-tertiary block mb-1">{c.date}</span>
                <p className="text-[13px] text-text-secondary leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Absen history */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Riwayat Kehadiran</h3>
        </div>
        {absen.length === 0 ? (
          <p className="text-sm text-text-tertiary">Belum ada data kehadiran</p>
        ) : (
          <div className="flex flex-col">
            {absen.slice(0, 10).map(a => (
              <div key={a.id} className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0">
                <span className="text-[13px] text-text-secondary">{a.date}</span>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    H: 'bg-accent-light text-primary',
    S: 'bg-semantic-blue-light text-semantic-blue',
    I: 'bg-semantic-yellow-light text-semantic-yellow',
    A: 'bg-semantic-red-light text-semantic-red',
  };
  const labels: Record<string, string> = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alpha' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
}
