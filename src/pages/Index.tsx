import { SupabaseProvider } from '@/context/SupabaseContext';
import { AppProvider } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';

const Index = () => (
  <SupabaseProvider>
    <AppProvider>
      <AppLayout />
    </AppProvider>
  </SupabaseProvider>
);

export default Index;
