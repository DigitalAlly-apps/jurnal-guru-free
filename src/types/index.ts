export interface Student {
  id: string;
  name: string;
  nis: string;
}

export type Jenjang = 'SD' | 'SMP' | 'SMA';

export interface Kelas {
  id: string;
  name: string;
  students: Student[];
  jenjang?: Jenjang;
}

export type PeriodeUjian = 'UTS' | 'UAS' | 'Harian';

export interface AbsenRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'H' | 'S' | 'I' | 'A';
  keterangan?: string;          // ← BARU: keterangan tidak hadir
  kelasId: string;
  periodeUjian?: PeriodeUjian;
  mataPelajaran?: string;
}

export type KasusStatus = 'baru' | 'proses' | 'selesai';

export interface KasusRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  description: string;
  category: string;
  kelasId: string;
  periodeUjian?: PeriodeUjian;
  waktuPemanggilan?: string;
  tanggalPemanggilan?: string;
  status?: KasusStatus;
  tindakLanjut?: string;
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

export type TabId = 'home' | 'siswa' | 'absen' | 'jurnal' | 'jadwal' | 'laporan' | 'setelan';

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

export interface LiburDate {
  id: string;
  date: string;
  jenjang: Jenjang;
  keterangan?: string;
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
  liburDates?: LiburDate[];
}
