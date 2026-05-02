# Jurnal Guru Free - Ringkasan Lengkap Aplikasi

Dokumen ini dibuat agar agent AI bisa memahami keseluruhan aplikasi Jurnal Guru Free/Jurnal Guru Pro hanya dari satu file ini.

## Gambaran Umum

Jurnal Guru Free adalah aplikasi web untuk membantu guru mencatat administrasi kelas harian secara lokal. Aplikasi berfokus pada data kelas dan siswa, absensi, kasus siswa, catatan anekdot, jurnal/riwayat, rekap laporan, jadwal pelajaran, semester, backup, dan restore data.

Karakter utama aplikasi:

- Single page app dengan satu route utama `/`.
- Tidak memakai backend; semua data domain disimpan di `localStorage` browser.
- Memakai layout sidebar + header, responsif untuk desktop dan mobile.
- Mendukung dark mode.
- Memiliki onboarding awal untuk nama guru dan kelas pertama.
- Memiliki backup/restore JSON karena data hanya tersimpan di perangkat/browser user.
- Memiliki manifest PWA agar bisa diinstall ke home screen, meski Vite config tidak memasang plugin PWA khusus.

Stack utama:

- React 18 + TypeScript.
- Vite sebagai dev server/build tool.
- React Router DOM untuk route `/` dan fallback.
- Tailwind CSS untuk styling.
- shadcn/Radix UI components di `src/components/ui`.
- Recharts untuk chart dashboard.
- Lucide React untuk ikon.
- Sonner dan shadcn toaster untuk toast.
- Vitest + Testing Library untuk test.
- Playwright tersedia untuk E2E.
- `lovable-tagger` aktif di mode development.

## Cara Menjalankan

Script di `package.json`:

- `npm run dev`: menjalankan Vite dev server.
- `npm run build`: build production.
- `npm run build:dev`: build mode development.
- `npm run lint`: menjalankan ESLint.
- `npm run preview`: preview hasil build.
- `npm run test`: menjalankan Vitest sekali.
- `npm run test:watch`: menjalankan Vitest watch mode.

Konfigurasi Vite:

- File: `vite.config.ts`.
- Dev server host `::`, port `8080`.
- React plugin memakai `@vitejs/plugin-react-swc`.
- Alias `@` mengarah ke `./src`.
- `componentTagger()` hanya aktif saat `mode === 'development'`.
- `hmr.overlay` dimatikan.

## Struktur Folder Penting

- `src/main.tsx`: entry React, render `App`, import CSS.
- `src/App.tsx`: router utama, tooltip provider, toaster, route `/`, fallback `NotFound`.
- `src/pages/Index.tsx`: membungkus `AppLayout` dengan `AppProvider`.
- `src/context/AppContext.tsx`: state global, localStorage persistence, CRUD data, backup/restore.
- `src/types/index.ts`: tipe domain utama.
- `src/components/AppLayout.tsx`: layout utama, sidebar, header, FAB, toast, onboarding, render page berdasarkan `activeTab`.
- `src/components/AppHeader.tsx`: header, judul tab, selector kelas mobile, status backup, dark mode, panel info.
- `src/components/AppSidebar.tsx`: navigasi sidebar.
- `src/components/FAB.tsx`: tombol cepat untuk absensi/kasus/anekdot.
- `src/components/OnboardingWizard.tsx`: wizard awal nama guru dan kelas pertama.
- `src/components/ToastContainer.tsx`: toast lokal dari AppContext.
- `src/components/StatBox.tsx`: kotak statistik dashboard.
- `src/components/JurnalGuruLogo.tsx`: logo app.
- `src/pages/HomePage.tsx`: beranda/dashboard.
- `src/pages/SiswaPage.tsx`: data kelas/siswa dan detail siswa.
- `src/pages/AbsenPage.tsx`: absensi harian dan libur per jenjang.
- `src/pages/JurnalPage.tsx`: tab internal kasus, catatan/anekdot, riwayat.
- `src/pages/KasusPage.tsx`: input kasus siswa.
- `src/pages/CatatanPage.tsx`: catatan anekdot/prestasi/perkembangan.
- `src/pages/RiwayatPage.tsx`: riwayat gabungan absensi, kasus, catatan.
- `src/pages/LaporanRiwayatPage.tsx`: tab internal laporan dan riwayat.
- `src/pages/LaporanPage.tsx`: rekap dan export CSV/Excel.
- `src/pages/JadwalPage.tsx`: jadwal pelajaran per kelas.
- `src/pages/SetelanPage.tsx`: profil, dark mode, semester, backup/restore, install, reset data.
- `src/pages/InformasiPage.tsx`: informasi/tutorial.
- `src/pages/NotFound.tsx`: fallback route.
- `src/hooks/use-dark-mode.ts`: single source dark mode.
- `src/hooks/use-toast.ts`: hook toast shadcn.
- `src/lib/utils.ts`: helper umum, terutama `cn`.
- `src/index.css`: Tailwind layer, tokens CSS, style custom.
- `src/App.css`: CSS tambahan.
- `public/manifest.json`: manifest PWA.
- `tailwind.config.ts`: konfigurasi Tailwind.
- `vitest.config.ts`, `src/test/*`: setup test.
- `playwright.config.ts`, `playwright-fixture.ts`: setup E2E.

