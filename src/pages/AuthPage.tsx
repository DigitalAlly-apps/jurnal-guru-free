import React, { useState } from 'react';
import { useSupabase } from '@/context/SupabaseContext';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, Lock, Mail, User as UserIcon, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { user, profile, isConfigured, signIn, signUp, signOut, syncState, lastSyncTime } = useSupabase();
  const { syncWithCloud, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaGuru, setNamaGuru] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('⚠️ Mohon isi email dan password');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      showToast(`❌ Gagal masuk: ${error.message || 'Email atau password salah'}`);
    } else {
      showToast('🔑 Berhasil masuk ke akun Cloud!');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !namaGuru) {
      showToast('⚠️ Mohon lengkapi semua kolom');
      return;
    }
    if (password.length < 6) {
      showToast('⚠️ Password minimal harus 6 karakter');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, namaGuru);
    setLoading(false);
    if (error) {
      showToast(`❌ Gagal mendaftar: ${error.message}`);
    } else {
      showToast('🎉 Pendaftaran berhasil! Silakan cek email konfirmasi (jika ada) atau masuk.');
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    const success = await syncWithCloud();
    setLoading(false);
  };

  // ── 1. JIKA SUPABASE BELUM DIKONFIGURASI ───────────────────────────────────
  if (!isConfigured) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl mb-4 text-amber-500 ring-4 ring-amber-500/10">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Cloud Sync Belum Siap
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Supabase Client belum memiliki kredensial API. Silakan ikuti panduan setup di bawah untuk mengaktifkan sinkronisasi cloud.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <Card className="md:col-span-3 border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-b from-white to-amber-50/10 dark:from-slate-900 dark:to-amber-950/5 shadow-xl shadow-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs">!</span>
                Panduan Setup File Kredensial
              </CardTitle>
              <CardDescription>
                Hubungkan aplikasi ini ke basis data Supabase Anda dalam 3 langkah mudah.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Buat File `.env.local`</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Buat file baru bernama <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs text-amber-600">.env.local</code> di root direktori proyek ini.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">
                    2
                  </div>
                  <div className="w-full">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Salin Kunci API Supabase</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 mb-2">
                      Masukkan URL Project dan Kunci Anonim Anda dari dashboard Supabase ke file tersebut:
                    </p>
                    <pre className="p-3 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Jalankan Ulang Server Proyek</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Matikan server pengembangan saat ini lalu ketik <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs text-amber-600">npm run dev</code> untuk memuat ulang variabel lingkungan.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 shadow-lg bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Mengapa Cloud Sync?</CardTitle>
              <CardDescription>Keunggulan sinkronisasi cloud.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aman & Terenkripsi</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Semua jurnal, kasus, dan absensi tersimpan dengan aman di database cloud.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Multi Perangkat</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Akses data yang sama dari Handphone, Laptop, atau Tablet guru secara real-time.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Local-First (Offline OK)</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Aplikasi tetap lancar dipakai di daerah tanpa sinyal. Sync berjalan saat internet terdeteksi.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── 2. JIKA USER SUDAH MASUK (LOGGED IN) ──────────────────────────────────
  if (user) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <Card className="border-indigo-100 dark:border-indigo-950 bg-gradient-to-b from-white to-indigo-50/5 dark:from-slate-950 dark:to-indigo-950/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -ml-10 -mb-10" />

          <CardHeader className="text-center pb-4">
            <div className="inline-flex p-3.5 bg-indigo-500/10 rounded-2xl mb-4 text-indigo-500 ring-4 ring-indigo-500/5">
              <Cloud size={32} className="animate-bounce" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Sinkronisasi Cloud Aktif
            </CardTitle>
            <CardDescription className="text-indigo-600 dark:text-indigo-400 font-medium">
              Sesi terhubung sebagai {profile?.nama_guru || 'Guru'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email Akun</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{user.email}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status Sinkronisasi</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  syncState === 'syncing' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' :
                  syncState === 'error' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' :
                  'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    syncState === 'syncing' ? 'bg-blue-500 animate-pulse' :
                    syncState === 'error' ? 'bg-rose-500' :
                    'bg-emerald-500'
                  }`} />
                  {syncState === 'syncing' ? 'Menyinkronkan...' :
                   syncState === 'error' ? 'Gagal Sinkron' :
                   'Tersinkronisasi'}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sinkronisasi Terakhir</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{lastSyncTime || 'Belum pernah'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleManualSync} 
                disabled={loading || syncState === 'syncing'} 
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform"
              >
                {syncState === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan Sekarang ☁️'}
              </Button>
              <p className="text-center text-xs text-slate-400">
                Pembaruan lokal akan otomatis terunggah ke basis data cloud dalam beberapa detik.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              variant="outline" 
              onClick={signOut} 
              disabled={loading}
              className="w-full border-slate-200 dark:border-slate-800 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20 rounded-xl"
            >
              Keluar Akun Cloud
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ── 3. FORM AUTH (MASUK / DAFTAR TABS) ────────────────────────────────────
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
        
        {/* Kolom Informasi Benefit (Kiri) */}
        <div className="md:col-span-5 space-y-6 hidden md:block">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-semibold tracking-wider uppercase">
              Cloud Storage
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Satu Jurnal, Banyak Perangkat
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Dengan mengaktifkan Cloud Sync, Anda tidak perlu khawatir kehilangan jurnal guru saat HP rusak atau hilang.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 flex-shrink-0">
                <Cloud size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Auto Background Sync</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data otomatis tersinkron secara hening di latar belakang saat Anda terhubung ke internet.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 flex-shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Aman & Terkendali</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data Anda diisolasi menggunakan Row Level Security (RLS) Supabase, menjamin privasi penuh.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 flex-shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Mudah & Cepat</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar akun gratis, integrasi langsung aktif tanpa ribet import & export manual lagi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Form (Kanan) */}
        <div className="md:col-span-7 w-full">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg font-semibold py-2">Masuk Akun</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg font-semibold py-2">Daftar Cloud</TabsTrigger>
            </TabsList>

            {/* Tab Masuk */}
            <TabsContent value="login" className="animate-in fade-in-50 duration-200">
              <Card className="border-slate-100 dark:border-slate-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Masuk Cloud Sync</CardTitle>
                  <CardDescription>Masukkan email dan kata sandi Anda untuk mulai sinkronisasi.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                          id="email-login" 
                          type="email" 
                          placeholder="nama@email.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-login">Kata Sandi</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                          id="password-login" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/10"
                    >
                      {loading ? 'Memproses...' : 'Masuk Ke Cloud'}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Tab Daftar */}
            <TabsContent value="register" className="animate-in fade-in-50 duration-200">
              <Card className="border-slate-100 dark:border-slate-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Daftar Akun Baru</CardTitle>
                  <CardDescription>Lengkapi formulir untuk membuat profil guru dan database cloud.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama-register">Nama Lengkap Guru</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                          id="nama-register" 
                          type="text" 
                          placeholder="Budi Sudarsono, S.Pd." 
                          value={namaGuru}
                          onChange={(e) => setNamaGuru(e.target.value)}
                          className="pl-10 h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-register">Alamat Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                          id="email-register" 
                          type="email" 
                          placeholder="nama@email.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-register">Kata Sandi</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                          id="password-register" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Minimal 6 karakter" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/10"
                    >
                      {loading ? 'Mendaftar...' : 'Buat Akun Cloud'}
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
