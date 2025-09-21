
import Link from 'next/link';
import {
  Menu,
  BookText,
  Search,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardNav } from '@/components/dashboard-nav';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Placeholder for the current status. In a real app, this would come from a state management or context.
  const currentStatus: 'Production' | 'Development' | 'Demo' = 'Demo';

  const statusStyles = {
    Production: 'text-chart-2 border-chart-2 bg-chart-2/10',
    Development: 'text-destructive border-destructive bg-destructive/10',
    Demo: 'text-chart-4 border-chart-4 bg-chart-4/10',
  };


  return (
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
                <Button size="sm" className="w-full" asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Ir a Configuración
                  </Link>
                </Button>
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
                <Button size="sm" className="w-full" asChild>
                  <Link href="/dashboard/documentation">
                    <BookText className="mr-2 h-4 w-4" />
                    Leer Manual
                  </Link>
                </Button>
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
          <div className="w-full flex-1">
            <form>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar documentos, clientes, RUC..."
                        className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                    />
                </div>
            </form>
          </div>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(statusStyles[currentStatus])}>
              {currentStatus}
            </Badge>
            <UserNav />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