## Routing dan Layout

Routing ada di `src/App.tsx`:

- `/`: render `Index`.
- `*`: render `NotFound`.

`Index` hanya membungkus app:

- `AppProvider` menyediakan semua state domain.
- `AppLayout` menampilkan UI utama.

`AppLayout` memilih halaman berdasarkan `activeTab` dari context:

- `home`: `HomePage`.
- `siswa`: `SiswaPage`.
- `absen`: `AbsenPage`.
- `jurnal`: `JurnalPage`.
- `jadwal`: `JadwalPage`.
- `laporan`: `LaporanRiwayatPage`.
- `setelan`: `SetelanPage`.

Komponen tetap di semua halaman:

- `OnboardingWizard`.
- `AppSidebar`.
- `AppHeader`.
- `FAB`.
- `ToastContainer`.

## Model Data Utama

Semua tipe utama ada di `src/types/index.ts`.

### Student

Data siswa:

- `id`
- `name`
- `nis`

### Kelas

Data kelas:

- `id`
- `name`
- `students`
- `jenjang`: opsional, `SD`, `SMP`, atau `SMA`.

Jika `jenjang` kosong di beberapa tempat dianggap `SMP`.

### AbsenRecord

Catatan absensi:

- `id`
- `studentId`
- `studentName`
- `date`: `YYYY-MM-DD`.
- `status`: `H`, `S`, `I`, atau `A`.
- `keterangan`: opsional, alasan sakit/izin/alpha.
- `kelasId`
- `periodeUjian`: opsional, `UTS`, `UAS`, atau `Harian`.
- `mataPelajaran`: opsional.

Catatan penting: aplikasi memakai model absensi exception-based. Status `H` tidak disimpan sebagai record. Hadir disimpulkan dari tidak adanya record S/I/A untuk siswa pada tanggal+kelas tersebut.

### KasusRecord

Catatan kasus siswa:

- `id`
- `studentId`
- `studentName`
- `date`
- `description`
- `category`
- `kelasId`
- `periodeUjian`: opsional.
- `waktuPemanggilan`: opsional.
- `tanggalPemanggilan`: opsional.
- `status`: opsional, `baru`, `proses`, atau `selesai`.
- `tindakLanjut`: opsional.

### CatatanRecord

Catatan anekdot/perkembangan/prestasi:

- `id`
- `studentId`
- `studentName`
- `date`
- `content`
- `kelasId`
- `tipe`: opsional, `prestasi`, `perkembangan`, atau `umum`.

### JadwalSlot

Jadwal pelajaran:

- `id`
- `hari`: `Senin` sampai `Sabtu`.
- `jamMulai`
- `jamSelesai`
- `mataPelajaran`
- `kelasId`

### LiburDate

Tanggal libur:

