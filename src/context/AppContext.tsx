import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Kelas, AbsenRecord, KasusRecord, CatatanRecord, TabId } from '@/types';

const MOCK_STUDENTS_7A = [
  { id: '1', name: 'Ahmad Rizki', nis: '2024001' },
  { id: '2', name: 'Siti Nurhaliza', nis: '2024002' },
  { id: '3', name: 'Budi Santoso', nis: '2024003' },
  { id: '4', name: 'Dewi Lestari', nis: '2024004' },
  { id: '5', name: 'Eko Prasetyo', nis: '2024005' },
  { id: '6', name: 'Fitri Handayani', nis: '2024006' },
  { id: '7', name: 'Gunawan Wibowo', nis: '2024007' },
  { id: '8', name: 'Hana Permata', nis: '2024008' },
];

const MOCK_STUDENTS_7B = [
  { id: '9', name: 'Indra Kurniawan', nis: '2024009' },
  { id: '10', name: 'Joko Widodo', nis: '2024010' },
  { id: '11', name: 'Kartika Sari', nis: '2024011' },
  { id: '12', name: 'Lina Marlina', nis: '2024012' },
  { id: '13', name: 'Muhamad Faisal', nis: '2024013' },
  { id: '14', name: 'Nadia Putri', nis: '2024014' },
];

const MOCK_KELAS: Kelas[] = [
  { id: 'k1', name: '7A', students: MOCK_STUDENTS_7A },
  { id: 'k2', name: '7B', students: MOCK_STUDENTS_7B },
  { id: 'k3', name: '8A', students: MOCK_STUDENTS_7A.map(s => ({ ...s, id: 'k3_' + s.id })) },
];

const today = new Date().toISOString().split('T')[0];

const INITIAL_ABSEN: AbsenRecord[] = [
  { id: 'a1', studentId: '3', studentName: 'Budi Santoso', date: today, status: 'S', kelasId: 'k1' },
  { id: 'a2', studentId: '5', studentName: 'Eko Prasetyo', date: today, status: 'A', kelasId: 'k1' },
];

const INITIAL_KASUS: KasusRecord[] = [
  { id: 'ks1', studentId: '2', studentName: 'Siti Nurhaliza', date: today, description: 'Tidak mengerjakan PR Matematika', category: 'Akademik', kelasId: 'k1' },
];

const INITIAL_CATATAN: CatatanRecord[] = [
  { id: 'c1', studentId: '1', studentName: 'Ahmad Rizki', date: today, content: 'Menunjukkan peningkatan dalam diskusi kelas. Aktif bertanya dan memberikan pendapat.', kelasId: 'k1' },
  { id: 'c2', studentId: '4', studentName: 'Dewi Lestari', date: today, content: 'Membantu teman yang kesulitan memahami materi pelajaran.', kelasId: 'k1' },
];

interface AppState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  activeKelas: string;
  setActiveKelas: (id: string) => void;
  kelasList: Kelas[];
  absenRecords: AbsenRecord[];
  addAbsenRecords: (records: AbsenRecord[]) => void;
  kasusRecords: KasusRecord[];
  addKasusRecord: (record: KasusRecord) => void;
  catatanRecords: CatatanRecord[];
  addCatatanRecord: (record: CatatanRecord) => void;
  toasts: { id: string; message: string }[];
  showToast: (message: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeKelas, setActiveKelas] = useState('k1');
  const [absenRecords, setAbsenRecords] = useState<AbsenRecord[]>(INITIAL_ABSEN);
  const [kasusRecords, setKasusRecords] = useState<KasusRecord[]>(INITIAL_KASUS);
  const [catatanRecords, setCatatanRecords] = useState<CatatanRecord[]>(INITIAL_CATATAN);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

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

  const addKasusRecord = useCallback((record: KasusRecord) => {
    setKasusRecords(prev => [...prev, record]);
  }, []);

  const addCatatanRecord = useCallback((record: CatatanRecord) => {
    setCatatanRecords(prev => [...prev, record]);
  }, []);

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      activeKelas, setActiveKelas,
      kelasList: MOCK_KELAS,
      absenRecords, addAbsenRecords,
      kasusRecords, addKasusRecord,
      catatanRecords, addCatatanRecord,
      toasts, showToast,
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
