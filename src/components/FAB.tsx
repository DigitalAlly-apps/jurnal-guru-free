import { Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function FAB() {
  const { activeTab, setActiveTab } = useApp();
  const showOnTabs = ['absen', 'kasus', 'catatan'];
  if (!showOnTabs.includes(activeTab)) return null;

  const handleClick = () => {
    if (activeTab !== 'absen') setActiveTab('absen');
  };

  return (
    <div className="fixed bottom-6 right-5 z-50 animate-fab-in">
      <button className="fab-rich" onClick={handleClick} title="Aksi Cepat">
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
