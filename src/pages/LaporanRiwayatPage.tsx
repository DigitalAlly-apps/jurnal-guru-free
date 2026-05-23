import { useState } from 'react';
import { LaporanPage } from './LaporanPage';
import { RiwayatPage } from './RiwayatPage';
import { RekapUjianPage } from './RekapUjianPage';
import { BarChart3, History, GraduationCap } from 'lucide-react';

export function LaporanRiwayatPage() {
  const [tab, setTab] = useState<'laporan' | 'riwayat' | 'ujian'>('laporan');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex bg-bg-2 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab('laporan')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'laporan' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Rekap</span>
          <span className="sm:hidden">Rekap</span>
        </button>
        <button
          onClick={() => setTab('ujian')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'ujian' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Ujian</span>
        </button>
        <button
          onClick={() => setTab('riwayat')}
          className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 font-bold rounded-lg transition-all ${
            tab === 'riwayat' ? 'bg-surface shadow-soft text-foreground' : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Riwayat</span>
          <span className="sm:hidden">Riwayat</span>
        </button>
      </div>

      <div className="mt-1">
        {tab === 'laporan' && <LaporanPage />}
        {tab === 'ujian'   && <RekapUjianPage />}
        {tab === 'riwayat' && <RiwayatPage />}
      </div>
    </div>
  );
}