- `id`
- `date`
- `jenjang`: `SD`, `SMP`, atau `SMA`.
- `keterangan`: opsional.

Libur berlaku per jenjang, bukan per kelas langsung. Kelas tanpa jenjang dianggap `SMP` oleh banyak UI.

### SemesterConfig

Konfigurasi semester:

- `tahunAjaran`
- `semester`: `ganjil` atau `genap`.
- `ganjil`: jadwal UTS/UAS semester ganjil.
- `genap`: jadwal UTS/UAS semester genap.

Jadwal ujian semester memiliki:

- `utsStart`
- `utsEnd`
- `uasStart`
- `uasEnd`

### BackupData

Format backup JSON:

- `version`
- `exportedAt`
- `namaGuru`
- `semester`
- `kelasList`
- `absenRecords`
- `kasusRecords`
- `catatanRecords`
- `jadwalList`
- `liburDates`

## State Global dan LocalStorage

Semua state domain utama berada di `src/context/AppContext.tsx`.

Helper localStorage:

- `ls<T>(key, fallback)`: baca JSON dari localStorage, fallback jika gagal.
- `save(key, value)`: simpan JSON ke localStorage.

Key localStorage yang dipakai:

- `jg_namaGuru`
- `jg_lastBackup`
- `jg_activeTab`
- `jg_activeKelas`
- `jg_kelasList`
- `jg_absenRecords`
- `jg_kasusRecords`
- `jg_catatanRecords`
- `jg_jadwalList`
- `jg_liburDates`
- `jg_semester`
- `jg_onboardingComplete`
- `theme`

State context:

- `namaGuru`
- `lastBackupDate`
- `activeTab`
- `activeKelas`
- `activeStudentId`
- `kelasList`
- `absenRecords`
- `kasusRecords`
- `catatanRecords`
- `jadwalList`
- `liburDates`
- `toasts`
- `semester`

Setiap setter penting dibungkus agar otomatis persist ke localStorage.

Auto behavior:

- Jika ada kelas tapi `activeKelas` tidak valid, app otomatis memilih kelas pertama.
- Jika `kelasList` kosong, `activeKelas` direset ke string kosong.
- Saat kelas aktif berubah, `activeStudentId` direset.
- Toast lokal hilang otomatis setelah 3 detik.

## Onboarding

Komponen: `src/components/OnboardingWizard.tsx`.

Muncul jika `localStorage.getItem('jg_onboardingComplete')` belum ada.

Flow:

1. Welcome screen.
2. Input nama guru, disimpan lewat `setNamaGuru`.
3. Input kelas pertama, disimpan lewat `addKelas`.
4. Pesan selesai dan peringatan agar rutin backup.
5. Set `jg_onboardingComplete = true`.

Onboarding tidak mengisi daftar siswa; user diarahkan untuk menambah siswa lewat menu Data Kelas & Siswa.

## Beranda/Dashboard

Komponen: `src/pages/HomePage.tsx`.

Fitur utama:

- Sapaan guru berdasarkan `namaGuru`.
- Menampilkan tanggal hari ini.
- Ringkasan kelas aktif.
- Alert backup jika belum pernah backup atau backup terakhir lebih dari 7 hari.
- Alert libur hari ini untuk jenjang kelas aktif.
- Alert pemanggilan siswa yang dijadwalkan hari ini.
- StatBox jumlah kasus hari ini, sakit, izin, alpha.
- Statistik semester: persentase kehadiran, total alpha, total kasus.
- Chart tren kehadiran 7 hari memakai Recharts AreaChart.
- Pie distribusi S/I/A hari ini.
- Daftar siswa yang perlu perhatian, yaitu alpha >= 3 atau kasus >= 3.
- Recent kasus kelas aktif.

Perhitungan kehadiran semester:

- Data absen hanya berisi exception S/I/A.
- `uniqueDates` diambil dari tanggal yang punya record exception.
- `totalPossible = uniqueDates * totalStudents`.
- Persentase hadir dihitung dari totalPossible dikurangi jumlah exception.
- Konsekuensi: hari yang semua hadir dan tidak ada record tidak dihitung sebagai tanggal absensi, karena model exception tidak menyimpan H.

