import { useApp } from '@/context/AppContext';
import type { TabId } from '@/types';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Beranda', icon: '⌂' },
  { id: 'absen', label: 'Absen', icon: '✓' },
  { id: 'kasus', label: 'Kasus', icon: '!' },
  { id: 'laporan', label: 'Laporan', icon: '≡' },
  { id: 'catatan', label: 'Catatan', icon: '✎' },
  { id: 'setelan', label: 'Setelan', icon: '⚙' },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-surface border-t border-border flex z-50">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-[3px] relative transition-colors duration-150 ${
            activeTab === tab.id ? 'text-primary' : 'text-text-tertiary'
          }`}
        >
          {activeTab === tab.id && (
            <span className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-primary rounded-b-sm" />
          )}
          <span className="text-[18px] leading-none">{tab.icon}</span>
          <span className="text-[10px] font-medium tracking-[.03em]">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
