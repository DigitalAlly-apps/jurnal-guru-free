import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Kelas, AbsenRecord, KasusRecord, CatatanRecord, TabId, SemesterConfig, BackupData, JadwalSlot, LiburDate, Jenjang, ConfirmedDate, PeriodeUjian } from '@/types';
import { storageGet, storageSet, storageRemove, initStorage } from '@/lib/storage';
import { useAutoBackup } from '@/hooks/use-auto-backup';

// ─── helpers (sekarang pakai IndexedDB via storage layer) ────────────────────
function ls<T>(key: string, fallback: T): T {
  return storageGet<T>(key, fallback);
}
function save(key: string, value: unknown) {
  storageSet(key, value);
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
  addKelas: (name: string, jenjang?: Jenjang) => void;
  deleteKelas: (id: string) => void;
  addStudentsToKelas: (kelasId: string, students: { name: string; nis: string }[]) => void;
  removeStudentFromKelas: (kelasId: string, studentId: string) => void;
  updateStudent: (kelasId: string, studentId: string, updates: { name?: string; nis?: string }) => void;
  absenRecords: AbsenRecord[];
  addAbsenRecords: (records: AbsenRecord[]) => void;
  updateAbsenRecord: (id: string, updates: Partial<AbsenRecord>) => void;
  deleteAbsenRecord: (id: string) => void;
  deleteAbsenRecordsByDateAndJenjang: (date: string, jenjang: Jenjang) => void;
  kasusRecords: KasusRecord[];
  addKasusRecord: (record: KasusRecord) => void;
  updateKasusRecord: (id: string, updates: Partial<KasusRecord>) => void;
  deleteKasusRecord: (id: string) => void;
  catatanRecords: CatatanRecord[];
  addCatatanRecord: (record: CatatanRecord) => void;
  updateCatatanRecord: (id: string, updates: Partial<CatatanRecord>) => void;
  deleteCatatanRecord: (id: string) => void;
  jadwalList: JadwalSlot[];
  addJadwal: (slot: JadwalSlot) => void;
  deleteJadwal: (id: string) => void;
  liburDates: LiburDate[];
  addLiburDate: (libur: LiburDate) => void;
  deleteLiburDate: (id: string) => void;
  confirmedDates: ConfirmedDate[];
  confirmDate: (kelasId: string, date: string, periodeUjian?: PeriodeUjian, mataPelajaran?: string) => void;
  unconfirmDate: (kelasId: string, date: string) => void;
  isDateConfirmed: (kelasId: string, date: string) => boolean;
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
  const [liburDates,     setLiburDatesRaw] = useState<LiburDate[]>(() => ls<LiburDate[]>('jg_liburDates', []));
  const [confirmedDates, setConfirmedDatesRaw] = useState<ConfirmedDate[]>(() => ls<ConfirmedDate[]>('jg_confirmedDates', []));
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
    // Reset student detail view when kelas changes
    setActiveStudentId(null);
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
  const setLiburDates = useCallback((v: React.SetStateAction<LiburDate[]>) => {
    setLiburDatesRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_liburDates', next);
      return next;
    });
  }, []);
  const setConfirmedDates = useCallback((v: React.SetStateAction<ConfirmedDate[]>) => {
    setConfirmedDatesRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      save('jg_confirmedDates', next);
      return next;
    });
  }, []);

  // ── Inisialisasi IndexedDB storage saat pertama mount ─────────────────────
  useEffect(() => {
    initStorage().catch(() => {/* fallback ke localStorage sudah ditangani di storage.ts */});
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

  const deleteAbsenRecordsByDateAndJenjang = useCallback((date: string, jenjang: Jenjang) => {
    const kelasIds = new Set(kelasList.filter(k => (k.jenjang || 'SMP') === jenjang).map(k => k.id));
    setAbsenRecords(prev => prev.filter(r => !(r.date === date && kelasIds.has(r.kelasId))));
  }, [kelasList]);

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
  const updateCatatanRecord = useCallback((id: string, updates: Partial<CatatanRecord>) => {
    setCatatanRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);
  const deleteCatatanRecord = useCallback((id: string) => {
    setCatatanRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const addJadwal = useCallback((slot: JadwalSlot) => {
    setJadwalList(prev => [...prev, slot]);
  }, []);
  const deleteJadwal = useCallback((id: string) => {
    setJadwalList(prev => prev.filter(j => j.id !== id));
  }, []);
  const addLiburDate = useCallback((libur: LiburDate) => {
    setLiburDates(prev => {
      const filtered = prev.filter(l => !(l.jenjang === libur.jenjang && l.date === libur.date));
      return [...filtered, libur];
    });
  }, []);
  const deleteLiburDate = useCallback((id: string) => {
    setLiburDates(prev => prev.filter(l => l.id !== id));
  }, []);

  const confirmDate = useCallback((kelasId: string, date: string, periodeUjian?: PeriodeUjian, mataPelajaran?: string) => {
    setConfirmedDates(prev => {
      const filtered = prev.filter(c => !(c.kelasId === kelasId && c.date === date));
      return [...filtered, { id: `${kelasId}_${date}`, kelasId, date, periodeUjian, mataPelajaran }];
    });
  }, []);
  const unconfirmDate = useCallback((kelasId: string, date: string) => {
    setConfirmedDates(prev => prev.filter(c => !(c.kelasId === kelasId && c.date === date)));
  }, []);
  const isDateConfirmed = useCallback((kelasId: string, date: string) => {
    return confirmedDates.some(c => c.kelasId === kelasId && c.date === date);
  }, [confirmedDates]);

  const addKelas = useCallback((name: string, jenjang: Jenjang = 'SMP') => {
    const id = 'k_' + Date.now();
    setKelasList(prev => [...prev, { id, name, jenjang, students: [] }]);
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
    setLiburDates([]);
    setConfirmedDates([]);
    setLastBackupDate('');
    setActiveKelas('');
    setSemester(DEFAULT_SEMESTER);
    // Clear all storage keys (IDB + localStorage)
    ['jg_namaGuru','jg_lastBackup','jg_activeTab','jg_activeKelas',
     'jg_kelasList','jg_absenRecords','jg_kasusRecords','jg_catatanRecords',
     'jg_jadwalList','jg_liburDates','jg_semester','jg_autobackup','jg_confirmedDates'].forEach(k => storageRemove(k));
    showToast('Semua data berhasil direset');
  }, [showToast]);

  const exportBackup = useCallback(() => {
    const data: BackupData = {
      version: '5.0', exportedAt: new Date().toISOString(),
      namaGuru, semester, kelasList, absenRecords, kasusRecords, catatanRecords, jadwalList, liburDates, confirmedDates,
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
  }, [namaGuru, semester, kelasList, absenRecords, kasusRecords, catatanRecords, jadwalList, liburDates, showToast]);

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
    if (data.liburDates) setLiburDates(data.liburDates);
    if (data.confirmedDates) setConfirmedDates(data.confirmedDates);
    if (data.semester) setSemester(data.semester);
    if (data.kelasList.length > 0) setActiveKelas(data.kelasList[0].id);
    showToast('✅ Data berhasil dipulihkan dari backup');
  }, [showToast]);

  // ── Auto-backup: snapshot ke IDB setiap ada perubahan, auto-download kalau >3 hari ──
  const autoBackupData: BackupData = {
    version: '5.0',
    exportedAt: new Date().toISOString(),
    namaGuru, semester, kelasList, absenRecords, kasusRecords, catatanRecords, jadwalList, liburDates, confirmedDates,
  };
  useAutoBackup({
    data: autoBackupData,
    lastBackupDate,
    onAutoBackupDone: (date) => {
      setLastBackupDate(date);
      showToast('💾 Auto-backup berhasil diunduh');
    },
  });

  return (
    <AppContext.Provider value={{
      namaGuru, setNamaGuru,
      lastBackupDate, setLastBackupDate,
      activeTab, setActiveTab,
      activeKelas, setActiveKelas,
      activeStudentId, setActiveStudentId,
      kelasList, setKelasList,
      addKelas, deleteKelas, addStudentsToKelas, removeStudentFromKelas, updateStudent,
      absenRecords, addAbsenRecords, updateAbsenRecord, deleteAbsenRecord, deleteAbsenRecordsByDateAndJenjang,
      kasusRecords, addKasusRecord, updateKasusRecord, deleteKasusRecord,
      catatanRecords, addCatatanRecord, updateCatatanRecord, deleteCatatanRecord,
      jadwalList, addJadwal, deleteJadwal,
      liburDates, addLiburDate, deleteLiburDate,
      confirmedDates, confirmDate, unconfirmDate, isDateConfirmed,
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
