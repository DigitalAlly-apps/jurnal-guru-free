import { useApp } from '@/context/AppContext';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { FAB } from './FAB';
import { ToastContainer } from './ToastContainer';
import { SidebarProvider } from '@/components/ui/sidebar';
import { HomePage } from '@/pages/HomePage';
import { AbsenPage } from '@/pages/AbsenPage';
import { JadwalPage } from '@/pages/JadwalPage';
import { SiswaPage } from '@/pages/SiswaPage';
import { SetelanPage } from '@/pages/SetelanPage';
import { JurnalPage } from '@/pages/JurnalPage';
import { LaporanRiwayatPage } from '@/pages/LaporanRiwayatPage';

export function AppLayout() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'home':       return <HomePage />;
      case 'siswa':      return <SiswaPage />;
      case 'absen':      return <AbsenPage />;
      case 'jurnal':     return <JurnalPage />;
      case 'jadwal':     return <JadwalPage />;
      case 'laporan':    return <LaporanRiwayatPage />;
      case 'setelan':    return <SetelanPage />;
      default:           return <HomePage />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
        <FAB />
        <ToastContainer />
      </div>
    </SidebarProvider>
  );
}