## Data Kelas dan Siswa

Komponen: `src/pages/SiswaPage.tsx`.

Fitur kelas:

- Tambah kelas baru dengan nama dan jenjang `SD/SMP/SMA`.
- Hapus kelas jika ada lebih dari satu kelas.
- Kelas aktif dipilih dari sidebar/header.

Fitur siswa:

- Tambah siswa manual: nama dan NISN opsional.
- Tambah siswa lewat paste dari Excel/CSV/teks.
- Format paste yang didukung: `No | Nama | NISN`, `Nama | NISN`, atau `Nama saja`.
- Search siswa berdasarkan nama/NIS.
- Edit nama dan NIS siswa.
- Hapus siswa dari kelas.
- Klik siswa membuka detail siswa.

Detail siswa:

- Menampilkan informasi siswa dan riwayat terkait dari `absenRecords`, `kasusRecords`, dan `catatanRecords`.
- Detail dibuka melalui `activeStudentId`.
- Jika siswa aktif tidak ditemukan setelah kelas/data berubah, UI mereset `activeStudentId`.

## Absensi Harian

Komponen: `src/pages/AbsenPage.tsx`.

Fitur:

- Pilih tanggal.
- Pilih periode `Harian`, `UTS`, atau `UAS`.
- Isi mata pelajaran opsional.
- Jika ada jadwal untuk hari dan kelas aktif, mata pelajaran bisa dipilih dari `jadwalList`.
- Tandai tanggal sebagai libur untuk jenjang aktif.
- Batalkan libur.
- Search siswa.
- Set status per siswa: `H`, `S`, `I`, `A`.
- Tombol `Hadir Semua`.
- Keterangan untuk S/I/A dengan suggestion.
- Preview sebelum simpan.
- Edit absensi tanggal yang sudah punya data.

Model exception-based:

- Saat simpan, UI membuat record untuk semua siswa, termasuk H.
- `addAbsenRecords` di context menghapus record lama untuk kombinasi student+date+kelas, lalu hanya menyimpan record dengan status bukan `H`.
- Jika update record menjadi `H`, `updateAbsenRecord` menghapus record itu.
- Jadi data hadir tidak tersimpan eksplisit.

Libur:

- Libur disimpan sebagai `LiburDate` per tanggal+jenjang.
- Jika tanggal ditandai libur, absensi tidak bisa disimpan.
- Menandai libur akan memanggil `deleteAbsenRecordsByDateAndJenjang(date, jenjang)` untuk menghapus absensi pada tanggal itu untuk semua kelas dengan jenjang sama.

## Jadwal Pelajaran

Komponen: `src/pages/JadwalPage.tsx`.

Fitur:

- Tambah jadwal untuk kelas aktif.
- Field: hari, mata pelajaran, jam mulai, jam selesai.
- Hapus jadwal.
- Jadwal dikelompokkan berdasarkan hari Senin-Sabtu.
- Jadwal kelas aktif disort berdasarkan hari lalu jam mulai.

Jadwal dipakai oleh:

- `AbsenPage` untuk pilihan mata pelajaran sesuai hari.
- Header/informasi tertentu untuk konteks kelas.

## Jurnal Guru

Komponen: `src/pages/JurnalPage.tsx`.

`JurnalPage` adalah wrapper dengan tab internal:

- `Kasus`: `KasusPage`.
- `Anekdot`: `CatatanPage`.
- `Riwayat`: `RiwayatPage`.

## Kasus Siswa

Komponen: `src/pages/KasusPage.tsx`.

Fitur:

- Pilih siswa dari kelas aktif.
- Pilih tanggal.
- Pilih periode `Harian`, `UTS`, `UAS`.
- Pilih kategori: Akademik, Kedisiplinan, Perilaku, Kehadiran, Lainnya.
- Isi deskripsi kasus.
- Template kasus cepat, seperti tidak mengerjakan PR, terlambat, bermain HP, dll.
- Isi tanggal pemanggilan opsional.
- Isi waktu pemanggilan opsional.
- Pilih status kasus: baru, proses, selesai.
- Simpan ke `kasusRecords`.

