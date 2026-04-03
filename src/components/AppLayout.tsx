import { useApp } from '@/context/AppContext';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { FAB } from './FAB';
import { ToastContainer } from './ToastContainer';
import { SidebarProvider } from '@/components/ui/sidebar';
import { HomePage } from '@/pages/HomePage';
import { AbsenPage } from '@/pages/AbsenPage';
import { KasusPage } from '@/pages/KasusPage';
import { LaporanPage } from '@/pages/LaporanPage';
import { CatatanPage } from '@/pages/CatatanPage';
import { SiswaPage } from '@/pages/SiswaPage';
import { SetelanPage } from '@/pages/SetelanPage';

export function AppLayout() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'absen': return <AbsenPage />;
      case 'kasus': return <KasusPage />;
      case 'laporan': return <LaporanPage />;
      case 'catatan': return <CatatanPage />;
      case 'siswa': return <SiswaPage />;
      case 'setelan': return <SetelanPage />;
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
