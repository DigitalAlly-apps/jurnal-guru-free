import { useApp } from '@/context/AppContext';
import { BottomNav } from './BottomNav';
import { AppHeader } from './AppHeader';
import { KelasBar } from './KelasBar';
import { ToastContainer } from './ToastContainer';
import { HomePage } from '@/pages/HomePage';
import { AbsenPage } from '@/pages/AbsenPage';
import { KasusPage } from '@/pages/KasusPage';
import { LaporanPage } from '@/pages/LaporanPage';
import { CatatanPage } from '@/pages/CatatanPage';
import { SetelanPage } from '@/pages/SetelanPage';

const TAB_TITLES: Record<string, string> = {
  home: 'Beranda',
  absen: 'Absensi',
  kasus: 'Kasus',
  laporan: 'Laporan',
  catatan: 'Catatan',
  setelan: 'Setelan',
};

const TABS_WITH_KELAS = ['home', 'absen', 'kasus', 'laporan', 'catatan'];

export function AppLayout() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'absen': return <AbsenPage />;
      case 'kasus': return <KasusPage />;
      case 'laporan': return <LaporanPage />;
      case 'catatan': return <CatatanPage />;
      case 'setelan': return <SetelanPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-[68px]">
      <AppHeader title={TAB_TITLES[activeTab]} />
      {TABS_WITH_KELAS.includes(activeTab) && <KelasBar />}
      <main className="p-[16px]">
        {renderPage()}
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
