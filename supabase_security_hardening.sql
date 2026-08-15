-- Jurnal Guru: hardening akses data per akun
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor, pada project Jurnal Guru.
-- Aman untuk data yang sudah ada: skrip ini tidak menghapus record.

begin;

-- Jangan izinkan client tanpa sesi login mengakses data aplikasi.
revoke all on table public.profiles, public.kelas, public.students,
  public.absen_records, public.kasus_records, public.catatan_records,
  public.jadwal_slots, public.libur_dates, public.confirmed_dates,
  public.semester_config from anon;

grant select, insert, update, delete on table public.profiles, public.kelas,
  public.students, public.absen_records, public.kasus_records,
  public.catatan_records, public.jadwal_slots, public.libur_dates,
  public.confirmed_dates, public.semester_config to authenticated;

alter table public.profiles enable row level security;
alter table public.kelas enable row level security;
alter table public.students enable row level security;
alter table public.absen_records enable row level security;
alter table public.kasus_records enable row level security;
alter table public.catatan_records enable row level security;
alter table public.jadwal_slots enable row level security;
alter table public.libur_dates enable row level security;
alter table public.confirmed_dates enable row level security;
alter table public.semester_config enable row level security;

-- Hapus policy lama, terutama policy profile yang sebelumnya dapat dibaca
-- semua pengguna terautentikasi.
drop policy if exists "Profiles can be viewed by anyone authenticated" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can manage their own kelas" on public.kelas;
drop policy if exists "Users can manage their own students" on public.students;
drop policy if exists "Users can manage their own absen_records" on public.absen_records;
drop policy if exists "Users can manage their own kasus_records" on public.kasus_records;
drop policy if exists "Users can manage their own catatan_records" on public.catatan_records;
drop policy if exists "Users can manage their own jadwal_slots" on public.jadwal_slots;
drop policy if exists "Users can manage their own libur_dates" on public.libur_dates;
drop policy if exists "Users can manage their own confirmed_dates" on public.confirmed_dates;
drop policy if exists "Users can manage their own semester_config" on public.semester_config;

create policy "profile milik sendiri" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "kelas milik sendiri" on public.kelas
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Selain pemilik record, pastikan relasi siswa juga menunjuk kelas milik akun itu.
create policy "siswa pada kelas milik sendiri" on public.students
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.kelas k
      where k.id = kelas_id and k.user_id = (select auth.uid())
    )
  );

-- Semua catatan siswa wajib merujuk siswa dan kelas yang dimiliki akun aktif.
create policy "absen milik sendiri" on public.absen_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.kelas k where k.id = kelas_id and k.user_id = (select auth.uid()))
    and exists (select 1 from public.students s where s.id = student_id and s.user_id = (select auth.uid()))
  );

create policy "kasus milik sendiri" on public.kasus_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.kelas k where k.id = kelas_id and k.user_id = (select auth.uid()))
    and exists (select 1 from public.students s where s.id = student_id and s.user_id = (select auth.uid()))
  );

create policy "catatan milik sendiri" on public.catatan_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.kelas k where k.id = kelas_id and k.user_id = (select auth.uid()))
    and exists (select 1 from public.students s where s.id = student_id and s.user_id = (select auth.uid()))
  );

create policy "jadwal milik sendiri" on public.jadwal_slots
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.kelas k where k.id = kelas_id and k.user_id = (select auth.uid()))
  );

create policy "libur milik sendiri" on public.libur_dates
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "konfirmasi milik sendiri" on public.confirmed_dates
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.kelas k where k.id = kelas_id and k.user_id = (select auth.uid()))
  );

create policy "semester milik sendiri" on public.semester_config
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
