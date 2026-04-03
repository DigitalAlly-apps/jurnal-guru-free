import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { StatBox } from '@/components/StatBox';
import { CheckCircle, UserX, Clock, AlertCircle, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function HomePage() {
  const { kelasList, activeKelas, absenRecords, kasusRecords, catatanRecords, setActiveTab, setActiveStudentId } = useApp();
  const kelas = kelasList.find(k => k.id === activeKelas);
  const today = new Date().toISOString().split('T')[0];

  const todayAbsen = absenRecords.filter(a => a.date === today && a.kelasId === activeKelas);
  const totalStudents = kelas?.students.length || 0;
  const sakit = todayAbsen.filter(a => a.status === 'S').length;
  const izin = todayAbsen.filter(a => a.status === 'I').length;
  const alpha = todayAbsen.filter(a => a.status === 'A').length;
  const hadir = totalStudents - sakit - izin - alpha;

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayAbsen = absenRecords.filter(a => a.date === dateStr && a.kelasId === activeKelas);
      const dayAbsent = dayAbsen.filter(a => a.status !== 'H').length;
      const dayPresent = totalStudents - dayAbsent;
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });
      data.push({ day: dayLabel, hadir: Math.max(0, dayPresent), absen: dayAbsent });
    }
    return data;
  }, [absenRecords, activeKelas, totalStudents]);

  // Pie chart data
  const pieData = [
    { name: 'Hadir', value: hadir, color: 'hsl(152, 32%, 42%)' },
    { name: 'Sakit', value: sakit, color: 'hsl(215, 50%, 55%)' },
    { name: 'Izin', value: izin, color: 'hsl(38, 55%, 50%)' },
    { name: 'Alpha', value: alpha, color: 'hsl(4, 52%, 58%)' },
  ].filter(d => d.value > 0);

  const recentCatatan = catatanRecords.filter(c => c.kelasId === activeKelas).slice(-3).reverse();
  const recentKasus = kasusRecords.filter(k => k.kelasId === activeKelas).slice(-3).reverse();

  const handleStudentClick = (studentId: string) => {
    setActiveStudentId(studentId);
    setActiveTab('siswa');
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Selamat Datang! 👋</h2>
        <p className="text-sm text-text-secondary mt-1">Kelas {kelas?.name} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox value={hadir} label="Hadir" accentColor="accent" icon={<CheckCircle className="w-4 h-4 text-primary" />} />
        <StatBox value={sakit} label="Sakit" accentColor="blue" icon={<Clock className="w-4 h-4 text-semantic-blue" />} />
        <StatBox value={izin} label="Izin" accentColor="yellow" icon={<AlertCircle className="w-4 h-4 text-semantic-yellow" />} />
        <StatBox value={alpha} label="Alpha" accentColor="red" icon={<UserX className="w-4 h-4 text-semantic-red" />} />
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-surface rounded-2xl shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Tren Kehadiran Mingguan</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="hadirGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 32%, 42%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(152, 32%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(25, 8%, 66%)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.08)', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="hadir" stroke="hsl(152, 32%, 42%)" strokeWidth={2.5} fill="url(#hadirGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Attendance Pie */}
      {totalStudents > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Distribusi Kehadiran Hari Ini</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
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
              <button
                key={k.id}
                onClick={() => handleStudentClick(k.studentId)}
                className="text-left bg-bg-2 rounded-xl p-3 hover:bg-bg-3 transition-colors"
              >
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

      {/* Recent Catatan */}
      {recentCatatan.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Catatan Terbaru</h3>
          </div>
          <div className="flex flex-col gap-2">
            {recentCatatan.map(c => (
              <button
                key={c.id}
                onClick={() => handleStudentClick(c.studentId)}
                className="text-left bg-bg-2 rounded-xl p-3 hover:bg-bg-3 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-medium text-foreground">{c.studentName}</span>
                  <span className="text-[11px] text-text-tertiary">{c.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">{c.content}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
