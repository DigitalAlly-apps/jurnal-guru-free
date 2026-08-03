-- SQL Schema untuk Jurnal Guru Pro (Supabase PostgreSQL)
-- Salin dan tempel kode ini ke SQL Editor di dashboard Supabase Anda.

-- 1. AKTIFKAN EXTENSION UUID (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFIL GURU (Terkait langsung dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nama_guru TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL KELAS
CREATE TABLE IF NOT EXISTS public.kelas (
    id TEXT PRIMARY KEY, -- Mendukung ID string lokal 'k_123456'
    name TEXT NOT NULL,
    jenjang TEXT CHECK (jenjang IN ('SD', 'SMP', 'SMA')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL SISWA
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY, -- Mendukung ID string lokal 'kelasId_123_0'
    name TEXT NOT NULL,
    nis TEXT,
    kelas_id TEXT REFERENCES public.kelas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL ABSENSI (AbsenRecord)
CREATE TABLE IF NOT EXISTS public.absen_records (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    status TEXT CHECK (status IN ('H', 'S', 'I', 'A')) NOT NULL,
    keterangan TEXT,
    kelas_id TEXT REFERENCES public.kelas(id) ON DELETE CASCADE NOT NULL,
    periode_ujian TEXT CHECK (periode_ujian IN ('UTS', 'UAS', 'Harian')),
    mata_pelajaran TEXT,
    jam_ujian TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL KASUS (KasusRecord)
CREATE TABLE IF NOT EXISTS public.kasus_records (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    kelas_id TEXT REFERENCES public.kelas(id) ON DELETE CASCADE NOT NULL,
    periode_ujian TEXT CHECK (periode_ujian IN ('UTS', 'UAS', 'Harian')),
    waktu_pemanggilan TEXT,
    tanggal_pemanggilan TEXT,
    status TEXT CHECK (status IN ('baru', 'proses', 'selesai')),
    tindak_lanjut TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL CATATAN (CatatanRecord)
CREATE TABLE IF NOT EXISTS public.catatan_records (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    date TEXT NOT NULL,
    content TEXT NOT NULL,
    kelas_id TEXT REFERENCES public.kelas(id) ON DELETE CASCADE NOT NULL,
    tipe TEXT CHECK (tipe IN ('prestasi', 'perkembangan', 'sholat', 'umum')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABEL JADWAL PELAJARAN (JadwalSlot)
CREATE TABLE IF NOT EXISTS public.jadwal_slots (
    id TEXT PRIMARY KEY,
    hari TEXT CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')) NOT NULL,
    jam_mulai TEXT NOT NULL,
    jam_selesai TEXT NOT NULL,
    mata_pelajaran TEXT NOT NULL,
    kelas_id TEXT REFERENCES public.kelas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABEL TANGGAL LIBUR (LiburDate)
CREATE TABLE IF NOT EXISTS public.libur_dates (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    jenjang TEXT CHECK (jenjang IN ('SD', 'SMP', 'SMA')) NOT NULL,
    keterangan TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABEL TANGGAL TERKONFIRMASI (ConfirmedDate)
CREATE TABLE IF NOT EXISTS public.confirmed_dates (
    id TEXT PRIMARY KEY,
    kelas_id TEXT REFERENCES public.kelas(id) ON DELETE CASCADE NOT NULL,
    date TEXT NOT NULL,
    periode_ujian TEXT CHECK (periode_ujian IN ('UTS', 'UAS', 'Harian')),
    mata_pelajaran TEXT,
    jam_ujian TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABEL KONFIGURASI SEMESTER (SemesterConfig)
CREATE TABLE IF NOT EXISTS public.semester_config (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tahun_ajaran TEXT NOT NULL,
    semester TEXT CHECK (semester IN ('ganjil', 'genap')) NOT NULL,
    ganjil JSONB NOT NULL,
    genap JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER OTOMATIS SAAT USER BARU MENDAFTAR (CREATE PROFILE)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nama_guru)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'nama_guru', 'Guru Jurnal'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- MENGAKTIFKAN ROW LEVEL SECURITY (RLS) DI SEMUA TABEL
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absen_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kasus_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libur_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmed_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_config ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- MEMBUAT POLICIES RLS (Guru hanya bisa melihat/mengedit data miliknya sendiri)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Profiles
CREATE POLICY "Profiles can be viewed by anyone authenticated" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Kelas
CREATE POLICY "Users can manage their own kelas" ON public.kelas
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Students
CREATE POLICY "Users can manage their own students" ON public.students
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Absen Records
CREATE POLICY "Users can manage their own absen_records" ON public.absen_records
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Kasus Records
CREATE POLICY "Users can manage their own kasus_records" ON public.kasus_records
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Catatan Records
CREATE POLICY "Users can manage their own catatan_records" ON public.catatan_records
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Jadwal Slots
CREATE POLICY "Users can manage their own jadwal_slots" ON public.jadwal_slots
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Libur Dates
CREATE POLICY "Users can manage their own libur_dates" ON public.libur_dates
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Confirmed Dates
CREATE POLICY "Users can manage their own confirmed_dates" ON public.confirmed_dates
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. Semester Config
CREATE POLICY "Users can manage their own semester_config" ON public.semester_config
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
