import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { StatBox } from '@/components/StatBox';
import { CheckCircle, UserX, Clock, AlertCircle, TrendingUp, AlertTriangle, Calendar, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function HomePage() {
  const { kelasList, activeKelas, absenRecords, kasusRecords, namaGuru, semester, lastBackupDate, setActiveTab, setActiveStudentId } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const today = new Date().toISOString().split('T')[0];

  const todayAbsen = absenRecords.filter(a => a.date === today && a.kelasId === activeKelas);
  const totalStudents = kelas?.students.length || 0;
  const sakit  = todayAbsen.filter(a => a.status === 'S').length;
  const izin   = todayAbsen.filter(a => a.status === 'I').length;
  const alpha  = todayAbsen.filter(a => a.status === 'A').length;
  const hadir  = totalStudents > 0 && todayAbsen.length > 0 ? totalStudents - sakit - izin - alpha : 0;

  // Backup alert — jika > 7 hari belum backup
  const showBackupAlert = useMemo(() => {
    if (!lastBackupDate) return true;
    const diff = (new Date().getTime() - new Date(lastBackupDate).getTime()) / 86400000;
    return diff > 7;
  }, [lastBackupDate]);

  // Semester stats
  const semesterAbsen = useMemo(() => {
    return absenRecords.filter(a => a.kelasId === activeKelas);
  }, [absenRecords, activeKelas]);

  const pctHadir = useMemo(() => {
    const total = semesterAbsen.length;
    if (!total) return 0;
    return Math.round((semesterAbsen.filter(a => a.status === 'H').length / total) * 100);
  }, [semesterAbsen]);

  // Siswa bermasalah (alpha >= 3 atau kasus >= 3)
  const siswaAlert = useMemo(() => {
    if (!kelas) return [];
    return kelas.students.map(s => {
      const alphaCount = absenRecords.filter(a => a.kelasId === activeKelas && a.studentId === s.id && a.status === 'A').length;
      const kasusCount = kasusRecords.filter(k => k.kelasId === activeKelas && k.studentId === s.id).length;
      return { ...s, alphaCount, kasusCount };
    }).filter(s => s.alphaCount >= 3 || s.kasusCount >= 3)
      .sort((a, b) => (b.alphaCount + b.kasusCount) - (a.alphaCount + a.kasusCount))
      .slice(0, 5);
  }, [kelas, absenRecords, kasusRecords, activeKelas]);

  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayAbsen  = absenRecords.filter(a => a.date === dateStr && a.kelasId === activeKelas);
      const dayAbsent = dayAbsen.filter(a => a.status !== 'H').length;
      data.push({
        day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        hadir: Math.max(0, totalStudents - dayAbsent),
        absen: dayAbsent,
      });
    }
    return data;
  }, [absenRecords, activeKelas, totalStudents]);

  const pieData = [
    { name: 'Hadir', value: hadir,  color: 'hsl(152, 32%, 42%)' },
    { name: 'Sakit', value: sakit,  color: 'hsl(215, 50%, 55%)' },
    { name: 'Izin',  value: izin,   color: 'hsl(38, 55%, 50%)'  },
    { name: 'Alpha', value: alpha,  color: 'hsl(4, 52%, 58%)'   },
  ].filter(d => d.value > 0);

  const schedule = semester.semester === 'ganjil' ? semester.ganjil : semester.genap;
  const semLabel = semester.semester === 'ganjil' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)';
  const greeting = namaGuru ? `Halo, ${namaGuru}! 👋` : 'Selamat Datang! 👋';

  const recentKasus = kasusRecords.filter(k => k.kelasId === activeKelas).slice(-3).reverse();

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-foreground">{greeting}</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-xs text-text-tertiary mt-0.5">{semester.tahunAjaran} · {semLabel}</p>
      </div>

      {/* Backup Alert */}
      {showBackupAlert && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3">
          <Bell className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {lastBackupDate ? 'Sudah lebih dari 7 hari sejak backup terakhir' : 'Belum pernah backup data'}
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">Segera backup data di menu Setelan.</p>
          </div>
          <button onClick={() => setActiveTab('setelan')} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex-shrink-0">
            Backup →
          </button>
        </div>
      )}

      {/* UTS/UAS pills */}
      {(schedule.utsStart || schedule.uasStart) && (
        <div className="flex flex-wrap gap-2">
          {schedule.utsStart && (
            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full font-medium">
              UTS: {schedule.utsStart}{schedule.utsEnd ? ` – ${schedule.utsEnd}` : ''}
            </span>
          )}
          {schedule.uasStart && (
            <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full font-medium">
              UAS: {schedule.uasStart}{schedule.uasEnd ? ` – ${schedule.uasEnd}` : ''}
            </span>
          )}
        </div>
      )}

      {/* Stats hari ini */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox value={hadir} label="Hadir"  accentColor="accent"  icon={<CheckCircle className="w-4 h-4 text-primary" />} />
        <StatBox value={sakit} label="Sakit"  accentColor="blue"    icon={<Clock className="w-4 h-4 text-semantic-blue" />} />
        <StatBox value={izin}  label="Izin"   accentColor="yellow"  icon={<AlertCircle className="w-4 h-4 text-semantic-yellow" />} />
        <StatBox value={alpha} label="Alpha"  accentColor="red"     icon={<UserX className="w-4 h-4 text-semantic-red" />} />
      </div>

      {/* Statistik Semester */}
      {semesterAbsen.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Statistik Semester</h3>
            <span className="ml-auto text-xs text-text-tertiary">{semLabel}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-bg-2 rounded-xl p-3">
              <p className="text-xl font-bold text-primary">{pctHadir}%</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">Rata Kehadiran</p>
            </div>
            <div className="bg-bg-2 rounded-xl p-3">
              <p className="text-xl font-bold text-semantic-red">{semesterAbsen.filter(a => a.status === 'A').length}</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">Total Alpha</p>
            </div>
            <div className="bg-bg-2 rounded-xl p-3">
              <p className="text-xl font-bold text-semantic-yellow">{kasusRecords.filter(k => k.kelasId === activeKelas).length}</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">Total Kasus</p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Siswa Bermasalah */}
      {siswaAlert.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-semantic-red" />
            <h3 className="text-sm font-semibold text-foreground">Perlu Perhatian</h3>
            <span className="ml-auto text-[11px] text-text-tertiary">Alpha ≥3 atau Kasus ≥3</span>
          </div>
          <div className="flex flex-col gap-2">
            {siswaAlert.map(s => (
              <button key={s.id} onClick={() => { setActiveStudentId(s.id); setActiveTab('siswa'); }}
                className="flex items-center gap-3 bg-bg-2 rounded-xl p-3 hover:bg-bg-3 transition-colors text-left">
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-foreground">{s.name}</p>
                </div>
                <div className="flex gap-2">
                  {s.alphaCount >= 3 && (
                    <span className="text-[11px] font-semibold bg-semantic-red-light text-semantic-red px-2 py-0.5 rounded-full">
                      {s.alphaCount}× Alpha
                    </span>
                  )}
                  {s.kasusCount >= 3 && (
                    <span className="text-[11px] font-semibold bg-semantic-yellow-light text-semantic-yellow px-2 py-0.5 rounded-full">
                      {s.kasusCount} Kasus
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Tren Kehadiran Mingguan</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="hadirGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(152, 32%, 42%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(152, 32%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(25, 8%, 66%)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.08)', fontSize: 12 }} />
            <Area type="monotone" dataKey="hadir" stroke="hsl(152, 32%, 42%)" strokeWidth={2.5} fill="url(#hadirGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie hari ini */}
      {totalStudents > 0 && todayAbsen.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Distribusi Kehadiran Hari Ini</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-text-secondary">{d.name}</span>
                  <span className="font-semibold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Kasus */}
      {recentKasus.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-semantic-red" />
            <h3 className="text-sm font-semibold text-foreground">Kasus Terbaru</h3>
          </div>
          <div className="flex flex-col gap-2">
            {recentKasus.map(k => (
              <button key={k.id} onClick={() => { setActiveStudentId(k.studentId); setActiveTab('siswa'); }}
                className="text-left bg-bg-2 rounded-xl p-3 hover:bg-bg-3 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-medium text-foreground">{k.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{k.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">{k.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
