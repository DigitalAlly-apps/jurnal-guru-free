import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  User, ArrowLeft, CheckCircle, AlertTriangle, BookOpen,
  Clock, Plus, Trash2, Upload, X, Pencil, Check,
} from 'lucide-react';

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-xs p-5 flex flex-col gap-4">
        <p className="text-sm text-foreground">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border bg-bg-2 text-text-secondary hover:bg-bg-3 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-semantic-red hover:bg-red-600 transition-colors">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Student Modal ────────────────────────────────────────────────────────
function EditStudentModal({ studentId, initialName, initialNis, onSave, onClose }: {
  studentId: string;
  initialName: string;
  initialNis: string;
  onSave: (name: string, nis: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [nis,  setNis]  = useState(initialNis === '-' ? '' : initialNis);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), nis.trim() || '-');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Edit Data Siswa</h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="label-upper block mb-1.5">Nama Siswa</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama lengkap siswa"
              className="input-soft"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div>
            <label className="label-upper block mb-1.5">NISN</label>
            <input
              value={nis}
              onChange={e => setNis(e.target.value)}
              placeholder="Nomor Induk Siswa Nasional"
              className="input-soft"
              inputMode="numeric"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border bg-bg-2 text-text-secondary hover:bg-bg-3 transition-colors">
            Batal
          </button>
          <button onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-40">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main SiswaPage ────────────────────────────────────────────────────────────
export function SiswaPage() {
  const {
    kelasList, activeKelas, activeStudentId, setActiveStudentId,
    absenRecords, kasusRecords, catatanRecords,
    addKelas, deleteKelas, addStudentsToKelas, removeStudentFromKelas,
    updateStudent, showToast,
  } = useApp();

  const kelas = kelasList.find(k => k.id === activeKelas);

  const [showAddKelas,   setShowAddKelas]   = useState(false);
  const [newKelasName,   setNewKelasName]   = useState('');
  const [showAddSiswa,   setShowAddSiswa]   = useState(false);
  const [addMode,        setAddMode]        = useState<'manual' | 'paste'>('manual');
  const [manualName,     setManualName]     = useState('');
  const [manualNis,      setManualNis]      = useState('');
  const [pasteText,      setPasteText]      = useState('');
  const [search,         setSearch]         = useState('');
  const [editingStudent, setEditingStudent] = useState<{ id: string; name: string; nis: string } | null>(null);
  const [confirmDialog,  setConfirmDialog]  = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Cari siswa yang aktif. Jika activeStudentId ada tapi tidak ditemukan (kelas ganti/berubah),
  // jadikan null supaya tidak blank hitam.
  const selSiswa = activeStudentId ? kelas?.students.find(s => s.id === activeStudentId) ?? null : null;

  if (selSiswa && kelas) {
    return <StudentDetail student={selSiswa} kelasId={activeKelas} kelasName={kelas.name} />;
  }

  // Jika activeStudentId ada tapi siswa sudah tidak ada, reset dengan useEffect-safe timeout
  if (activeStudentId && !selSiswa) {
    setTimeout(() => setActiveStudentId(null), 0);
  }

  const askConfirm = (message: string, onConfirm: () => void) =>
    setConfirmDialog({ message, onConfirm });

  // ── Kelas ──
  const handleAddKelas = () => {
    if (!newKelasName.trim()) return;
    addKelas(newKelasName.trim());
    setNewKelasName('');
    setShowAddKelas(false);
    showToast('Kelas berhasil ditambahkan');
  };

  const handleDeleteKelas = () => {
    if (!kelas || kelasList.length <= 1) return;
    askConfirm(`Hapus kelas ${kelas.name}? Semua data absensi kelas ini akan ikut terhapus.`, () => {
      deleteKelas(kelas.id);
      showToast('Kelas berhasil dihapus');
    });
  };

  // ── Siswa manual ──
  const handleAddManual = () => {
    if (!manualName.trim()) return;
    addStudentsToKelas(activeKelas, [{ name: manualName.trim(), nis: manualNis.trim() || '-' }]);
    setManualName('');
    setManualNis('');
    showToast('Siswa berhasil ditambahkan');
    // jangan close panel supaya guru bisa terus tambah
  };

  // ── Paste ──
  const handlePaste = () => {
    if (!pasteText.trim()) return;
    const lines    = pasteText.trim().split('\n').filter(l => l.trim());
    const students = lines.map(line => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      if (parts.length >= 3) return { name: parts[1].trim(), nis: parts[2].trim() };
      if (parts.length === 2) return { name: parts[0].trim(), nis: parts[1].trim() };
      return { name: parts[0].trim(), nis: '-' };
    }).filter(s => s.name && !/^(no|nama|nis|nisn|name|number)$/i.test(s.name));

    if (!students.length) { showToast('Tidak ada data siswa yang valid'); return; }
    addStudentsToKelas(activeKelas, students);
    setPasteText('');
    setShowAddSiswa(false);
    showToast(`${students.length} siswa berhasil ditambahkan`);
  };

  // ── Remove ──
  const handleRemove = (studentId: string, studentName: string) => {
    askConfirm(`Hapus ${studentName} dari kelas?`, () => {
      removeStudentFromKelas(activeKelas, studentId);
      showToast('Siswa berhasil dihapus');
    });
  };

  // ── Edit save ──
  const handleEditSave = (name: string, nis: string) => {
    if (!editingStudent) return;
    updateStudent(activeKelas, editingStudent.id, { name, nis });
    setEditingStudent(null);
    showToast('Data siswa diperbarui');
  };

  // ── Filter search ──
  const filteredStudents = useMemo(() =>
    (kelas?.students || []).filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search)
    ),
    [kelas, search]
  );

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* Modals */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      {editingStudent && (
        <EditStudentModal
          studentId={editingStudent.id}
          initialName={editingStudent.name}
          initialNis={editingStudent.nis}
          onSave={handleEditSave}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            {kelas?.students.length || 0} siswa terdaftar
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddKelas(true)}
            className="btn-soft btn-secondary-soft text-[12px] py-1.5 px-3 gap-1 flex items-center">
            <Plus className="w-3 h-3" /> Kelas
          </button>
          {kelasList.length > 1 && (
            <button onClick={handleDeleteKelas}
              className="btn-soft text-[12px] py-1.5 px-3 bg-semantic-red-light text-semantic-red gap-1 flex items-center">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Add Kelas */}
      {showAddKelas && (
        <div className="bg-surface rounded-2xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Tambah Kelas Baru</h3>
            <button onClick={() => setShowAddKelas(false)} className="text-text-tertiary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input value={newKelasName} onChange={e => setNewKelasName(e.target.value)}
              placeholder="Nama kelas (misal: 9A)" className="input-soft flex-1"
              onKeyDown={e => e.key === 'Enter' && handleAddKelas()} autoFocus />
            <button onClick={handleAddKelas} className="btn-soft btn-primary-soft">Tambah</button>
          </div>
        </div>
      )}

      {/* Tambah Siswa button */}
      <button onClick={() => setShowAddSiswa(!showAddSiswa)}
        className="btn-soft btn-primary-soft w-full py-3 gap-2 flex items-center justify-center">
        <Plus className="w-4 h-4" /> Tambah Siswa
      </button>

      {/* Add Siswa panel */}
      {showAddSiswa && (
        <div className="bg-surface rounded-2xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Tambah Siswa</h3>
            <button onClick={() => setShowAddSiswa(false)} className="text-text-tertiary">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab mode */}
          <div className="flex bg-bg-2 rounded-xl p-1 gap-1 mb-4">
            {(['manual', 'paste'] as const).map(m => (
              <button key={m} onClick={() => setAddMode(m)}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all ${
                  addMode === m ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary'
                }`}>
                {m === 'manual' ? 'Manual' : 'Paste dari Excel'}
              </button>
            ))}
          </div>

          {addMode === 'manual' ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="label-upper block mb-1.5">Nama Siswa</label>
                <input
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="Nama lengkap siswa"
                  className="input-soft"
                  onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                />
              </div>
              <div>
                <label className="label-upper block mb-1.5">NISN <span className="normal-case text-text-tertiary font-normal">(opsional)</span></label>
                <input
                  value={manualNis}
                  onChange={e => setManualNis(e.target.value)}
                  placeholder="Nomor Induk Siswa Nasional"
                  className="input-soft"
                  inputMode="numeric"
                  onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                />
              </div>
              <button onClick={handleAddManual} disabled={!manualName.trim()}
                className="btn-soft btn-primary-soft w-full py-2.5 disabled:opacity-40">
                + Tambah Siswa
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-bg-2 rounded-xl p-3">
                <p className="text-[11px] text-text-secondary font-medium mb-1">Format paste dari Excel:</p>
                <p className="text-[11px] text-text-tertiary">Kolom: <span className="font-mono">No | Nama | NISN</span></p>
                <p className="text-[11px] text-text-tertiary">atau: <span className="font-mono">Nama | NISN</span></p>
                <p className="text-[11px] text-text-tertiary">atau: <span className="font-mono">Nama saja</span></p>
              </div>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={"1\tAhmad Rizki\t0012345678\n2\tSiti Nurhaliza\t0012345679"}
                rows={6}
                className="input-soft resize-none font-mono text-[12px]"
              />
              <button onClick={handlePaste}
                className="btn-soft btn-primary-soft w-full py-2.5 gap-2 flex items-center justify-center">
                <Upload className="w-4 h-4" />
                Import {pasteText.trim().split('\n').filter(l => l.trim()).length} Siswa
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      {(kelas?.students.length || 0) > 5 && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau NISN..."
          className="input-soft"
        />
      )}

      {/* Daftar siswa */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary text-sm">
          {search ? 'Siswa tidak ditemukan' : 'Belum ada siswa. Tambahkan siswa di atas.'}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
          {filteredStudents.map((s, i) => {
            const alphaCount = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id && a.status === 'A').length;
            const kasusCount = kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id).length;

            return (
              <div key={s.id}
                className={`flex items-center gap-3 px-4 py-3 group hover:bg-bg-2 transition-colors ${
                  i < filteredStudents.length - 1 ? 'border-b border-border' : ''
                }`}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                  <User className="w-4.5 h-4.5 text-primary" />
                </div>

                {/* Info — tap buka detail */}
                <button className="flex-1 text-left min-w-0" onClick={() => setActiveStudentId(s.id)}>
                  <p className="text-[13px] font-semibold text-foreground truncate">{s.name}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    NISN: {s.nis === '-' ? '—' : s.nis}
                    {alphaCount > 0 && <span className="ml-2 text-semantic-red">{alphaCount}× alpha</span>}
                    {kasusCount > 0 && <span className="ml-2 text-semantic-yellow">{kasusCount} kasus</span>}
                  </p>
                </button>

                {/* Action buttons — muncul saat hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {/* Edit */}
                  <button
                    onClick={() => setEditingStudent({ id: s.id, name: s.name, nis: s.nis })}
                    className="w-7 h-7 rounded-lg hover:bg-accent-light text-text-tertiary hover:text-primary flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {/* Hapus */}
                  <button
                    onClick={() => handleRemove(s.id, s.name)}
                    className="w-7 h-7 rounded-lg hover:bg-semantic-red-light text-text-tertiary hover:text-semantic-red flex items-center justify-center transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Student Detail ────────────────────────────────────────────────────────────
function StudentDetail({ student, kelasId, kelasName }: {
  student: { id: string; name: string; nis: string };
  kelasId: string;
  kelasName: string;
}) {
  const {
    absenRecords, kasusRecords, catatanRecords,
    setActiveStudentId, updateStudent, showToast,
  } = useApp();

  const [isEditing,  setIsEditing]  = useState(false);
  const [editName,   setEditName]   = useState('');
  const [editNis,    setEditNis]    = useState('');

  const absen   = useMemo(() =>
    absenRecords.filter(a => a.kelasId === kelasId && a.studentId === student.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [absenRecords, kelasId, student.id]
  );
  const kasus   = useMemo(() =>
    kasusRecords.filter(k => k.kelasId === kelasId && k.studentId === student.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [kasusRecords, kelasId, student.id]
  );
  const catatan = useMemo(() =>
    catatanRecords.filter(c => c.kelasId === kelasId && c.studentId === student.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [catatanRecords, kelasId, student.id]
  );

  const sakitCount  = absen.filter(a => a.status === 'S').length;
  const izinCount   = absen.filter(a => a.status === 'I').length;
  const alphaCount  = absen.filter(a => a.status === 'A').length;

  const startEdit = () => {
    setEditName(student.name);
    setEditNis(student.nis === '-' ? '' : student.nis);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    updateStudent(kelasId, student.id, {
      name: editName.trim(),
      nis:  editNis.trim() || '-',
    });
    setIsEditing(false);
    showToast('Data siswa diperbarui');
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <button onClick={() => setActiveStudentId(null)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-foreground transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Profile card */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>

          {isEditing ? (
            <div className="flex-1 flex flex-col gap-2">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="input-soft py-1.5 text-sm font-semibold"
                placeholder="Nama siswa"
                autoFocus
              />
              <input
                value={editNis}
                onChange={e => setEditNis(e.target.value)}
                className="input-soft py-1.5 text-sm font-mono"
                placeholder="NISN (opsional)"
                inputMode="numeric"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" /> Simpan
                </button>
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-border bg-bg-2 text-text-secondary">
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground truncate">{student.name}</h2>
                <button onClick={startEdit}
                  className="p-1.5 rounded-lg hover:bg-bg-2 text-text-tertiary hover:text-primary transition-colors flex-shrink-0"
                  title="Edit data siswa">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary">
                NISN: <span className="font-mono">{student.nis === '-' ? '—' : student.nis}</span>
              </p>
              <p className="text-xs text-text-tertiary">Kelas {kelasName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Sakit', val: sakitCount, cls: 'text-semantic-blue bg-semantic-blue-light' },
          { label: 'Izin',  val: izinCount,  cls: 'text-semantic-yellow bg-semantic-yellow-light' },
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
        {!kasus.length ? (
          <p className="text-sm text-text-tertiary">Tidak ada kasus tercatat</p>
        ) : (
          <div className="flex flex-col gap-2">
            {kasus.map(k => (
              <div key={k.id} className="bg-bg-2 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-semantic-red-light text-semantic-red">
                    {k.category}
                  </span>
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
        {!catatan.length ? (
          <p className="text-sm text-text-tertiary">Belum ada catatan</p>
        ) : (
          <div className="flex flex-col gap-2">
            {catatan.map(c => (
              <div key={c.id} className="bg-bg-2 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-text-tertiary">{c.date}</span>
                  {c.tipe && c.tipe !== 'umum' && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      c.tipe === 'prestasi'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {c.tipe === 'prestasi' ? '🏆 Prestasi' : '📈 Perkembangan'}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat kehadiran */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Riwayat Kehadiran</h3>
        </div>
        {!absen.length ? (
          <p className="text-sm text-text-tertiary">Belum ada data kehadiran</p>
        ) : (
          <div className="flex flex-col">
            {absen.slice(0, 30).map(a => (
              <div key={a.id} className="flex justify-between items-start py-2.5 border-b border-border last:border-b-0 gap-3">
                <span className="text-[13px] text-text-secondary font-mono">{a.date}</span>
                <div className="flex flex-col items-end gap-0.5">
                  <StatusPill status={a.status} />
                  {a.keterangan && (
                    <span className="text-[11px] text-text-tertiary italic">"{a.keterangan}"</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
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
