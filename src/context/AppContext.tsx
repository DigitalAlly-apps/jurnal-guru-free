import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Kelas, AbsenRecord, KasusRecord, CatatanRecord, TabId, SemesterConfig, BackupData } from '@/types';

const DEFAULT_KELAS: Kelas[] = [
  { id: 'k1', name: '7A', students: [] },
];

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
  toasts: { id: string; message: string }[];
  showToast: (message: string) => void;
  semester: SemesterConfig;
  setSemester: React.Dispatch<React.SetStateAction<SemesterConfig>>;
  exportBackup: () => void;
  importBackup: (data: BackupData) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [namaGuru, setNamaGuru] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeKelas, setActiveKelas] = useState('k1');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>(DEFAULT_KELAS);
  const [absenRecords, setAbsenRecords] = useState<AbsenRecord[]>([]);
  const [kasusRecords, setKasusRecords] = useState<KasusRecord[]>([]);
  const [catatanRecords, setCatatanRecords] = useState<CatatanRecord[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const [semester, setSemester] = useState<SemesterConfig>(DEFAULT_SEMESTER);

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

  const addKelas = useCallback((name: string) => {
    const id = 'k_' + Date.now();
    setKelasList(prev => [...prev, { id, name, students: [] }]);
    setActiveKelas(id);
  }, []);

  const deleteKelas = useCallback((id: string) => {
    setKelasList(prev => prev.filter(k => k.id !== id));
    setActiveKelas(prev => prev === id ? (kelasList[0]?.id || '') : prev);
  }, [kelasList]);

  const addStudentsToKelas = useCallback((kelasId: string, students: { name: string; nis: string }[]) => {
    setKelasList(prev => prev.map(k => {
      if (k.id !== kelasId) return k;
      const newStudents = students.map((s, i) => ({
        id: `${kelasId}_${Date.now()}_${i}`,
        name: s.name.trim(),
        nis: s.nis.trim(),
      })).filter(s => s.name);
      return { ...k, students: [...k.students, ...newStudents] };
    }));
  }, []);

  const removeStudentFromKelas = useCallback((kelasId: string, studentId: string) => {
    setKelasList(prev => prev.map(k => {
      if (k.id !== kelasId) return k;
      return { ...k, students: k.students.filter(s => s.id !== studentId) };
    }));
  }, []);

  const exportBackup = useCallback(() => {
    const data: BackupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      namaGuru,
      semester,
      kelasList,
      absenRecords,
      kasusRecords,
      catatanRecords,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_jurnal_guru_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup berhasil diunduh');
  }, [namaGuru, semester, kelasList, absenRecords, kasusRecords, catatanRecords, showToast]);

  const importBackup = useCallback((data: BackupData) => {
    if (data.version && data.kelasList) {
      if (data.namaGuru) setNamaGuru(data.namaGuru);
      setKelasList(data.kelasList);
      setAbsenRecords(data.absenRecords || []);
      setKasusRecords(data.kasusRecords || []);
      setCatatanRecords(data.catatanRecords || []);
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
      activeTab, setActiveTab,
      activeKelas, setActiveKelas,
      activeStudentId, setActiveStudentId,
      kelasList, setKelasList,
      addKelas, deleteKelas,
      addStudentsToKelas, removeStudentFromKelas,
      absenRecords, addAbsenRecords, updateAbsenRecord, deleteAbsenRecord,
      kasusRecords, addKasusRecord, updateKasusRecord, deleteKasusRecord,
      catatanRecords, addCatatanRecord,
      toasts, showToast,
      semester, setSemester,
      exportBackup, importBackup,
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
