import { Link, usePage } from '@inertiajs/react';
import {
    BellRing,
    Building2,
    Calendar,
    CalendarCheck,
    Database,
    LayoutDashboard,
    Printer,
    Settings,
    Tags,
    UserCheck,
    Users,
    type LucideIcon,
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
import { index as calendarIndex } from '@/routes/calendar';
import { index as eventsIndex } from '@/routes/events';
import { index as leadershipCalendar } from '@/routes/leadership/calendar';
import { dashboard as leadershipDashboard } from '@/routes/leadership';
import { index as leadershipNotifications } from '@/routes/leadership/notifications';
import { index as categoriesIndex } from '@/routes/master/categories';
import { index as leadersIndex } from '@/routes/master/leaders';
import { index as roomsIndex } from '@/routes/master/rooms';
import { index as protokolCalendar } from '@/routes/protokol/calendar';
import { dashboard as protokolDashboard } from '@/routes/protokol';
import { index as protokolEvents } from '@/routes/protokol/events';
import { index as protokolExports } from '@/routes/protokol/exports';
import { system as settingsSystem } from '@/routes/settings';
import { index as usersIndex } from '@/routes/users';
import type { NavItem, UserRole } from '@/types';

type SidebarConfig = {
    label: string;
    home: string;
    navItems: NavItem[];
};

type SidebarNavItem = NavItem & {
    icon?: LucideIcon | null;
};

const operatorNavItems: SidebarNavItem[] = [
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
                href: leadersIndex().url,
                icon: UserCheck,
            },
            {
                title: 'Data Ruangan & Tempat',
                href: roomsIndex().url,
                icon: Building2,
            },
            {
                title: 'Jenis / Kategori Kegiatan',
                href: categoriesIndex().url,
                icon: Tags,
            },
        ],
    },
    {
        title: 'Kelola Pengguna',
        href: usersIndex().url,
        icon: Users,
    },
    {
        title: 'Kelola Agenda',
        href: eventsIndex().url,
        icon: CalendarCheck,
    },
    {
        title: 'Kalender Agenda',
        href: calendarIndex().url,
        icon: Calendar,
    },
    {
        title: 'Pengaturan Sistem',
        href: settingsSystem().url,
        icon: Settings,
    },
];

function resolveSidebarConfig(role?: UserRole): SidebarConfig {
    switch (role) {
        case 'protokol':
            return {
                label: 'Tim Protokol',
                home: protokolDashboard().url,
                navItems: [
                    {
                        title: 'Beranda',
                        href: protokolDashboard().url,
                        icon: LayoutDashboard,
                    },
                    {
                        title: 'Kelola Agenda',
                        href: protokolEvents().url,
                        icon: CalendarCheck,
                    },
                    {
                        title: 'Kalender Agenda',
                        href: protokolCalendar().url,
                        icon: Calendar,
                    },
                    {
                        title: 'Cetak & Ekspor',
                        href: protokolExports().url,
                        icon: Printer,
                    },
                ],
            };
        case 'kajati':
        case 'wakajati':
            return {
                label: 'Leadership',
                home: leadershipDashboard().url,
                navItems: [
                    {
                        title: 'Beranda',
                        href: leadershipDashboard().url,
                        icon: LayoutDashboard,
                    },
                    {
                        title: 'Kalender Agenda',
                        href: leadershipCalendar().url,
                        icon: Calendar,
                    },
                    {
                        title: 'Pengaturan Notifikasi',
                        href: leadershipNotifications().url,
                        icon: BellRing,
                    },
                ],
            };
        default:
            return {
                label: 'Platform',
                home: dashboard().url,
                navItems: operatorNavItems,
            };
    }
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const config = resolveSidebarConfig(auth.user?.role);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={config.home} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={config.navItems} label={config.label} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
