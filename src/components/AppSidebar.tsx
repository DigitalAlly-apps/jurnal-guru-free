import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TabId } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { JurnalGuruLogo } from '@/components/JurnalGuruLogo';

const NAV_ITEMS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'home', label: 'Beranda', icon: LayoutDashboard },
  { id: 'absen', label: 'Absensi', icon: ClipboardCheck },
  { id: 'kasus', label: 'Kasus', icon: AlertTriangle },
  { id: 'catatan', label: 'Catatan', icon: BookOpen },
  { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  { id: 'siswa', label: 'Profil Siswa', icon: Users },
];

export function AppSidebar() {
  const { activeTab, setActiveTab, kelasList, activeKelas, setActiveKelas } = useApp();
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleNav = (tab: TabId) => {
    setActiveTab(tab);
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* ── Brand / Logo ── */}
        <div className="flex items-center justify-center border-b border-sidebar-border py-4 px-3">
          {collapsed ? (
            <JurnalGuruLogo size={32} showText={false} />
          ) : (
            <JurnalGuruLogo size={100} showText={true} className="my-1" />
          )}
        </div>

        {/* Kelas selector */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <label className="label-upper block mb-1.5 px-1">Kelas Aktif</label>
            <select
              value={activeKelas}
              onChange={e => setActiveKelas(e.target.value)}
              className="w-full px-3 py-2 bg-bg-2 border border-border rounded-md text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>Kelas {k.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNav(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.label}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNav('setelan')}
              isActive={activeTab === 'setelan'}
              tooltip="Setelan"
            >
              <Settings className="w-4 h-4" />
              <span>Setelan</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}