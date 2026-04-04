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

export type PeriodeUjian = 'UTS' | 'UAS' | 'Harian';

export interface AbsenRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'H' | 'S' | 'I' | 'A';
  kelasId: string;
  periodeUjian?: PeriodeUjian;
}

export interface KasusRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  description: string;
  category: string;
  kelasId: string;
  periodeUjian?: PeriodeUjian;
}

export interface CatatanRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  content: string;
  kelasId: string;
}

export type TabId = 'home' | 'absen' | 'kasus' | 'riwayat' | 'laporan' | 'siswa' | 'informasi' | 'setelan';

export type SemesterPeriod = 'ganjil' | 'genap';

export interface SemesterConfig {
  tahunAjaran: string;
  semester: SemesterPeriod;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  semester: SemesterConfig;
  kelasList: Kelas[];
  absenRecords: AbsenRecord[];
  kasusRecords: KasusRecord[];
  catatanRecords: CatatanRecord[];
}
