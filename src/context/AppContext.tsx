import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Kelas, AbsenRecord, KasusRecord, CatatanRecord, TabId, SemesterConfig, BackupData, JadwalSlot } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────
function ls<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ─── defaults ───────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();
const DEFAULT_SEMESTER: SemesterConfig = {
  tahunAjaran: `${currentYear}/${currentYear + 1}`,
  semester: new Date().getMonth() < 6 ? 'genap' : 'ganjil',
  ganjil: { utsStart: '', utsEnd: '', uasStart: '', uasEnd: '' },
  genap:  { utsStart: '', utsEnd: '', uasStart: '', uasEnd: '' },
};

// ─── Fix 3: Zod-lite validation for importBackup ─────────────────────────────
function validateBackup(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'string') return false;
  if (!Array.isArray(d.kelasList)) return false;
  // kelasList items must have id/name/students
  for (const k of d.kelasList as unknown[]) {
    if (!k || typeof k !== 'object') return false;
    const kk = k as Record<string, unknown>;
    if (typeof kk.id !== 'string' || typeof kk.name !== 'string' || !Array.isArray(kk.students)) return false;
  }
  return true;
}

// ─── Fix 2: addAbsenRecords — exception-based, drop status H ─────────────────
// Records with status H are NOT stored; presence is inferred from absence of S/I/A.
// When editing an existing non-H record to H, the record is deleted.

interface AppState {
  namaGuru: string;
  setNamaGuru: (name: string) => void;
  lastBackupDate: string | null;
  setLastBackupDate: (d: string) => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  activeKelas: string;
  setActiveKelas: (id: string) => void;
  activeStudentId: string | null;
  setActiveStudentId: (id: string | null) => void;
  kelasList: Kelas[];
  setKelasList: React.Dispatch<React.SetStateAction<Kelas[]>>;
  addKelas: (name: string) => void;
  deleteKelas: (id: string) => void;
  addStudentsToKelas: (kelasId: string, students: { name: string; nis: string }[]) => void;
  removeStudentFromKelas: (kelasId: string, studentId: string) => void;
  updateStudent: (kelasId: string, studentId: string, updates: { name?: string; nis?: string }) => void;
  absenRecords: AbsenRecord[];
  addAbsenRecords: (records: AbsenRecord[]) => void;
  updateAbsenRecord: (id: string, updates: Partial<AbsenRecord>) => void;
  deleteAbsenRecord: (id: string) => void;
  kasusRecords: KasusRecord[];
  addKasusRecord: (record: KasusRecord) => void;
  updateKasusRecord: (id: string, updates: Partial<KasusRecord>) => void;
  deleteKasusRecord: (id: string) => void;
  catatanRecords: CatatanRecord[];
  addCatatanRecord: (record: CatatanRecord) => void;
  jadwalList: JadwalSlot[];
  addJadwal: (slot: JadwalSlot) => void;
  deleteJadwal: (id: string) => void;
  toasts: { id: string; message: string }[];
  showToast: (message: string) => void;
  semester: SemesterConfig;
  setSemester: React.Dispatch<React.SetStateAction<SemesterConfig>>;
  exportBackup: () => void;
  importBackup: (data: BackupData) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ── Fix 1: All state loaded from localStorage ──────────────────────────────
  const [namaGuru,       setNamaGuruRaw]   = useState(() => ls<string>('jg_namaGuru', ''));
  const [lastBackupDate, setLastBackupRaw] = useState(() => ls<string | null>('jg_lastBackup', null));
  const [activeTab,      setActiveTabRaw]  = useState<TabId>(() => ls<TabId>('jg_activeTab', 'home'));
  const [activeKelas,    setActiveKelasRaw]= useState<string>(() => ls<string>('jg_activeKelas', ''));
  const [activeStudentId,setActiveStudentId] = useState<string | null>(null);
  const [kelasList,      setKelasListRaw]  = useState<Kelas[]>(() => ls<Kelas[]>('jg_kelasList', []));
  const [absenRecords,   setAbsenRecordsRaw] = useState<AbsenRecord[]>(() => ls<AbsenRecord[]>('jg_absenRecords', []));
  const [kasusRecords,   setKasusRecordsRaw] = useState<KasusRecord[]>(() => ls<KasusRecord[]>('jg_kasusRecords', []));
  const [catatanRecords, setCatatanRecordsRaw] = useState<CatatanRecord[]>(() => ls<CatatanRecord[]>('jg_catatanRecords', []));
  const [jadwalList,     setJadwalListRaw] = useState<JadwalSlot[]>(() => ls<JadwalSlot[]>('jg_jadwalList', []));
  const [toasts,         setToasts]        = useState<{ id: string; message: string }[]>([]);
  const [semester,       setSemesterRaw]   = useState<SemesterConfig>(() => ls<SemesterConfig>('jg_semester', DEFAULT_SEMESTER));

