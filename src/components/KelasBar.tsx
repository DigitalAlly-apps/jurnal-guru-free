import { useApp } from '@/context/AppContext';

export function KelasBar() {
  const { kelasList, activeKelas, setActiveKelas } = useApp();

  return (
    <div className="flex gap-0 border-b border-border bg-surface px-[16px] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {kelasList.map(k => (
        <button
          key={k.id}
          onClick={() => setActiveKelas(k.id)}
          className={`px-[14px] py-[10px] text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
            activeKelas === k.id
              ? 'text-primary border-primary'
              : 'text-text-tertiary border-transparent'
          }`}
        >
          Kelas {k.name}
        </button>
      ))}
    </div>
  );
}
