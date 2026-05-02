import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { StatBox } from '@/components/StatBox';
import {
  UserX, Clock, AlertCircle, FileWarning, PhoneCall,
  TrendingUp, AlertTriangle, Calendar, Bell, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export function HomePage() {
  const {
    kelasList, activeKelas, absenRecords, kasusRecords, liburDates,
    namaGuru, semester, lastBackupDate, setActiveTab, setActiveStudentId
  } = useApp();

  const kelas = kelasList.find(k => k.id === activeKelas);
  const jenjangAktif = kelas?.jenjang || 'SMP';
  const today = new Date().toISOString().split('T')[0];
  const todayLibur = liburDates.find(l => l.date === today && l.jenjang === jenjangAktif);

  const todayAbsen   = absenRecords.filter(a => a.date === today && a.kelasId === activeKelas);
  const totalStudents = kelas?.students.length || 0;
  const sakit      = todayAbsen.filter(a => a.status === 'S').length;
  const izin       = todayAbsen.filter(a => a.status === 'I').length;
  const alpha      = todayAbsen.filter(a => a.status === 'A').length;
  const todayKasus = kasusRecords.filter(k => k.date === today && k.kelasId === activeKelas).length;
  const todayPemanggilan = kasusRecords.filter(k => 
    k.kelasId === activeKelas && 
    !!k.waktuPemanggilan && 
    (k.tanggalPemanggilan || k.date) === today
  );

  const showBackupAlert = useMemo(() => {
    if (!lastBackupDate) return true;
    return (new Date().getTime() - new Date(lastBackupDate).getTime()) / 86400000 > 7;
  }, [lastBackupDate]);

  const semesterAbsen = useMemo(() =>
    absenRecords.filter(a => a.kelasId === activeKelas),
    [absenRecords, activeKelas]
  );

  const pctHadir = useMemo(() => {
    if (!totalStudents || !semesterAbsen.length) return 0;
    const uniqueDates = new Set(semesterAbsen.map(a => a.date)).size;
    const totalPossible = uniqueDates * totalStudents;
    if (!totalPossible) return 0;
    const totalAbsen = semesterAbsen.filter(a => a.status !== 'H').length;
    return Math.round(((totalPossible - totalAbsen) / totalPossible) * 100);
  }, [semesterAbsen, totalStudents]);

  const siswaAlert = useMemo(() => {
    if (!kelas) return [];
    return kelas.students.map(s => {
      const alphaCount = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id && a.status === 'A').length;
      const kasusCount = kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id).length;
      return { ...s, alphaCount, kasusCount };
    })
    .filter(s => s.alphaCount >= 3 || s.kasusCount >= 3)
    .sort((a, b) => (b.alphaCount + b.kasusCount) - (a.alphaCount + a.kasusCount))
    .slice(0, 5);
  }, [kelas, absenRecords, kasusRecords, activeKelas]);

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const isLibur = liburDates.some(l => l.date === dateStr && l.jenjang === jenjangAktif);
      const dayExceptions = absenRecords.filter(a => a.date === dateStr && a.kelasId === activeKelas && a.status !== 'H');
      const dayAbsent = dayExceptions.length;
      return {
        day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        hadir: isLibur ? 0 : Math.max(0, totalStudents - dayAbsent),
        absen: isLibur ? 0 : dayAbsent,
        status: isLibur ? 'Libur' : undefined,
      };
    });
  }, [absenRecords, activeKelas, totalStudents, liburDates, jenjangAktif]);

  const pieData = [
    { name: 'Sakit', value: sakit,  color: 'hsl(var(--blue))' },
    { name: 'Izin',  value: izin,   color: 'hsl(var(--yellow))' },
    { name: 'Alpha', value: alpha,  color: 'hsl(var(--red))' },
  ].filter(d => d.value > 0);

  const semLabel = semester.semester === 'ganjil' ? 'Semester 1' : 'Semester 2';
  const recentKasus = kasusRecords.filter(k => k.kelasId === activeKelas).slice(-3).reverse();
  const greeting = namaGuru ? namaGuru.split(' ')[0] : 'Guru';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-6xl mx-auto w-full pb-10">

      {/* Header and Alerts - Full width */}
      <div className="md:col-span-12 flex flex-col gap-4 mb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="section-heading text-3xl mb-1">Halo, {greeting}! 👋</h1>
            <p className="text-[14px] text-text-tertiary">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {kelas && (
            <div className="flex items-center gap-2">
              <span className="kelas-pill-rich shadow-soft scale-105">{kelas.name}</span>
            </div>
          )}
        </div>

        {/* Backup alert */}
        {showBackupAlert && (
          <div className="alert-rich alert-rich-yellow flex items-start gap-3 mt-2">
            <Bell className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold">
                {lastBackupDate ? 'Sudah >7 hari sejak backup terakhir' : 'Belum pernah backup data'}
              </p>
              <p className="text-[13px] opacity-80 mt-0.5">Sebaiknya segera amankan data Anda di menu Setelan.</p>
            </div>
            <button
              onClick={() => setActiveTab('setelan')}
              className="text-[13px] font-bold flex items-center gap-1 flex-shrink-0 hover:opacity-75 transition-opacity py-1 px-3 bg-yellow-500/20 rounded-full"
            >
              Backup <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pemanggilan hari ini */}
        {todayLibur && (
          <div className="alert-rich alert-rich-yellow flex items-start gap-3 mt-2">
            <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-bold">Hari ini libur untuk jenjang {jenjangAktif}</p>
              <p className="text-[13px] opacity-80 mt-0.5">{todayLibur.keterangan || 'Absensi hari ini tidak perlu diisi.'}</p>
            </div>
          </div>
        )}

        {todayPemanggilan.length > 0 && (
          <div className="alert-rich alert-rich-red flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <PhoneCall className="w-4 h-4 flex-shrink-0" />
              </div>
              <p className="text-[14px] font-bold flex-1">
                Ada {todayPemanggilan.length} pemanggilan dijadwalkan hari ini!
              </p>
              <button
                onClick={() => setActiveTab('kasus')}
                className="text-[13px] font-bold flex items-center gap-1 flex-shrink-0 hover:opacity-75 transition-opacity py-1 px-3 bg-red-500/20 rounded-full"
              >
                Cek <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 pl-[42px]">
              {todayPemanggilan
                .sort((a, b) => (a.waktuPemanggilan! > b.waktuPemanggilan! ? 1 : -1))
                .map(k => (
                  <button
                    key={k.id}
                    onClick={() => { setActiveStudentId(k.studentId); setActiveTab('siswa'); }}
                    className="flex items-center gap-3 text-left hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors -ml-2"
                  >
                    <span className="text-[12px] font-mono-rich font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded flex-shrink-0">
                      {k.waktuPemanggilan}
                    </span>
                    <span className="text-[13px] font-semibold truncate">{k.studentName}</span>
                    <span className="text-[12px] opacity-70 truncate hidden sm:inline">— {k.description}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* BENTO GRID: Stat grid - spans 8 cols */}
      <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox value={todayKasus} label="Kasus"  accentColor="accent" icon={<FileWarning className="w-5 h-5 text-primary" />} />
        <StatBox value={sakit}      label="Sakit"  accentColor="blue"   icon={<Clock className="w-5 h-5 text-semantic-blue" />} />
        <StatBox value={izin}       label="Izin"   accentColor="yellow" icon={<AlertCircle className="w-5 h-5 text-semantic-yellow" />} />
        <StatBox value={alpha}      label="Alpha"  accentColor="red"    icon={<UserX className="w-5 h-5 text-semantic-red" />} />
      </div>

      {/* BENTO GRID: Semester stats - spans 4 cols */}
      <div className="md:col-span-4 card-soft flex flex-col justify-between shadow-soft-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center shadow-inner">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-[14px] font-bold text-foreground">Statistik {semLabel}</h3>
          </div>
          <span className="badge-rich badge-neutral">{semester.tahunAjaran}</span>
        </div>

        {/* Attendance rate */}
        <div className="mb-5 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[13px] font-medium text-text-secondary">Tingkat Kehadiran</span>
            <span className="text-[28px] font-black text-primary font-mono-rich leading-none">{pctHadir}%</span>
          </div>
          <div className="progress-bar h-2.5 bg-bg-3">
            <div className="progress-fill shadow-accent" style={{ width: `${pctHadir}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="card-inset text-center py-2.5">
            <p className="text-[18px] font-black text-primary font-mono-rich">{pctHadir}%</p>
            <p className="text-[10px] text-text-tertiary mt-1 label-upper">Kehadiran</p>
          </div>
          <div className="card-inset text-center py-2.5">
            <p className="text-[18px] font-black text-semantic-red font-mono-rich">
              {semesterAbsen.filter(a => a.status === 'A').length}
            </p>
            <p className="text-[10px] text-text-tertiary mt-1 label-upper">Alpha</p>
          </div>
          <div className="card-inset text-center py-2.5">
            <p className="text-[18px] font-black text-semantic-yellow font-mono-rich">
              {kasusRecords.filter(k => k.kelasId === activeKelas).length}
            </p>
            <p className="text-[10px] text-text-tertiary mt-1 label-upper">Kasus</p>
          </div>
        </div>
      </div>

      {/* BENTO GRID: Weekly attendance chart - spans 8 cols */}
      <div className="md:col-span-8 card-soft">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center shadow-inner">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-[14px] font-bold text-foreground">Tren Kehadiran 7 Hari</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="hadirGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: 'hsl(var(--text-3))', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}
              axisLine={false} tickLine={false}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 8px 30px rgba(0,0,0,.12)',
                fontSize: 13,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                background: 'hsl(var(--surface))',
              }}
              cursor={{ stroke: 'hsl(var(--border-2))', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="hadir"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              fill="url(#hadirGrad)"
              dot={{ r: 4, fill: 'hsl(var(--surface))', stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'hsl(var(--accent))', strokeWidth: 0, shadow: '0 0 10px hsl(var(--accent))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* BENTO GRID: Today distribution pie - spans 4 cols */}
      <div className="md:col-span-4 card-soft flex flex-col">
        <h3 className="text-[14px] font-bold text-foreground mb-4">Distribusi Hari Ini</h3>
        {todayLibur ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-70 text-center">
            <Calendar className="w-10 h-10 text-semantic-yellow mb-3" />
            <p className="text-[13px] font-semibold">Libur</p>
            <p className="text-[12px] text-text-tertiary mt-1">Tidak ada absensi hari ini.</p>
          </div>
        ) : pieData.length > 0 ? (
          <div className="flex items-center gap-6 flex-1 justify-center">
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={4} startAngle={90} endAngle={-270}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color, boxShadow: `0 0 8px ${d.color}66` }} />
                  <span className="text-[13px] font-medium text-text-secondary w-10">{d.name}</span>
                  <span className="font-black text-[15px] text-foreground font-mono-rich">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-60">
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-border flex items-center justify-center mb-3">
              <span className="text-[20px]">🎉</span>
            </div>
            <p className="text-[13px] font-semibold text-center">Hadir Semua!</p>
          </div>
        )}
      </div>

      {/* BENTO GRID: Students needing attention - span 6 */}
      <div className="md:col-span-6 flex flex-col h-full">
        {siswaAlert.length > 0 && (
          <div className="card-soft h-full border-red-500/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-semantic-red-light flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-semantic-red" />
              </div>
              <h3 className="text-[14px] font-bold text-foreground">Perlu Perhatian</h3>
              <span className="ml-auto text-[10px] font-bold text-text-tertiary bg-bg-2 px-2 py-1 rounded-md">ALPHA ≥3 / KASUS ≥3</span>
            </div>
            <div className="flex flex-col gap-2">
              {siswaAlert.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setActiveStudentId(s.id); setActiveTab('siswa'); }}
                  className="student-alert-item text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground truncate">{s.name}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {s.alphaCount >= 3 && (
                      <span className="badge-rich badge-red shadow-sm">{s.alphaCount}× Alpha</span>
                    )}
                    {s.kasusCount >= 3 && (
                      <span className="badge-rich badge-yellow shadow-sm">{s.kasusCount} Kasus</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BENTO GRID: Recent cases - span 6 */}
      <div className="md:col-span-6 flex flex-col h-full">
        {recentKasus.length > 0 && (
          <div className="card-soft h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-semantic-yellow-light flex items-center justify-center">
                <FileWarning className="w-4 h-4 text-semantic-yellow" />
              </div>
              <h3 className="text-[14px] font-bold text-foreground">Kasus Terbaru</h3>
            </div>
            <div className="flex flex-col divide-y divide-border/50">
              {recentKasus.map(k => (
                <button
                  key={k.id}
                  onClick={() => { setActiveStudentId(k.studentId); setActiveTab('siswa'); }}
                  className="text-left py-3 first:pt-0 last:pb-0 group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{k.studentName}</span>
                    <span className="text-[11px] text-text-tertiary font-mono-rich font-semibold bg-bg-2 px-1.5 py-0.5 rounded">{k.date}</span>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2">{k.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