  // ── Fix 1: Wrapped setters that also persist ──────────────────────────────
  const setNamaGuru = useCallback((v: string) => {
    setNamaGuruRaw(v); save('jg_namaGuru', v);
  }, []);
  const setLastBackupDate = useCallback((v: string) => {
    setLastBackupRaw(v); save('jg_lastBackup', v);
  }, []);
  const setActiveTab = useCallback((v: TabId) => {
    setActiveTabRaw(v); save('jg_activeTab', v);
  }, []);
  const setActiveKelas = useCallback((v: string) => {
    setActiveKelasRaw(v); save('jg_activeKelas', v);
<<<<<<< HEAD
    // Reset student detail view when kelas changes
    setActiveStudentId(null);
=======
>>>>>>> 6ac2e35e7f5848e6370ad1d220fd2929a6cbde28
  }, []);
  const setSemester: React.Dispatch<React.SetStateAction<SemesterConfig>> = useCallback((v) => {
    setSemesterRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_semester', next);
      return next;
    });
  }, []);
  const setKelasList: React.Dispatch<React.SetStateAction<Kelas[]>> = useCallback((v) => {
    setKelasListRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_kelasList', next);
      return next;
    });
  }, []);
  const setAbsenRecords = useCallback((v: React.SetStateAction<AbsenRecord[]>) => {
    setAbsenRecordsRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_absenRecords', next);
      return next;
    });
  }, []);
  const setKasusRecords = useCallback((v: React.SetStateAction<KasusRecord[]>) => {
    setKasusRecordsRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_kasusRecords', next);
      return next;
    });
  }, []);
  const setCatatanRecords = useCallback((v: React.SetStateAction<CatatanRecord[]>) => {
    setCatatanRecordsRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_catatanRecords', next);
      return next;
    });
  }, []);
  const setJadwalList = useCallback((v: React.SetStateAction<JadwalSlot[]>) => {
    setJadwalListRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_jadwalList', next);
      return next;
    });
  }, []);

  // ── Auto-set activeKelas ───────────────────────────────────────────────────
  useEffect(() => {
    if (kelasList.length > 0 && !kelasList.find(k => k.id === activeKelas)) {
      setActiveKelas(kelasList[0].id);
    }
    if (kelasList.length === 0) setActiveKelas('');
  }, [kelasList]);

  const showToast = useCallback((message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // ── Fix 2: exception-based absen — H is dropped, editing to H deletes ─────
  const addAbsenRecords = useCallback((records: AbsenRecord[]) => {
    setAbsenRecords(prev => {
      // Remove any existing record for same studentId+date+kelasId
      const deduped = prev.filter(p =>
        !records.some(r => r.studentId === p.studentId && r.date === p.date && r.kelasId === p.kelasId)
      );
      // Only store non-H (exceptions: S, I, A)
      const exceptions = records.filter(r => r.status !== 'H');
      return [...deduped, ...exceptions];
    });
  }, []);

  const updateAbsenRecord = useCallback((id: string, updates: Partial<AbsenRecord>) => {
    setAbsenRecords(prev => {
      // Fix 2: if updated status is H, delete the record (H = hadir = no exception)
      if (updates.status === 'H') {
        return prev.filter(r => r.id !== id);
      }
      return prev.map(r => r.id === id ? { ...r, ...updates } : r);
    });
  }, []);

  const deleteAbsenRecord = useCallback((id: string) => {
    setAbsenRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const addKasusRecord = useCallback((record: KasusRecord) => {
    setKasusRecords(prev => [...prev, record]);
  }, []);
  const updateKasusRecord = useCallback((id: string, updates: Partial<KasusRecord>) => {
    setKasusRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);
  const deleteKasusRecord = useCallback((id: string) => {
    setKasusRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const addCatatanRecord = useCallback((record: CatatanRecord) => {
    setCatatanRecords(prev => [...prev, record]);
  }, []);

  const addJadwal = useCallback((slot: JadwalSlot) => {
    setJadwalList(prev => [...prev, slot]);
  }, []);
  const deleteJadwal = useCallback((id: string) => {
    setJadwalList(prev => prev.filter(j => j.id !== id));
  }, []);

  const addKelas = useCallback((name: string) => {
    const id = 'k_' + Date.now();
    setKelasList(prev => [...prev, { id, name, students: [] }]);
    setActiveKelas(id);
  }, []);
  const deleteKelas = useCallback((id: string) => {
    setKelasList(prev => prev.filter(k => k.id !== id));
  }, []);
  const addStudentsToKelas = useCallback((kelasId: string, students: { name: string; nis: string }[]) => {
    setKelasList(prev => prev.map(k => {
      if (k.id !== kelasId) return k;
      const newStudents = students.map((s, i) => ({
        id: `${kelasId}_${Date.now()}_${i}`,
        name: s.name.trim(), nis: s.nis.trim(),
      })).filter(s => s.name);
      return { ...k, students: [...k.students, ...newStudents] };
    }));
  }, []);
  const updateStudent = useCallback((kelasId: string, studentId: string, updates: { name?: string; nis?: string }) => {
    setKelasList(prev => prev.map(k =>
      k.id !== kelasId ? k : {
        ...k,
        students: k.students.map(s =>
          s.id !== studentId ? s : { ...s, ...updates }
        )
      }
    ));
  }, []);
  const removeStudentFromKelas = useCallback((kelasId: string, studentId: string) => {
    setKelasList(prev => prev.map(k =>
      k.id !== kelasId ? k : { ...k, students: k.students.filter(s => s.id !== studentId) }
    ));
  }, []);

  const resetAll = useCallback(() => {
    setNamaGuru('');
    setKelasList([]);
    setAbsenRecords([]);
    setKasusRecords([]);
    setCatatanRecords([]);
    setJadwalList([]);
    setLastBackupDate('');
    setActiveKelas('');
    setSemester(DEFAULT_SEMESTER);
    // Clear all localStorage keys
    ['jg_namaGuru','jg_lastBackup','jg_activeTab','jg_activeKelas',
     'jg_kelasList','jg_absenRecords','jg_kasusRecords','jg_catatanRecords',
     'jg_jadwalList','jg_semester'].forEach(k => localStorage.removeItem(k));
    showToast('Semua data berhasil direset');
  }, [showToast]);

  const exportBackup = useCallback(() => {
    const data: BackupData = {
      version: '3.0', exportedAt: new Date().toISOString(),
      namaGuru, semester, kelasList, absenRecords, kasusRecords, catatanRecords, jadwalList,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_jurnal_guru_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const today = new Date().toISOString().split('T')[0];
    setLastBackupDate(today);
    showToast('Backup berhasil diunduh');
  }, [namaGuru, semester, kelasList, absenRecords, kasusRecords, catatanRecords, jadwalList, showToast]);

  // ── Fix 3: Zod-lite validation, reject corrupt/random JSON ────────────────
  const importBackup = useCallback((data: BackupData) => {
    if (!validateBackup(data)) {
      showToast('❌ Format backup tidak valid atau file corrupt');
      return;
    }
    if (data.namaGuru) setNamaGuru(data.namaGuru);
    setKelasList(data.kelasList);
    setAbsenRecords(data.absenRecords || []);
    setKasusRecords(data.kasusRecords || []);
    setCatatanRecords(data.catatanRecords || []);
    if (data.jadwalList) setJadwalList(data.jadwalList);
    if (data.semester) setSemester(data.semester);
    if (data.kelasList.length > 0) setActiveKelas(data.kelasList[0].id);
    showToast('✅ Data berhasil dipulihkan dari backup');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      namaGuru, setNamaGuru,
      lastBackupDate, setLastBackupDate,
      activeTab, setActiveTab,
      activeKelas, setActiveKelas,
      activeStudentId, setActiveStudentId,
      kelasList, setKelasList,
      addKelas, deleteKelas, addStudentsToKelas, removeStudentFromKelas, updateStudent,
      absenRecords, addAbsenRecords, updateAbsenRecord, deleteAbsenRecord,
      kasusRecords, addKasusRecord, updateKasusRecord, deleteKasusRecord,
      catatanRecords, addCatatanRecord,
      jadwalList, addJadwal, deleteJadwal,
      toasts, showToast,
      semester, setSemester,
      exportBackup, importBackup, resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