Kasus yang punya tanggal/waktu pemanggilan hari ini akan muncul sebagai alert di dashboard.

## Catatan Anekdot

Komponen: `src/pages/CatatanPage.tsx`.

Fitur:

- Tambah catatan untuk siswa kelas aktif.
- Tanggal catatan.
- Tipe catatan: umum, prestasi, perkembangan.
- Isi konten catatan.
- Search catatan berdasarkan nama siswa atau isi catatan.
- Edit catatan.
- Hapus catatan dengan konfirmasi.
- Klik nama siswa untuk membuka detail siswa di tab `siswa`.

## Riwayat

Komponen: `src/pages/RiwayatPage.tsx`.

Fitur:

- Menampilkan riwayat gabungan absensi, kasus, dan catatan untuk kelas aktif.
- Search berdasarkan nama, tanggal, atau deskripsi.
- Filter: semua, absensi, kasus, catatan.
- Pagination per section, default 50 item.
- Edit data absensi, kasus, dan catatan.
- Hapus data dengan konfirmasi.
- Cycle status kasus: baru -> proses -> selesai -> baru.

Catatan:

- `RiwayatPage` dipakai di dua tempat: tab internal `JurnalPage` dan tab internal `LaporanRiwayatPage`.

## Laporan dan Buku Induk

Komponen wrapper: `src/pages/LaporanRiwayatPage.tsx`.

Tab internal:

- `laporan`: `LaporanPage`.
- `riwayat`: `RiwayatPage`.

Komponen laporan: `src/pages/LaporanPage.tsx`.

Fitur:

- Filter siswa tertentu atau semua siswa.
- Filter periode: minggu, bulan, semua.
- Menampilkan informasi tahun ajaran dan semester.
- Rekap S/I/A dan jumlah kasus per siswa.
- Log kasus sesuai filter.
- Catatan anekdot sesuai filter.
- Export CSV.
- Export Excel menggunakan HTML table dengan MIME `application/vnd.ms-excel`.

Nama file export:

- CSV: `laporan_${kelas}_${tahunAjaran}_${semester}_${period}.csv`.
- Excel: `laporan_${kelas}_${tahunAjaran}_${semester}.xls`.

## Setelan

Komponen: `src/pages/SetelanPage.tsx`.

Fitur:

- Edit nama guru.
- Toggle dark mode.
- Konfigurasi tahun ajaran.
- Pilih semester aktif: ganjil/genap.
- Isi jadwal UTS/UAS untuk semester ganjil dan genap.
- Backup data ke JSON.
- Restore dari file JSON.
- Panduan install PWA untuk Android/iPhone.
- Reset semua data dengan konfirmasi mengetik `RESET`.

Backup:

- `exportBackup()` membuat file `backup_jurnal_guru_YYYY-MM-DD.json`.
- Setelah export, `jg_lastBackup` diisi tanggal hari ini.
- Backup berisi versi `5.0`, waktu export, data guru, semester, kelas, absensi, kasus, catatan, jadwal, dan libur.

Restore:

- File dibaca dengan FileReader.
- JSON diparse lalu dikirim ke `importBackup()`.
- `validateBackup()` minimal memvalidasi `version`, `kelasList`, dan struktur kelas.
- Jika valid, data context diganti dengan isi backup.

Reset:

- `resetAll()` mengosongkan semua state utama.
- Menghapus key localStorage domain utama.
- Tidak terlihat menghapus `jg_onboardingComplete` atau `theme`, sehingga onboarding mungkin tidak muncul lagi setelah reset kecuali key onboarding dihapus manual.

## Dark Mode

Hook: `src/hooks/use-dark-mode.ts`.

Behavior:

