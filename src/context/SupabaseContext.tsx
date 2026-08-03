import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { BackupData, Kelas, Student, AbsenRecord, KasusRecord, CatatanRecord, JadwalSlot, LiburDate, ConfirmedDate, SemesterConfig } from '@/types';

export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

interface SupabaseContextType {
  user: User | null;
  profile: { nama_guru?: string } | null;
  authLoading: boolean;
  isConfigured: boolean;
  syncState: SyncState;
  lastSyncTime: string | null;
  setLastSyncTime: (t: string | null) => void;
  signUp: (email: string, password: string, namaGuru: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  syncData: (localState: BackupData) => Promise<BackupData | null>;
  setSyncState: (state: SyncState) => void;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ nama_guru?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('jg_lastSyncTime');
  });

  // Ambil profil guru dari tabel profiles
  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nama_guru')
        .eq('id', userId)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    // Ambil sesi awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setAuthLoading(false);
    });

    // Dengarkan perubahan auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, namaGuru: string) => {
    if (!supabase) return { error: new Error('Supabase belum dikonfigurasi') };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama_guru: namaGuru, // Dipakai oleh trigger PostgreSQL
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        // Optimistic profile set
        setProfile({ nama_guru: namaGuru });
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase belum dikonfigurasi') };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    if (!supabase) return { error: new Error('Supabase belum dikonfigurasi') };
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      localStorage.removeItem('jg_lastSyncTime');
      setLastSyncTime(null);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // ── Sync Engine: Bidirectional Local-First Sync ──────────────────────────────
  const syncData = useCallback(async (localState: BackupData): Promise<BackupData | null> => {
    if (!supabase || !user) {
      setSyncState('error');
      return null;
    }

    setSyncState('syncing');
    try {
      const uid = user.id;

      // ── A. UPLOAD DATA LOKAL KE CLOUD (UPSERT) ──────────────────────────────

      // 1. Upload Kelas
      if (localState.kelasList.length > 0) {
        const payloadKelas = localState.kelasList.map(k => ({
          id: k.id,
          name: k.name,
          jenjang: k.jenjang || 'SMP',
          user_id: uid
        }));
        const { error: errK } = await supabase.from('kelas').upsert(payloadKelas);
        if (errK) throw errK;
      }

      // 2. Upload Students
      const payloadStudents: any[] = [];
      localState.kelasList.forEach(k => {
        k.students.forEach(s => {
          payloadStudents.push({
            id: s.id,
            name: s.name,
            nis: s.nis,
            kelas_id: k.id,
            user_id: uid
          });
        });
      });
      if (payloadStudents.length > 0) {
        const { error: errS } = await supabase.from('students').upsert(payloadStudents);
        if (errS) throw errS;
      }

      // 3. Upload Absen Records
      if (localState.absenRecords.length > 0) {
        const payloadAbsen = localState.absenRecords.map(r => ({
          id: r.id,
          student_id: r.studentId,
          student_name: r.studentName,
          date: r.date,
          status: r.status,
          keterangan: r.keterangan || null,
          kelas_id: r.kelasId,
          periode_ujian: r.periodeUjian || null,
          mata_pelajaran: r.mataPelajaran || null,
          jam_ujian: r.jamUjian || null,
          user_id: uid
        }));
        const { error: errA } = await supabase.from('absen_records').upsert(payloadAbsen);
        if (errA) throw errA;
      }

      // 4. Upload Kasus Records
      if (localState.kasusRecords.length > 0) {
        const payloadKasus = localState.kasusRecords.map(r => ({
          id: r.id,
          student_id: r.studentId,
          student_name: r.studentName,
          date: r.date,
          description: r.description,
          category: r.category,
          kelas_id: r.kelasId,
          periode_ujian: r.periodeUjian || null,
          waktu_pemanggilan: r.waktuPemanggilan || null,
          tanggal_pemanggilan: r.tanggalPemanggilan || null,
          status: r.status || 'baru',
          tindak_lanjut: r.tindakLanjut || null,
          user_id: uid
        }));
        const { error: errKas } = await supabase.from('kasus_records').upsert(payloadKasus);
        if (errKas) throw errKas;
      }

      // 5. Upload Catatan Records
      if (localState.catatanRecords.length > 0) {
        const payloadCatatan = localState.catatanRecords.map(r => ({
          id: r.id,
          student_id: r.studentId,
          student_name: r.studentName,
          date: r.date,
          content: r.content,
          kelas_id: r.kelasId,
          tipe: r.tipe || 'umum',
          user_id: uid
        }));
        const { error: errCat } = await supabase.from('catatan_records').upsert(payloadCatatan);
        if (errCat) throw errCat;
      }

      // 6. Upload Jadwal Pelajaran
      if (localState.jadwalList.length > 0) {
        const payloadJadwal = localState.jadwalList.map(r => ({
          id: r.id,
          hari: r.hari,
          jam_mulai: r.jamMulai,
          jam_selesai: r.jamSelesai,
          mata_pelajaran: r.mataPelajaran,
          kelas_id: r.kelasId,
          user_id: uid
        }));
        const { error: errJad } = await supabase.from('jadwal_slots').upsert(payloadJadwal);
        if (errJad) throw errJad;
      }

      // 7. Upload Libur Dates
      if (localState.liburDates && localState.liburDates.length > 0) {
        const payloadLibur = localState.liburDates.map(r => ({
          id: r.id,
          date: r.date,
          jenjang: r.jenjang,
          keterangan: r.keterangan || null,
          user_id: uid
        }));
        const { error: errLib } = await supabase.from('libur_dates').upsert(payloadLibur);
        if (errLib) throw errLib;
      }

      // 8. Upload Confirmed Dates
      if (localState.confirmedDates && localState.confirmedDates.length > 0) {
        const payloadConf = localState.confirmedDates.map(r => ({
          id: r.id,
          kelas_id: r.kelasId,
          date: r.date,
          periode_ujian: r.periodeUjian || null,
          mata_pelajaran: r.mataPelajaran || null,
          jam_ujian: r.jamUjian || null,
          user_id: uid
        }));
        const { error: errConf } = await supabase.from('confirmed_dates').upsert(payloadConf);
        if (errConf) throw errConf;
      }

      // 9. Upload Semester Config
      if (localState.semester) {
        const payloadSemester = {
          user_id: uid,
          tahun_ajaran: localState.semester.tahunAjaran,
          semester: localState.semester.semester,
          ganjil: localState.semester.ganjil,
          genap: localState.semester.genap,
          updated_at: new Date().toISOString()
        };
        const { error: errSem } = await supabase.from('semester_config').upsert(payloadSemester);
        if (errSem) throw errSem;
      }

      // ── B. DOWNLOAD TERBARU DARI CLOUD ─────────────────────────────────────
 
      // 1. Fetch profiles (dengan fallback jika profile belum terbuat)
      let dbProfileName = '';
      const { data: dbProfile } = await supabase.from('profiles').select('nama_guru').eq('id', uid).maybeSingle();
      if (!dbProfile) {
        const fallbackName = localState.namaGuru || user.user_metadata?.nama_guru || 'Guru Jurnal';
        const { error: errProfileUpsert } = await supabase.from('profiles').upsert({
          id: uid,
          nama_guru: fallbackName,
          updated_at: new Date().toISOString()
        });
        if (!errProfileUpsert) {
          dbProfileName = fallbackName;
          setProfile({ nama_guru: fallbackName });
        }
      } else {
        dbProfileName = dbProfile.nama_guru || '';
      }
      const namaGuru = dbProfileName || localState.namaGuru || '';

      // 2. Fetch kelas
      const { data: dbKelas, error: errFetchK } = await supabase.from('kelas').select('*').order('created_at', { ascending: true });
      if (errFetchK) throw errFetchK;

      // 3. Fetch students
      const { data: dbStudents, error: errFetchS } = await supabase.from('students').select('*').order('created_at', { ascending: true });
      if (errFetchS) throw errFetchS;

      // 4. Fetch absen records
      const { data: dbAbsen, error: errFetchA } = await supabase.from('absen_records').select('*');
      if (errFetchA) throw errFetchA;

      // 5. Fetch kasus records
      const { data: dbKasus, error: errFetchKas } = await supabase.from('kasus_records').select('*');
      if (errFetchKas) throw errFetchKas;

      // 6. Fetch catatan records
      const { data: dbCatatan, error: errFetchCat } = await supabase.from('catatan_records').select('*');
      if (errFetchCat) throw errFetchCat;

      // 7. Fetch jadwal slots
      const { data: dbJadwal, error: errFetchJad } = await supabase.from('jadwal_slots').select('*');
      if (errFetchJad) throw errFetchJad;

      // 8. Fetch libur dates
      const { data: dbLibur, error: errFetchLib } = await supabase.from('libur_dates').select('*');
      if (errFetchLib) throw errFetchLib;

      // 9. Fetch confirmed dates
      const { data: dbConfirmed, error: errFetchConf } = await supabase.from('confirmed_dates').select('*');
      if (errFetchConf) throw errFetchConf;

      // 10. Fetch semester config
      const { data: dbSemester, error: errFetchSem } = await supabase.from('semester_config').select('*').eq('user_id', uid).maybeSingle();
      if (errFetchSem) throw errFetchSem;

      // ── C. RAKIT BALIK KE BACKUPDATA FORMAT (LOCAL STATE) ──────────────────

      // Petakan siswa ke dalam kelas
      const mappedKelasList: Kelas[] = (dbKelas || []).map(k => {
        const classStudents: Student[] = (dbStudents || [])
          .filter(s => s.kelas_id === k.id)
          .map(s => ({
            id: s.id,
            name: s.name,
            nis: s.nis || ''
          }));
        return {
          id: k.id,
          name: k.name,
          jenjang: k.jenjang as 'SD' | 'SMP' | 'SMA',
          students: classStudents
        };
      });

      // Petakan Absen Records
      const mappedAbsen: AbsenRecord[] = (dbAbsen || []).map(r => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        date: r.date,
        status: r.status as 'H' | 'S' | 'I' | 'A',
        keterangan: r.keterangan || undefined,
        kelasId: r.kelas_id,
        periodeUjian: r.periode_ujian as any,
        mataPelajaran: r.mata_pelajaran || undefined,
        jamUjian: r.jam_ujian || undefined
      }));

      // Petakan Kasus Records
      const mappedKasus: KasusRecord[] = (dbKasus || []).map(r => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        date: r.date,
        description: r.description,
        category: r.category,
        kelasId: r.kelas_id,
        periodeUjian: r.periode_ujian as any,
        waktuPemanggilan: r.waktu_pemanggilan || undefined,
        tanggalPemanggilan: r.tanggal_pemanggilan || undefined,
        status: r.status as any,
        tindakLanjut: r.tindak_lanjut || undefined
      }));

      // Petakan Catatan Records
      const mappedCatatan: CatatanRecord[] = (dbCatatan || []).map(r => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        date: r.date,
        content: r.content,
        kelasId: r.kelas_id,
        tipe: r.tipe as any
      }));

      // Petakan Jadwal Slots
      const mappedJadwal: JadwalSlot[] = (dbJadwal || []).map(r => ({
        id: r.id,
        hari: r.hari as any,
        jamMulai: r.jam_mulai,
        jamSelesai: r.jam_selesai,
        mataPelajaran: r.mata_pelajaran,
        kelasId: r.kelas_id
      }));

      // Petakan Libur Dates
      const mappedLibur: LiburDate[] = (dbLibur || []).map(r => ({
        id: r.id,
        date: r.date,
        jenjang: r.jenjang as any,
        keterangan: r.keterangan || undefined
      }));

      // Petakan Confirmed Dates
      const mappedConfirmed: ConfirmedDate[] = (dbConfirmed || []).map(r => ({
        id: r.id,
        kelasId: r.kelas_id,
        date: r.date,
        periodeUjian: r.periode_ujian as any,
        mataPelajaran: r.mata_pelajaran || undefined,
        jamUjian: r.jam_ujian || undefined
      }));

      // Petakan Semester Config
      const currentYear = new Date().getFullYear();
      const mappedSemester: SemesterConfig = dbSemester ? {
        tahunAjaran: dbSemester.tahun_ajaran,
        semester: dbSemester.semester as any,
        ganjil: dbSemester.ganjil as any,
        genap: dbSemester.genap as any
      } : {
        tahunAjaran: `${currentYear}/${currentYear + 1}`,
        semester: new Date().getMonth() < 6 ? 'genap' : 'ganjil',
        ganjil: { utsStart: '', utsEnd: '', uasStart: '', uasEnd: '' },
        genap: { utsStart: '', utsEnd: '', uasStart: '', uasEnd: '' }
      };

      const finalState: BackupData = {
        version: '5.0',
        exportedAt: new Date().toISOString(),
        namaGuru,
        semester: mappedSemester,
        kelasList: mappedKelasList,
        absenRecords: mappedAbsen,
        kasusRecords: mappedKasus,
        catatanRecords: mappedCatatan,
        jadwalList: mappedJadwal,
        liburDates: mappedLibur,
        confirmedDates: mappedConfirmed
      };

      const syncTimeString = new Date().toLocaleString('id-ID');
      setLastSyncTime(syncTimeString);
      localStorage.setItem('jg_lastSyncTime', syncTimeString);
      setSyncState('success');

      return finalState;
    } catch (err: any) {
      const msg = err?.message || err?.details || JSON.stringify(err) || 'Unknown error';
      console.error('Sync error:', msg, err);
      setSyncState('error');
      // Simpan error ke sessionStorage agar bisa ditampilkan di UI
      sessionStorage.setItem('jg_lastSyncError', msg);
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SupabaseContext.Provider value={{
      user,
      profile,
      authLoading,
      isConfigured: isSupabaseConfigured,
      syncState,
      lastSyncTime,
      setLastSyncTime,
      signUp,
      signIn,
      signOut,
      syncData,
      setSyncState
    }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used within SupabaseProvider');
  return ctx;
};
