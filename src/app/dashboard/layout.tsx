
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  BookText,
  Search,
  Settings,
  Rocket,
  Ticket,
  ChevronDown,
  FileText as FileTextIcon,
  History,
  Beaker,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';


import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardNav } from '@/components/dashboard-nav';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PrivateRoute from '@/components/private-route';
import { useAuth } from '@/contexts/auth-context';
import type { Company } from '@/lib/types';
import { getCompanyByAuthUid, updateCompany } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';


function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, db } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
 
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    async function fetchCompany() {
      if (user && db) {
        setLoadingCompany(true);
        const fetchedCompany = await getCompanyByAuthUid(db, user.uid);
        setCompany(fetchedCompany);
        setLoadingCompany(false);
      }
    }
    fetchCompany();
  }, [user, db]);
  
  const currentStatus = company?.status || 'Development';

  const statusStyles = {
    Production: 'text-chart-2 border-chart-2 bg-chart-2/10 hover:bg-chart-2/20',
    Development: 'text-destructive border-destructive bg-destructive/10 hover:bg-destructive/20',
    Demo: 'text-chart-4 border-chart-4 bg-chart-4/10 hover:bg-chart-4/20',
  };

  const activePlanConfig = company?.status === 'Production'
    ? company.factoryHkaConfig.production
    : company?.factoryHkaConfig.demo;

  const foliosUsed = activePlanConfig?.documentsUsedThisMonth || 0;
  const maxFolios = activePlanConfig?.maxDocumentsPerMonth || 0;
  
  const toggleCompanyStatus = async () => {
    if (!db || !company) return;

    const newStatus = company.status === 'Demo' ? 'Production' : 'Demo';
    const { success, error } = await updateCompany(db, company.id, { status: newStatus });

    if (success) {
      setCompany(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: 'Ambiente Actualizado',
        description: `La compañía ha sido cambiada al ambiente de ${newStatus}.`,
      });
    } else {
      toast({
        title: 'Error al Actualizar',
        description: `No se pudo cambiar el ambiente: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }


  return (
    <TooltipProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo />
              </Link>
            </div>
            <div className="flex-1">
              <DashboardNav isCollapsed={false} />
            </div>
            <div className="mt-auto p-4 space-y-4">
              <Card>
                <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle>Configurar API y ERP</CardTitle>
                  <CardDescription>
                    Conecta tu sistema o configura los ajustes de la API.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" className="w-full" asChild>
                        <Link href="/dashboard/settings/api">
                          <Settings className="mr-2 h-4 w-4" />
                          Configurar API
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Gestionar credenciales para la API de HKA y clientes.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle>Documentación</CardTitle>
                  <CardDescription>
                    Guía completa para integrar y usar el sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" className="w-full" asChild>
                        <Link href="/dashboard/documentation">
                          <BookText className="mr-2 h-4 w-4" />
                          Leer Manual
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Acceder a la guía de integración y al historial de cambios.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle>¿Necesitas ayuda?</CardTitle>
                  <CardDescription>
                    Contacta a soporte para cualquier pregunta sobre integraciones.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <Button size="sm" className="w-full">
                    Contactar Soporte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Alternar menú de navegación</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Logo />
                  </Link>
                  <DashboardNav isCollapsed={false} />
                </nav>
                <div className="mt-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle>¿Necesitas ayuda?</CardTitle>
                      <CardDescription>
                        Contacta a soporte para cualquier pregunta sobre integraciones.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" className="w-full">
                         Contactar Soporte
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex-1">
                <Button
                  variant="outline"
                  className={cn(
                    'relative w-full justify-start text-sm text-muted-foreground'
                  )}
                  onClick={() => setOpen(true)}
                >
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4" />
                  <span className="pl-6">Buscar globalmente...</span>
                  <CommandShortcut className="absolute right-2 top-1/2 -translate-y-1/2">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          <span className="text-xs">⌘</span>K
                      </kbd>
                  </CommandShortcut>
                </Button>
            </div>
             <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Escribe un comando o busca..." />
                <CommandList>
                  <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                  <CommandGroup heading="Páginas">
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/documents'))}>
                      <FileTextIcon className="mr-2" />
                      <span>Documentos</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/logs'))}>
                      <History className="mr-2" />
                      <span>System Logs</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/exports'))}>
                      <Download className="mr-2" />
                      <span>Exportaciones</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/testing'))}>
                      <Beaker className="mr-2" />
                      <span>Pruebas de API</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Configuración">
                     <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
                       <Settings className="mr-2" />
                       <span>Ajustes Generales</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings/api'))}>
                       <Rocket className="mr-2" />
                       <span>Configuración de API</span>
                    </CommandItem>
                     <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/documentation'))}>
                       <BookText className="mr-2" />
                       <span>Documentación</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
            </CommandDialog>
             <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Configuración General</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Acceder a la configuración general de la cuenta.</p>
                </TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                   <Button
                    variant="default"
                    size="sm"
                    className="bg-chart-4 text-black hover:bg-chart-4/90 dark:bg-chart-4 dark:hover:bg-chart-4/90"
                    asChild
                  >
                    <Link href="/dashboard/settings/api">
                      <Rocket className="mr-2 h-4 w-4" />
                      API Producción
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configurar credenciales para el entorno de producción.</p>
                </TooltipContent>
              </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border rounded-md px-3 h-9">
                        <Ticket className="h-4 w-4" />
                        {loadingCompany ? (
                          <Skeleton className="w-24 h-4" />
                        ) : (
                          <span>Folios: {(maxFolios - foliosUsed).toLocaleString()} / {maxFolios.toLocaleString()}</span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Folios disponibles en el plan actual.</p>
                </TooltipContent>
            </Tooltip>
            <ThemeToggle />
            <div className="flex items-center gap-2">
               {loadingCompany ? (
                 <Skeleton className="w-28 h-9" />
               ) : (
                  <DropdownMenu>
                    <Tooltip>
                       <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={cn("pl-3 pr-2", statusStyles[currentStatus])}>
                              <span className="font-semibold">{currentStatus}</span>
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                       <TooltipContent>
                         <p>Cambiar ambiente de trabajo</p>
                       </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={toggleCompanyStatus} disabled={currentStatus === 'Production'}>
                         Cambiar a Producción
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={toggleCompanyStatus} disabled={currentStatus === 'Demo'}>
                         Cambiar a Demo
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               )}
              <UserNav />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </PrivateRoute>
  );
}

    