- Initial value dari localStorage key `theme`.
- Jika tidak ada, fallback ke `window.matchMedia('(prefers-color-scheme: dark)')`.
- Dark mode diterapkan dengan class `dark` pada `document.documentElement`.
- Toggle menyimpan `theme` sebagai `dark` atau `light`.
- Toggle dispatch custom event `darkmode-change` agar komponen lain sinkron.

Dipakai oleh:

- `AppHeader`.
- `SetelanPage`.

## Header, Sidebar, dan FAB

Header:

- File `src/components/AppHeader.tsx`.
- Menampilkan judul berdasarkan `activeTab`.
- Menampilkan nama kelas aktif.
- Selector kelas mobile jika ada lebih dari satu kelas.
- Indikator backup aman/tidak aman berdasarkan `lastBackupDate <= 7 hari`.
- Toggle dark mode.
- Sheet informasi dan tutorial.

Sidebar:

- File `src/components/AppSidebar.tsx`.
- Mengubah `activeTab`.
- Menjadi navigasi utama desktop/mobile.

FAB:

- File `src/components/FAB.tsx`.
- Muncul di semua tab kecuali `setelan`.
- Action: Absensi, Kasus, Anekdot.
- Catatan penting: `ACTIONS` menggunakan id `kasus` dan `catatan`, tetapi tipe `TabId` di `src/types/index.ts` tidak memuat `kasus` atau `catatan`, dan `AppLayout` juga tidak punya case langsung untuk `kasus`/`catatan`. Yang tersedia adalah `jurnal`, lalu tab internalnya `kasus/catatan/riwayat`. Jika build/typecheck error atau FAB tidak menavigasi benar, ini area yang perlu diperbaiki.

## PWA

Manifest: `public/manifest.json`.

Metadata:

- `name`: `Jurnal Guru Pro`.
- `short_name`: `Jurnal Guru`.
- `description`: `Aplikasi jurnal kelas untuk guru Indonesia`.
- `start_url`: `/`.
- `display`: `standalone`.
- `background_color`: `#0cc0df`.
- `theme_color`: `#0cc0df`.
- `orientation`: `portrait-primary`.
- Icons: `/icon-192.png`, `/icon-512.png`, `/icon-192.svg`.

Catatan penting:

- `vite.config.ts` tidak memakai `vite-plugin-pwa` pada project ini.
- Agar PWA benar-benar lengkap, pastikan `index.html` menghubungkan manifest dan service worker jika memang dibutuhkan.

## UI dan Styling

Styling utama:

- `src/index.css`.
- `src/App.css`.
- `tailwind.config.ts`.

Design pattern:

- Banyak utility custom seperti `card-soft`, `btn-soft`, `input-soft`, `label-upper`, `header-rich`, `icon-btn-rich`, `alert-rich`.
- Warna semantic: primary, accent, semantic-blue/yellow/red/green.
- App mendukung dark mode via class `dark`.

Komponen UI:

- `src/components/ui` berisi shadcn/Radix components seperti dialog, sheet, sidebar, toaster, toast, switch, select, input, table, etc.

## Testing

Unit test:

- Script `npm run test`.
- Config `vitest.config.ts`.
- Setup `src/test/setup.ts`.
- Contoh `src/test/example.test.ts`.

E2E:

- `playwright.config.ts`.
- `playwright-fixture.ts`.
- Tidak terlihat script package khusus Playwright; jalankan manual dengan `npx playwright test` jika perlu.

Lint:

- Script `npm run lint` menjalankan `eslint .`.

## Hal yang Perlu Diperhatikan Agent AI

