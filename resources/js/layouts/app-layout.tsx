import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { SessionManager } from '@/components/session-manager';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <SessionManager />
            {children}
        </AppLayoutTemplate>
    );
}
