import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, BookOpen } from 'lucide-react';

export function KasusPage() {
  const { kelasList, activeKelas, addKasusRecord, addCatatanRecord, showToast } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);

  const [kasusStudent, setKasusStudent] = useState('');
  const [kasusCategory, setKasusCategory] = useState('');
  const [kasusDesc, setKasusDesc] = useState('');

  const [catatanStudent, setCatatanStudent] = useState('');
  const [catatanContent, setCatatanContent] = useState('');

  const handleSaveKasus = () => {
    if (!kasusStudent || !kasusDesc) return;
    const student = kelas?.students.find(s => s.id === kasusStudent);
    addKasusRecord({
      id: Date.now().toString(),
      studentId: kasusStudent,
      studentName: student?.name || '',
      date: new Date().toISOString().split('T')[0],
      description: kasusDesc,
      category: kasusCategory || 'Umum',
      kelasId: activeKelas,
    });
    setKasusStudent(''); setKasusCategory(''); setKasusDesc('');
    showToast('Kasus berhasil disimpan');
  };

  const handleSaveCatatan = () => {
    if (!catatanStudent || !catatanContent) return;
    const student = kelas?.students.find(s => s.id === catatanStudent);
    addCatatanRecord({
      id: Date.now().toString(),
      studentId: catatanStudent,
      studentName: student?.name || '',
      date: new Date().toISOString().split('T')[0],
      content: catatanContent,
      kelasId: activeKelas,
    });
    setCatatanStudent(''); setCatatanContent('');
    showToast('Catatan anekdot berhasil disimpan');
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Kasus Form */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-semantic-red-light flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-semantic-red" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Log Kasus</h3>
        </div>
        <div className="flex flex-col gap-3">
          <select value={kasusStudent} onChange={e => setKasusStudent(e.target.value)} className="input-soft">
            <option value="">Pilih siswa...</option>
            {kelas?.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={kasusCategory} onChange={e => setKasusCategory(e.target.value)} className="input-soft">
            <option value="">Kategori...</option>
            <option value="Akademik">Akademik</option>
            <option value="Perilaku">Perilaku</option>
            <option value="Kedisiplinan">Kedisiplinan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
          <textarea
            value={kasusDesc}
            onChange={e => setKasusDesc(e.target.value)}
            placeholder="Deskripsi kasus..."
            rows={3}
            className="input-soft resize-none"
          />
          <button onClick={handleSaveKasus} className="btn-soft btn-primary-soft w-full py-3">
            Simpan Kasus
          </button>
        </div>
      </div>

      {/* Catatan Anekdot Form */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Catatan Anekdot</h3>
        </div>
        <div className="flex flex-col gap-3">
          <select value={catatanStudent} onChange={e => setCatatanStudent(e.target.value)} className="input-soft">
            <option value="">Pilih siswa...</option>
            {kelas?.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <textarea
            value={catatanContent}
            onChange={e => setCatatanContent(e.target.value)}
            placeholder="Tulis catatan anekdot..."
            rows={4}
            className="input-soft resize-none"
          />
          <button onClick={handleSaveCatatan} className="btn-soft btn-primary-soft w-full py-3">
            Simpan Catatan
          </button>
        </div>
      </div>
    </div>
  );
}
