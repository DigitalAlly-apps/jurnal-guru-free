import { useApp } from '@/context/AppContext';
import { StatBox } from '@/components/StatBox';

export function HomePage() {
  const { kelasList, activeKelas, absenRecords, kasusRecords, catatanRecords } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const today = new Date().toISOString().split('T')[0];
  
  const todayAbsen = absenRecords.filter(a => a.date === today && a.kelasId === activeKelas);
  const hadir = (kelas?.students.length || 0) - todayAbsen.filter(a => a.status !== 'H').length;
  const sakit = todayAbsen.filter(a => a.status === 'S').length;
  const izin = todayAbsen.filter(a => a.status === 'I').length;
  const alpha = todayAbsen.filter(a => a.status === 'A').length;

  const recentCatatan = catatanRecords
    .filter(c => c.kelasId === activeKelas)
    .slice(-3)
    .reverse();

  const recentKasus = kasusRecords
    .filter(k => k.kelasId === activeKelas)
    .slice(-3)
    .reverse();

  return (
    <div className="flex flex-col gap-[16px]">
      <div>
        <h2 className="label-upper mb-[8px]">Statistik Hari Ini</h2>
        <div className="grid grid-cols-2 gap-[8px]">
          <StatBox value={hadir} label="Hadir" accentColor="accent" />
          <StatBox value={sakit} label="Sakit" accentColor="blue" />
          <StatBox value={izin} label="Izin" accentColor="yellow" />
          <StatBox value={alpha} label="Alpha" accentColor="red" />
        </div>
      </div>

      {todayAbsen.filter(a => a.status !== 'H').length > 0 && (
        <div>
          <h2 className="label-upper mb-[8px]">Log Absensi Hari Ini</h2>
          <div className="bg-surface border border-border rounded-lg">
            {todayAbsen.filter(a => a.status !== 'H').map((a, i, arr) => (
              <div key={a.id} className={`flex justify-between items-center px-[16px] py-[10px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-[13px] text-foreground">{a.studentName}</span>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {recentKasus.length > 0 && (
        <div>
          <h2 className="label-upper mb-[8px]">Kasus Terbaru</h2>
          <div className="bg-surface border border-border rounded-lg border-l-[3px] border-l-semantic-red">
            {recentKasus.map((k, i, arr) => (
              <div key={k.id} className={`px-[16px] py-[10px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex justify-between items-center mb-[2px]">
                  <span className="text-[13px] font-medium text-foreground">{k.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{k.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary">{k.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentCatatan.length > 0 && (
        <div>
          <h2 className="label-upper mb-[8px]">Catatan Terbaru</h2>
          <div className="bg-surface border border-border rounded-lg border-l-[3px] border-l-primary">
            {recentCatatan.map((c, i, arr) => (
              <div key={c.id} className={`px-[16px] py-[10px] ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex justify-between items-center mb-[2px]">
                  <span className="text-[13px] font-medium text-foreground">{c.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{c.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    H: 'bg-accent-light text-primary',
    S: 'bg-semantic-blue-light text-semantic-blue',
    I: 'bg-semantic-yellow-light text-semantic-yellow',
    A: 'bg-semantic-red-light text-semantic-red',
  };
  const labels: Record<string, string> = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alpha' };
  return (
    <span className={`inline-flex items-center px-[8px] py-[2px] rounded-sm text-[11px] font-medium ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
}
