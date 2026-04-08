import { useState } from 'react';
import { LaporanPage } from './LaporanPage';
import { RiwayatPage } from './RiwayatPage';
import { BarChart3, History } from 'lucide-react';

export function LaporanRiwayatPage() {
  const [tab, setTab] = useState<'laporan' | 'riwayat'>('laporan');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab('laporan')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'laporan' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Buku Induk Kelas (Rekap)
        </button>
        <button
          onClick={() => setTab('riwayat')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'riwayat' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <History className="w-4 h-4" /> Riwayat Harian
        </button>
      </div>

      <div className="mt-1">
        {tab === 'laporan' ? <LaporanPage /> : <RiwayatPage />}
      </div>
    </div>
  );
}
