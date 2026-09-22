import { Link } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CalendarCheck,
    Database,
    LayoutDashboard,
    Settings,
    Tags,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const operatorNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Master Data',
        icon: Database,
        items: [
            {
                title: 'Data Pimpinan',
                href: '/master/pimpinan',
                icon: UserCheck,
            },
            {
                title: 'Data Ruangan & Tempat',
                href: '/master/ruangan',
                icon: Building2,
            },
            {
                title: 'Jenis / Kategori Kegiatan',
                href: '/master/kategori',
                icon: Tags,
            },
        ],
    },
    {
        title: 'Kelola Pengguna',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Kelola Agenda',
        href: '/agenda',
        icon: CalendarCheck,
    },
    {
        title: 'Kalender Agenda',
        href: '/kalender',
        icon: Calendar,
    },
    {
        title: 'Pengaturan Sistem',
        href: '/settings/system',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={operatorNavItems} label="Platform" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
