import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, BookOpen } from 'lucide-react';

export function CatatanPage() {
  const { activeKelas, catatanRecords, setActiveStudentId, setActiveTab } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return catatanRecords
      .filter(c => c.kelasId === activeKelas && (
        c.studentName.toLowerCase().includes(search.toLowerCase()) ||
        c.content.toLowerCase().includes(search.toLowerCase())
      ))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [catatanRecords, activeKelas, search]);

  const handleStudentClick = (studentId: string) => {
    setActiveStudentId(studentId);
    setActiveTab('siswa');
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
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
              className="bg-surface rounded-2xl shadow-soft p-4 text-left hover:shadow-soft-md transition-all"
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
