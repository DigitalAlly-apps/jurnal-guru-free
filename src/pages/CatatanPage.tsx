import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export function CatatanPage() {
  const { activeKelas, catatanRecords } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return catatanRecords
      .filter(c => c.kelasId === activeKelas && (
        c.studentName.toLowerCase().includes(search.toLowerCase()) ||
        c.content.toLowerCase().includes(search.toLowerCase())
      ))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [catatanRecords, activeKelas, search]);

  return (
    <div className="flex flex-col gap-[12px]">
      <input
        type="text"
        placeholder="Cari catatan..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="px-[12px] py-[9px] bg-surface border border-border rounded-md text-[14px] text-foreground outline-none focus:border-primary transition-colors"
      />

      {filtered.length === 0 ? (
        <p className="text-[13px] text-text-tertiary text-center py-[32px]">Belum ada catatan</p>
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          {filtered.map((c, i) => (
            <div key={c.id} className={`px-[16px] py-[12px] ${i < filtered.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="flex justify-between items-center mb-[4px]">
                <span className="text-[13px] font-medium text-foreground">{c.studentName}</span>
                <span className="text-[11px] text-text-tertiary">{c.date}</span>
              </div>
              <p className="text-[13px] text-text-secondary leading-[1.5]">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
