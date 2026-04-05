import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Kelas, AbsenRecord, KasusRecord, CatatanRecord, TabId, SemesterConfig, BackupData, JadwalSlot } from '@/types';

const DEFAULT_KELAS: Kelas[] = [];
const currentYear = new Date().getFullYear();
const DEFAULT_SEMESTER: SemesterConfig = {
  tahunAjaran: `${currentYear}/${currentYear + 1}`,
  semester: new Date().getMonth() < 6 ? 'genap' : 'ganjil',
  ganjil: { utsStart: '', utsEnd: '', uasStart: '', uasEnd: '' },
  genap:  { utsStart: '', utsEnd: '', uasStart: '', uasEnd: '' },
};

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
  const [namaGuru, setNamaGuru] = useState('');
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeKelas, setActiveKelas] = useState('');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>(DEFAULT_KELAS);
  const [absenRecords, setAbsenRecords] = useState<AbsenRecord[]>([]);
  const [kasusRecords, setKasusRecords] = useState<KasusRecord[]>([]);
  const [catatanRecords, setCatatanRecords] = useState<CatatanRecord[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalSlot[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const [semester, setSemester] = useState<SemesterConfig>(DEFAULT_SEMESTER);

  // Auto-set activeKelas when kelasList changes
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

  const addAbsenRecords = useCallback((records: AbsenRecord[]) => {
    setAbsenRecords(prev => {
      const filtered = prev.filter(p =>
        !records.some(r => r.studentId === p.studentId && r.date === p.date && r.kelasId === p.kelasId)
      );
      return [...filtered, ...records];
    });
  }, []);
  const updateAbsenRecord = useCallback((id: string, updates: Partial<AbsenRecord>) => {
    setAbsenRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
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
    setLastBackupDate(null);
    setActiveKelas('');
    setSemester(DEFAULT_SEMESTER);
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

  const importBackup = useCallback((data: BackupData) => {
    if (data.version && data.kelasList) {
      if (data.namaGuru) setNamaGuru(data.namaGuru);
      setKelasList(data.kelasList);
      setAbsenRecords(data.absenRecords || []);
      setKasusRecords(data.kasusRecords || []);
      setCatatanRecords(data.catatanRecords || []);
      if (data.jadwalList) setJadwalList(data.jadwalList);
      if (data.semester) setSemester(data.semester);
      if (data.kelasList.length > 0) setActiveKelas(data.kelasList[0].id);
      showToast('Data berhasil dipulihkan dari backup');
    } else {
      showToast('Format backup tidak valid');
    }
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      namaGuru, setNamaGuru,
      lastBackupDate, setLastBackupDate,
      activeTab, setActiveTab,
      activeKelas, setActiveKelas,
      activeStudentId, setActiveStudentId,
      kelasList, setKelasList,
      addKelas, deleteKelas, addStudentsToKelas, removeStudentFromKelas,
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
