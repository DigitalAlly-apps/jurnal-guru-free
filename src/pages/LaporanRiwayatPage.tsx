import { LaporanPage } from './LaporanPage';
import { RiwayatPage } from './RiwayatPage';
import { RekapUjianPage } from './RekapUjianPage';
import { useApp } from '@/context/AppContext';

export function LaporanRiwayatPage() {
  const { reportView, setReportView } = useApp();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-upper">Buku induk</p>
          <h1 className="mt-1 text-lg font-bold">Laporan kelas</h1>
        </div>
        <select value={reportView} onChange={event => setReportView(event.target.value as 'pantauan' | 'ujian' | 'riwayat')} className="input-soft w-auto min-w-[140px] py-2 text-xs font-bold" aria-label="Pilih laporan">
          <option value="pantauan">Pantauan</option>
          <option value="ujian">Ujian</option>
          <option value="riwayat">Riwayat</option>
        </select>
      </div>

      <div className="mt-1">
        {reportView === 'pantauan' && <LaporanPage />}
        {reportView === 'ujian'   && <RekapUjianPage />}
        {reportView === 'riwayat' && <RiwayatPage />}
      </div>
    </div>
  );
}
