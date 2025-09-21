
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Home, Users, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard/documents', label: 'Inicio', icon: Home },
  { href: '/dashboard/documents', label: 'Documentos', icon: FileText },
  { href: '/dashboard/clients', label: 'Compañías', icon: Users },
];

export function DashboardNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();

  const getBasePath = (path: string) => {
    if (path === '/dashboard') return '/dashboard/documents'; // Default to documents
    const parts = path.split('/');
    return `/${parts[1]}/${parts[2]}`;
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
                    basePath === item.href && item.label !== 'Inicio' && 'bg-accent text-accent-foreground',
                     pathname === item.href && item.label === 'Inicio' && 'bg-accent text-accent-foreground'
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
            (basePath === item.href && item.href !== '/dashboard/documents') && 'bg-accent text-primary',
            (basePath === item.href && item.label === 'Documentos') && 'bg-accent text-primary',
            (pathname === '/dashboard' && item.label === 'Inicio') && 'bg-accent text-primary',
            (pathname === item.href && item.label === 'Inicio') && 'bg-accent text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
