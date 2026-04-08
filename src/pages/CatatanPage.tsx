import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, BookOpen, Plus, X } from 'lucide-react';
import type { CatatanRecord } from '@/types';

export function CatatanPage() {
  const { activeKelas, kelasList, catatanRecords, addCatatanRecord, setActiveStudentId, setActiveTab, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');

  const filtered = useMemo(() => {
    return catatanRecords
      .filter(c => c.kelasId === activeKelas && (
        c.studentName.toLowerCase().includes(search.toLowerCase()) ||
        c.content.toLowerCase().includes(search.toLowerCase())
      ))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [catatanRecords, activeKelas, search]);

  const handleSave = () => {
    if (!studentId || !content.trim()) {
      showToast('Pilih siswa dan isi catatan');
      return;
    }
    const student = kelas?.students.find(s => s.id === studentId);
    if (!student) return;
    const record: CatatanRecord = {
      id: `cat_${Date.now()}`,
      studentId,
      studentName: student.name,
      date,
      content: content.trim(),
      kelasId: activeKelas,
    };
    addCatatanRecord(record);
    setContent('');
    setStudentId('');
    setShowForm(false);
    showToast('Catatan berhasil disimpan');
  };

  const handleStudentClick = (sId: string) => {
    setActiveStudentId(sId);
    setActiveTab('siswa');
  };

  if (!kelas || kelas.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <BookOpen className="w-10 h-10 text-text-tertiary opacity-40" />
        <p className="text-text-secondary text-sm">Belum ada siswa di kelas ini.</p>
        <p className="text-text-tertiary text-xs">Tambahkan siswa di menu <strong>Data Siswa</strong> terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* Form Input */}
      {showForm ? (
        <div className="bg-surface rounded-2xl shadow-soft p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Catatan Baru</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-bg-2 rounded-lg text-text-tertiary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="label-upper block mb-1.5">Siswa</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} className="input-soft">
              <option value="">-- Pilih Siswa --</option>
              {kelas.students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-upper block mb-1.5">Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-soft" />
          </div>
          <div>
            <label className="label-upper block mb-1.5">Catatan / Anekdot</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tuliskan catatan perkembangan, prestasi, atau anekdot siswa..."
              rows={4}
              className="input-soft resize-none"
            />
          </div>
          <button onClick={handleSave} className="btn-soft btn-primary-soft w-full py-3">
            Simpan Catatan
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-soft btn-primary-soft w-full py-3 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Catatan Anekdot
        </button>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Cari catatan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-soft pl-10"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <BookOpen className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">Belum ada catatan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => handleStudentClick(c.studentId)}
              className="bg-surface rounded-2xl shadow-soft p-4 text-left hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-semibold text-foreground">{c.studentName}</span>
                <span className="text-[11px] text-text-tertiary">{c.date}</span>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed">{c.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
