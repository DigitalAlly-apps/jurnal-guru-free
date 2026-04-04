import { useMemo, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { User, ArrowLeft, CheckCircle, AlertTriangle, BookOpen, Clock, Plus, Trash2, Upload, X } from 'lucide-react';

export function SiswaPage() {
  const { kelasList, activeKelas, activeStudentId, setActiveStudentId, absenRecords, kasusRecords, catatanRecords, addKelas, deleteKelas, addStudentsToKelas, removeStudentFromKelas, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const [showAddKelas, setShowAddKelas] = useState(false);
  const [newKelasName, setNewKelasName] = useState('');
  const [showAddSiswa, setShowAddSiswa] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'paste'>('manual');
  const [manualName, setManualName] = useState('');
  const [manualNis, setManualNis] = useState('');
  const [pasteText, setPasteText] = useState('');

  if (activeStudentId) {
    return <StudentDetail />;
  }

  const handleAddKelas = () => {
    if (!newKelasName.trim()) return;
    addKelas(newKelasName.trim());
    setNewKelasName('');
    setShowAddKelas(false);
    showToast('Kelas berhasil ditambahkan');
  };

  const handleDeleteKelas = () => {
    if (!kelas || kelasList.length <= 1) return;
    if (confirm(`Hapus kelas ${kelas.name}?`)) {
      deleteKelas(kelas.id);
      showToast('Kelas berhasil dihapus');
    }
  };

  const handleAddManual = () => {
    if (!manualName.trim()) return;
    addStudentsToKelas(activeKelas, [{ name: manualName, nis: manualNis || '-' }]);
    setManualName('');
    setManualNis('');
    showToast('Siswa berhasil ditambahkan');
  };

  const handlePaste = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.trim().split('\n').filter(l => l.trim());
    const students = lines.map(line => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      // Try: No | Name | NIS or Name | NIS or just Name
      if (parts.length >= 3) {
        // Assume: No, Name, NIS
        return { name: parts[1].trim(), nis: parts[2].trim() };
      } else if (parts.length === 2) {
        // Assume: Name, NIS
        return { name: parts[0].trim(), nis: parts[1].trim() };
      }
      return { name: parts[0].trim(), nis: '-' };
    }).filter(s => s.name && !/^(no|nama|nis|name|number)$/i.test(s.name));
    
    if (students.length === 0) {
      showToast('Tidak ada data siswa yang valid');
      return;
    }
    addStudentsToKelas(activeKelas, students);
    setPasteText('');
    setShowAddSiswa(false);
    showToast(`${students.length} siswa berhasil ditambahkan`);
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    if (confirm(`Hapus ${studentName} dari kelas?`)) {
      removeStudentFromKelas(activeKelas, studentId);
      showToast('Siswa berhasil dihapus');
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Class management */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{kelas?.students.length || 0} siswa terdaftar</p>
        <div className="flex gap-2">
          <button onClick={() => setShowAddKelas(true)} className="btn-soft btn-secondary-soft text-[12px] py-1.5 px-3 gap-1">
            <Plus className="w-3 h-3" /> Kelas
          </button>
          {kelasList.length > 1 && (
            <button onClick={handleDeleteKelas} className="btn-soft text-[12px] py-1.5 px-3 bg-semantic-red-light text-semantic-red gap-1">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Add Kelas Modal */}
      {showAddKelas && (
        <div className="bg-surface rounded-2xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Tambah Kelas Baru</h3>
            <button onClick={() => setShowAddKelas(false)} className="text-text-tertiary"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2">
            <input value={newKelasName} onChange={e => setNewKelasName(e.target.value)} placeholder="Nama kelas (misal: 9A)" className="input-soft flex-1" onKeyDown={e => e.key === 'Enter' && handleAddKelas()} />
            <button onClick={handleAddKelas} className="btn-soft btn-primary-soft">Tambah</button>
          </div>
        </div>
      )}

      {/* Add Student */}
      <button onClick={() => setShowAddSiswa(!showAddSiswa)} className="btn-soft btn-primary-soft w-full py-3 gap-2">
        <Plus className="w-4 h-4" /> Tambah Siswa
      </button>

      {showAddSiswa && (
        <div className="bg-surface rounded-2xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Tambah Siswa</h3>
            <button onClick={() => setShowAddSiswa(false)} className="text-text-tertiary"><X className="w-4 h-4" /></button>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-bg-2 rounded-xl p-1 gap-1 mb-3">
            <button onClick={() => setAddMode('manual')} className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all ${addMode === 'manual' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary'}`}>
              Manual
            </button>
            <button onClick={() => setAddMode('paste')} className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all ${addMode === 'paste' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary'}`}>
              Paste dari Excel
            </button>
          </div>

          {addMode === 'manual' ? (
            <div className="flex flex-col gap-2">
              <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Nama siswa" className="input-soft" />
              <input value={manualNis} onChange={e => setManualNis(e.target.value)} placeholder="NIS (opsional)" className="input-soft" />
              <button onClick={handleAddManual} className="btn-soft btn-primary-soft w-full py-2.5">Tambah</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-text-tertiary">Copy dari Excel lalu paste di sini. Format: Nama, NIS (satu baris per siswa). Kolom Nomor otomatis dilewati.</p>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={"1\tAhmad Rizki\t2024001\n2\tSiti Nurhaliza\t2024002\n\natau:\n\nAhmad Rizki, 2024001\nSiti Nurhaliza, 2024002"}
                rows={6}
                className="input-soft resize-none font-mono text-[12px]"
              />
              <button onClick={handlePaste} className="btn-soft btn-primary-soft w-full py-2.5 gap-2">
                <Upload className="w-4 h-4" /> Import {pasteText.trim().split('\n').filter(l => l.trim()).length} Siswa
              </button>
            </div>
          )}
        </div>
      )}

      {/* Student Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {kelas?.students.map(s => {
          const absen = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id);
          const kasusCount = kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id).length;
          const catatanCount = catatanRecords.filter(c => c.kelasId === activeKelas && c.studentId === s.id).length;
          const alphaCount = absen.filter(a => a.status === 'A').length;

          return (
            <div key={s.id} className="bg-surface rounded-2xl shadow-soft p-4 hover:shadow-soft-md transition-all group relative">
              <button onClick={() => setActiveStudentId(s.id)} className="text-left w-full">
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
              <button
                onClick={() => handleRemoveStudent(s.id, s.name)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-semantic-red-light text-text-tertiary hover:text-semantic-red"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
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
      <button onClick={() => setActiveStudentId(null)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-foreground transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

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
