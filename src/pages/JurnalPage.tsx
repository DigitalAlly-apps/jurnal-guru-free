import { useState } from 'react';
import { KasusPage } from './KasusPage';
import { CatatanPage } from './CatatanPage';
import { RiwayatPage } from './RiwayatPage';
import { AlertTriangle, BookOpen, History } from 'lucide-react';

export function JurnalPage() {
  const [tab, setTab] = useState<'kasus' | 'catatan' | 'riwayat'>('kasus');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab('kasus')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'kasus' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Kasus
        </button>
        <button
          onClick={() => setTab('catatan')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'catatan' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Anekdot
        </button>
        <button
          onClick={() => setTab('riwayat')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'riwayat' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <History className="w-4 h-4" /> Riwayat
        </button>
      </div>

      <div className="mt-1">
        {tab === 'kasus' && <KasusPage />}
        {tab === 'catatan' && <CatatanPage />}
        {tab === 'riwayat' && <RiwayatPage />}
      </div>
    </div>
  );
}
