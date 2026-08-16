import { useApp } from '@/context/AppContext';
import { AbsenPage } from './AbsenPage';
import { JurnalPage } from './JurnalPage';

export function ActivityPage() {
  const { activityView, setActivityView } = useApp();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-upper">Aktivitas guru</p>
          <h1 className="mt-1 text-lg font-bold">Catatan kelas</h1>
        </div>
        <select
          value={activityView}
          onChange={event => setActivityView(event.target.value as 'absen' | 'jurnal')}
          className="input-soft w-auto min-w-[140px] py-2 text-xs font-bold"
          aria-label="Pilih aktivitas"
        >
          <option value="absen">Absensi</option>
          <option value="jurnal">Jurnal</option>
        </select>
      </div>
      {activityView === 'absen' ? <AbsenPage /> : <JurnalPage />}
    </div>
  );
}
