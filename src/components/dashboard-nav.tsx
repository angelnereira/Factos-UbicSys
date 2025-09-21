
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Users,
  Settings,
  History,
  Activity,
  Landmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard/monitoring', label: 'Monitoreo', icon: Activity },
  { href: '/dashboard/documents', label: 'Documentos', icon: FileText },
  { href: '/dashboard/clients', label: 'Compañías', icon: Users },
  { href: '/dashboard/logs', label: 'Registros', icon: History },
  { href: '/dashboard/finance', label: 'Finanzas', icon: Landmark },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

export function DashboardNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();

  const getBasePath = (path: string) => {
    const parts = path.split('/');
    if (parts.length > 2) {
      return `/${parts[1]}/${parts[2]}`;
    }
    return path;
  };

  const basePath = getBasePath(pathname);

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <nav className="grid gap-1 p-2">
          {navItems.map(item => (
            <Tooltip key={item.label} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    basePath === item.href && 'bg-accent text-accent-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    );
  }

  return (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium">
      {navItems.map(item => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            (basePath === item.href || (pathname === '/dashboard' && item.href.includes('monitoring'))) && 'bg-accent text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
