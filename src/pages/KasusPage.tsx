import { useState } from 'react';
import { useApp } from '@/context/AppContext';

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
    <div className="flex flex-col gap-[16px]">
      {/* Kasus Form */}
      <div className="bg-surface border border-border rounded-lg border-l-[3px] border-l-semantic-red p-[16px]">
        <h3 className="text-[14px] font-semibold text-foreground mb-[12px]">Log Kasus</h3>
        <div className="flex flex-col gap-[12px]">
          <select value={kasusStudent} onChange={e => setKasusStudent(e.target.value)} className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors">
            <option value="">Pilih siswa...</option>
            {kelas?.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={kasusCategory} onChange={e => setKasusCategory(e.target.value)} className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors">
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
            className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors resize-none"
          />
          <button onClick={handleSaveKasus} className="w-full py-[9px] bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:bg-accent-hover transition-colors">
            Simpan Kasus
          </button>
        </div>
      </div>

      {/* Catatan Anekdot Form */}
      <div className="bg-surface border border-border rounded-lg border-l-[3px] border-l-primary p-[16px]">
        <h3 className="text-[14px] font-semibold text-foreground mb-[12px]">Catatan Anekdot</h3>
        <div className="flex flex-col gap-[12px]">
          <select value={catatanStudent} onChange={e => setCatatanStudent(e.target.value)} className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors">
            <option value="">Pilih siswa...</option>
            {kelas?.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <textarea
            value={catatanContent}
            onChange={e => setCatatanContent(e.target.value)}
            placeholder="Tulis catatan anekdot..."
            rows={4}
            className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors resize-none"
          />
          <button onClick={handleSaveCatatan} className="w-full py-[9px] bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:bg-accent-hover transition-colors">
            Simpan Catatan
          </button>
        </div>
      </div>
    </div>
  );
}
