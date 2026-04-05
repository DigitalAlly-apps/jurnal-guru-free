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
  mataPelajaran?: string;
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
  waktuPemanggilan?: string; // format HH:MM, opsional
}

export interface CatatanRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  content: string;
  kelasId: string;
  tipe?: 'prestasi' | 'perkembangan' | 'umum';
}

export type TabId = 'home' | 'absen' | 'kasus' | 'jadwal' | 'riwayat' | 'laporan' | 'siswa' | 'informasi' | 'setelan';

export type SemesterPeriod = 'ganjil' | 'genap';

export interface UjianSchedule {
  utsStart: string;
  utsEnd: string;
  uasStart: string;
  uasEnd: string;
}

export type HariSekolah = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface JadwalSlot {
  id: string;
  hari: HariSekolah;
  jamMulai: string;
  jamSelesai: string;
  mataPelajaran: string;
  kelasId: string;
}

export interface SemesterConfig {
  tahunAjaran: string;
  semester: SemesterPeriod;
  ganjil: UjianSchedule;
  genap: UjianSchedule;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  namaGuru: string;
  semester: SemesterConfig;
  kelasList: Kelas[];
  absenRecords: AbsenRecord[];
  kasusRecords: KasusRecord[];
  catatanRecords: CatatanRecord[];
  jadwalList: JadwalSlot[];
}
