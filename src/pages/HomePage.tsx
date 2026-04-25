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
    kelasList, activeKelas, absenRecords, kasusRecords,
    namaGuru, semester, lastBackupDate, setActiveTab, setActiveStudentId
  } = useApp();

  const kelas = kelasList.find(k => k.id === activeKelas);
  const today = new Date().toISOString().split('T')[0];

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

  // Fix 5: pctHadir = (totalHariSekolah × totalSiswa - totalAbsen) / total
  // Since we only store exceptions (S/I/A), total possible = totalStudents × uniqueDates
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

  // Fix 5: weeklyData also uses exception-based count
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayExceptions = absenRecords.filter(a => a.date === dateStr && a.kelasId === activeKelas && a.status !== 'H');
      const dayAbsent = dayExceptions.length;
      return {
        day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        hadir: Math.max(0, totalStudents - dayAbsent),
        absen: dayAbsent,
      };
    });
  }, [absenRecords, activeKelas, totalStudents]);

  const pieData = [
    { name: 'Sakit', value: sakit,  color: 'hsl(211, 86%, 53%)' },
    { name: 'Izin',  value: izin,   color: 'hsl(36, 90%, 46%)'  },
    { name: 'Alpha', value: alpha,  color: 'hsl(0, 72%, 51%)'   },
  ].filter(d => d.value > 0);

  const schedule = semester.semester === 'ganjil' ? semester.ganjil : semester.genap;
  const semLabel = semester.semester === 'ganjil' ? 'Semester 1' : 'Semester 2';
  const recentKasus = kasusRecords.filter(k => k.kelasId === activeKelas).slice(-3).reverse();
  const greeting = namaGuru ? namaGuru.split(' ')[0] : 'Guru';

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* Greeting header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-heading">Halo, {greeting} 👋</h1>
          <p className="text-[13px] text-text-tertiary mt-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {kelas && <span className="kelas-pill-rich">{kelas.name}</span>}
          </div>
        </div>
      </div>

      {/* Backup alert */}
      {showBackupAlert && (
        <div className="alert-rich alert-rich-yellow flex items-start gap-3">
          <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold">
              {lastBackupDate ? 'Sudah >7 hari sejak backup terakhir' : 'Belum pernah backup data'}
            </p>
            <p className="text-[12px] opacity-75 mt-0.5">Backup data di menu Setelan untuk keamanan data Anda.</p>
          </div>
          <button
            onClick={() => setActiveTab('setelan')}
            className="text-[12px] font-semibold flex items-center gap-1 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            Backup <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Pemanggilan hari ini */}
      {todayPemanggilan.length > 0 && (
        <div className="alert-rich alert-rich-red flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 flex-shrink-0" />
            <p className="text-[13px] font-semibold flex-1">
              {todayPemanggilan.length} pemanggilan dijadwalkan hari ini
            </p>
            <button
              onClick={() => setActiveTab('kasus')}
              className="text-[12px] font-semibold flex items-center gap-1 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              Lihat <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 pl-6">
            {todayPemanggilan
              .sort((a, b) => (a.waktuPemanggilan! > b.waktuPemanggilan! ? 1 : -1))
              .map(k => (
                <button
                  key={k.id}
                  onClick={() => { setActiveStudentId(k.studentId); setActiveTab('siswa'); }}
                  className="flex items-center gap-2 text-left hover:opacity-70 transition-opacity"
                >
                  <span className="text-[11px] font-mono font-semibold opacity-80 w-10 flex-shrink-0">
                    {k.waktuPemanggilan}
                  </span>
                  <span className="text-[12px] font-semibold truncate">{k.studentName}</span>
                  <span className="text-[11px] opacity-60 truncate">— {k.description}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Stat grid removed redundant schedule pills */}

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox value={todayKasus} label="Kasus"  accentColor="accent" icon={<FileWarning className="w-4 h-4 text-primary" />} />
        <StatBox value={sakit}      label="Sakit"  accentColor="blue"   icon={<Clock className="w-4 h-4 text-semantic-blue" />} />
        <StatBox value={izin}       label="Izin"   accentColor="yellow" icon={<AlertCircle className="w-4 h-4 text-semantic-yellow" />} />
        <StatBox value={alpha}      label="Alpha"  accentColor="red"    icon={<UserX className="w-4 h-4 text-semantic-red" />} />
      </div>

      {/* Semester stats */}
      {semesterAbsen.length > 0 && (
        <div className="card-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-[13px] font-semibold text-foreground">Statistik {semLabel}</h3>
            </div>
            <span className="label-upper">{semester.tahunAjaran}</span>
          </div>

          {/* Attendance rate */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] text-text-secondary">Tingkat Kehadiran</span>
              <span className="text-[13px] font-semibold text-foreground font-mono-rich">{pctHadir}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pctHadir}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="card-inset text-center">
              <p className="text-[20px] font-bold text-primary font-mono-rich">{pctHadir}%</p>
              <p className="text-[11px] text-text-tertiary mt-0.5 label-upper">Kehadiran</p>
            </div>
            <div className="card-inset text-center">
              <p className="text-[20px] font-bold text-semantic-red font-mono-rich">
                {semesterAbsen.filter(a => a.status === 'A').length}
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5 label-upper">Alpha</p>
            </div>
            <div className="card-inset text-center">
              <p className="text-[20px] font-bold text-semantic-yellow font-mono-rich">
                {kasusRecords.filter(k => k.kelasId === activeKelas).length}
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5 label-upper">Kasus</p>
            </div>
          </div>
        </div>
      )}

      {/* Students needing attention */}
      {siswaAlert.length > 0 && (
        <div className="card-soft">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-semantic-red-light flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-semantic-red" />
            </div>
            <h3 className="text-[13px] font-semibold text-foreground">Perlu Perhatian</h3>
            <span className="ml-auto label-upper">Alpha ≥3 atau Kasus ≥3</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {siswaAlert.map(s => (
              <button
                key={s.id}
                onClick={() => { setActiveStudentId(s.id); setActiveTab('siswa'); }}
                className="student-alert-item text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{s.name}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {s.alphaCount >= 3 && (
                    <span className="badge-rich badge-red">{s.alphaCount}× Alpha</span>
                  )}
                  {s.kasusCount >= 3 && (
                    <span className="badge-rich badge-yellow">{s.kasusCount} Kasus</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly attendance chart */}
      <div className="card-soft">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-[13px] font-semibold text-foreground">Tren Kehadiran 7 Hari</h3>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={weeklyData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="hadirGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(243, 75%, 59%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(224, 8%, 62%)', fontFamily: 'Geist Mono, monospace' }}
              axisLine={false} tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid hsl(220, 13%, 89%)',
                boxShadow: '0 4px 12px rgba(0,0,0,.06)',
                fontSize: 12,
                fontFamily: 'Geist, sans-serif',
                background: 'hsl(0, 0%, 100%)',
              }}
              cursor={{ stroke: 'hsl(220, 13%, 89%)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="hadir"
              stroke="hsl(243, 75%, 59%)"
              strokeWidth={2}
              fill="url(#hadirGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(243, 75%, 59%)', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Today distribution pie */}
      {pieData.length > 0 && (
        <div className="card-soft">
          <h3 className="text-[13px] font-semibold text-foreground mb-3">Distribusi Hari Ini</h3>
          <div className="flex items-center gap-5">
            <ResponsiveContainer width={96} height={96}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={26} outerRadius={44} paddingAngle={3} startAngle={90} endAngle={-270}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[12px] text-text-secondary">{d.name}</span>
                  <span className="font-semibold text-[13px] text-foreground font-mono-rich ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent cases */}
      {recentKasus.length > 0 && (
        <div className="card-soft">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-semantic-red-light flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-semantic-red" />
            </div>
            <h3 className="text-[13px] font-semibold text-foreground">Kasus Terbaru</h3>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {recentKasus.map(k => (
              <button
                key={k.id}
                onClick={() => { setActiveStudentId(k.studentId); setActiveTab('siswa'); }}
                className="text-left py-2.5 first:pt-0 last:pb-0 hover:opacity-70 transition-opacity"
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[13px] font-semibold text-foreground">{k.studentName}</span>
                  <span className="text-[11px] text-text-tertiary font-mono-rich">{k.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">{k.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
