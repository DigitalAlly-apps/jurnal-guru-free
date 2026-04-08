import { useState } from 'react';
import { Plus, ClipboardCheck, AlertTriangle, BookOpen, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TabId } from '@/types';

const ACTIONS: { id: TabId; label: string; icon: typeof Plus; color: string }[] = [
  { id: 'absen',   label: 'Absensi', icon: ClipboardCheck, color: 'bg-semantic-blue text-primary-foreground' },
  { id: 'kasus',   label: 'Kasus',   icon: AlertTriangle,  color: 'bg-semantic-red text-primary-foreground'  },
  { id: 'catatan', label: 'Anekdot', icon: BookOpen,        color: 'bg-primary text-primary-foreground'       },
];

export function FAB() {
  const [open, setOpen] = useState(false);
  const { setActiveTab, activeTab } = useApp();

  // Sembunyikan di halaman setelan
  if (activeTab === 'setelan') return null;

  const handleAction = (tab: TabId) => {
    setActiveTab(tab);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col-reverse items-end gap-3">

      {/* Tombol utama */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft-lg transition-all duration-200 ${
          open
            ? 'bg-bg-3 text-text-secondary rotate-45'
            : 'bg-primary text-primary-foreground hover:shadow-lg hover:scale-105'
        }`}
        style={{ boxShadow: open ? undefined : '0 4px 20px hsl(var(--accent) / 0.3)' }}
      >
        {open ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>

      {/* Action items — muncul saat open */}
      {open && (
        <div className="flex flex-col gap-2">
          {ACTIONS.map((action, i) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="flex items-center gap-3 animate-fab-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-xs font-medium text-text-secondary bg-surface px-3 py-1.5 rounded-lg shadow-soft whitespace-nowrap">
                {action.label}
              </span>
              <span className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-content-center shadow-soft flex items-center justify-center`}>
                <action.icon className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop — klik luar untuk tutup */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/10 -z-10"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