- Data domain sepenuhnya lokal di localStorage; tidak ada backend/auth.
- Jangan mengasumsikan status `H` absensi ada di storage. Hadir adalah default jika tidak ada exception S/I/A.
- Jika ingin menghitung hari absensi semua hadir, model saat ini tidak menyimpan tanggal tersebut kecuali ada exception.
- `activeTab` adalah state navigasi utama, bukan React Router path.
- `TabId` hanya berisi `home`, `siswa`, `absen`, `jurnal`, `jadwal`, `laporan`, `setelan`.
- `FAB.tsx` saat ini memakai `kasus` dan `catatan` sebagai `TabId`, padahal tidak ada di tipe/layout. Ini potensi bug.
- `HomePage` punya tombol `setActiveTab('kasus')` pada alert pemanggilan, ini juga tidak sesuai `TabId`.
- `resetAll()` tidak menghapus `jg_onboardingComplete`, sehingga onboarding tidak otomatis muncul setelah reset.
- `deleteKelas()` hanya menghapus kelas dari `kelasList`; data absensi/kasus/catatan/jadwal terkait kelas tersebut tidak terlihat ikut dihapus di context, meskipun pesan UI menyebut akan ikut terhapus.
- `addStudentsToKelas()` tidak deduplicate siswa/NIS.
- Import backup validasinya minimal, bukan schema lengkap.
- Export Excel memakai HTML `.xls`, bukan library XLSX.
- `manifest.json` ada, tetapi tidak terlihat plugin PWA/service worker di Vite config.
- Banyak fitur bergantung pada `activeKelas`; pastikan fallback ketika tidak ada kelas.
- Kelas tanpa `jenjang` dianggap `SMP` di absensi/libur/dashboard.

## Ringkasan Alur End-to-End

Alur awal:

1. User membuka app.
2. Jika `jg_onboardingComplete` belum ada, onboarding muncul.
3. User mengisi nama guru.
4. User membuat kelas pertama.
5. User masuk beranda.
6. User menambah siswa di menu Data Kelas & Siswa.

Alur absensi:

1. User memilih kelas aktif.
2. User buka tab Absensi.
3. User pilih tanggal, periode, dan mata pelajaran opsional.
4. User set status siswa H/S/I/A dan keterangan jika perlu.
5. User menyimpan absensi.
6. Context menyimpan hanya S/I/A ke `jg_absenRecords`; H tidak disimpan.

Alur jurnal kasus/catatan:

1. User buka tab Jurnal.
2. User pilih Kasus untuk mencatat masalah siswa, kategori, status, dan jadwal pemanggilan.
3. User pilih Anekdot untuk catatan prestasi/perkembangan/umum.
4. Data masuk ke `jg_kasusRecords` atau `jg_catatanRecords`.
5. Data bisa dilihat/diedit/dihapus di Riwayat.

Alur laporan:

1. User buka tab Laporan.
2. User pilih siswa atau semua siswa.
3. User pilih periode minggu/bulan/semua.
4. App membuat rekap S/I/A/kasus dan menampilkan log kasus/catatan.
5. User bisa export CSV atau Excel.

Alur backup:

1. App memberi alert jika belum backup atau backup lebih dari 7 hari.
2. User buka Setelan.
3. User klik Backup Data JSON.
4. File backup terunduh dan `jg_lastBackup` diperbarui.
5. User bisa restore dari JSON backup.

## File Referensi Cepat

- Entry app: `src/main.tsx`
- Router/provider UI: `src/App.tsx`
- App provider: `src/context/AppContext.tsx`
- Tipe data: `src/types/index.ts`
- Layout utama: `src/components/AppLayout.tsx`
- Header: `src/components/AppHeader.tsx`
- Sidebar: `src/components/AppSidebar.tsx`
- Onboarding: `src/components/OnboardingWizard.tsx`
- Beranda: `src/pages/HomePage.tsx`
- Siswa: `src/pages/SiswaPage.tsx`
- Absensi: `src/pages/AbsenPage.tsx`
- Jurnal wrapper: `src/pages/JurnalPage.tsx`
- Kasus: `src/pages/KasusPage.tsx`
- Catatan: `src/pages/CatatanPage.tsx`
- Riwayat: `src/pages/RiwayatPage.tsx`
- Laporan: `src/pages/LaporanPage.tsx`
- Jadwal: `src/pages/JadwalPage.tsx`
- Setelan: `src/pages/SetelanPage.tsx`
- Dark mode: `src/hooks/use-dark-mode.ts`
- Manifest: `public/manifest.json`
- Vite config: `vite.config.ts`
