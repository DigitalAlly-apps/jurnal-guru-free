export interface Student {
  id: string;
  name: string;
  nis: string;
}

export interface Kelas {
  id: string;
  name: string;
  students: Student[];
}

export interface AbsenRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'H' | 'S' | 'I' | 'A';
  kelasId: string;
}

export interface KasusRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  description: string;
  category: string;
  kelasId: string;
}

export interface CatatanRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  content: string;
  kelasId: string;
}

export type TabId = 'home' | 'absen' | 'kasus' | 'laporan' | 'catatan' | 'setelan';
