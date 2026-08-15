import { useApp } from '@/context/AppContext';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { FAB } from './FAB';
import { ToastContainer } from './ToastContainer';
import { SidebarProvider } from '@/components/ui/sidebar';
import { HomePage } from '@/pages/HomePage';
import { AbsenPage } from '@/pages/AbsenPage';
import { SiswaPage } from '@/pages/SiswaPage';
import { SetelanPage } from '@/pages/SetelanPage';
import { JurnalPage } from '@/pages/JurnalPage';
import { LaporanRiwayatPage } from '@/pages/LaporanRiwayatPage';
import AuthPage from '@/pages/AuthPage';
import { OnboardingWizard } from '@/components/OnboardingWizard';

export function AppLayout() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'home':       return <HomePage />;
      case 'siswa':      return <SiswaPage />;
      case 'absen':      return <AbsenPage />;
      case 'jurnal':     return <JurnalPage />;
      case 'laporan':    return <LaporanRiwayatPage />;
      case 'setelan':    return <SetelanPage />;
      case 'auth':       return <AuthPage />;
      default:           return <HomePage />;
    }
  };

  return (
    <SidebarProvider>
      <OnboardingWizard />
      <div className="flex h-[100dvh] w-full overflow-hidden overscroll-none">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
            {renderPage()}
          </main>
        </div>
        <FAB />
        <ToastContainer />
      </div>
    </SidebarProvider>
  );
}
