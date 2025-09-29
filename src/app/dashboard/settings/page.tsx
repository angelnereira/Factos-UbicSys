
'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from "next/link"
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  ShieldCheck,
  Database,
  Palette,
  User,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


const settingsNav = [
    {
        id: 'account',
        name: "Cuenta",
        description: "Gestiona tu información de perfil.",
        icon: User,
        href: '/dashboard/settings?tab=account'
    },
    {
        id: 'appearance',
        name: "Apariencia",
        description: "Personaliza la apariencia de la app.",
        icon: Palette,
        href: '/dashboard/settings?tab=appearance'
    },
    {
        id: 'credentials',
        name: "Credenciales y API",
        description: "Administra tus claves de API y secretos.",
        icon: ShieldCheck,
        href: '/dashboard/settings/api' // Direct link to the dedicated page
    },
    {
        id: 'data',
        name: "Datos",
        description: "Administra tus datos y exportaciones.",
        icon: Database,
        href: '/dashboard/settings?tab=data'
    },
]

function AccountSettings() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <CardTitle>Cuenta</CardTitle>
                    <Badge variant="outline" className="border-chart-4 bg-chart-4/10 text-chart-4">Administrador</Badge>
                </div>
                <CardDescription>
                    Realiza cambios en tu cuenta aquí. Haz clic en guardar cuando hayas terminado.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="name">Nombre</Label>
                    <div className="mt-2">
                        <Input type="text" name="name" id="name" defaultValue="Admin" />
                    </div>
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="mt-2">
                        <Input type="email" name="email" id="email" defaultValue="admin@factos-ubicsys.com" readOnly />
                    </div>
                </div>
            </CardContent>
            <CardContent>
                <Button>Guardar Cambios</Button>
            </CardContent>
        </Card>
    );
}

function AppearanceSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>
                    Personaliza la apariencia de la aplicación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Theme toggle can be placed here */}
                <p>Opciones de tema próximamente.</p>
            </CardContent>
        </Card>
    );
}

function DataSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Datos</CardTitle>
                <CardDescription>
                    Administra tus datos y realiza exportaciones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Opciones de gestión de datos próximamente.</p>
                 <Button variant="outline" className="mt-4">Exportar todos los datos</Button>
            </CardContent>
        </Card>
    );
}


function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'account';
  const [activeTab, setActiveTab] = useState(currentTab);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);
  
  const handleTabChange = (href: string) => {
      router.push(href, { scroll: false });
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Configuración
          </h1>
          <p className="text-muted-foreground">
            Gestiona la configuración de tu cuenta, apariencia, credenciales y datos.
          </p>
        </div>
      </div>
      <main className="grid flex-1 gap-x-8 gap-y-10 md:grid-cols-3">
          <nav className="md:col-span-1">
              <ul role="list" className="space-y-1">
                  {settingsNav.map((item) => (
                      <li key={item.name}>
                          <Link
                              href={item.href}
                              onClick={(e) => {
                                  e.preventDefault();
                                  handleTabChange(item.href);
                              }}
                              className={cn(
                                  activeTab === item.id && item.id !== 'credentials'
                                      ? "bg-accent text-primary"
                                      : "hover:bg-accent hover:text-primary",
                                  "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground w-full text-left"
                              )}
                          >
                              <item.icon
                                  className={cn(
                                      activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                                      "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                              />
                              <div className="flex-1">
                                <span>{item.name}</span>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 self-center text-muted-foreground/50" />
                          </Link>
                      </li>
                  ))}
              </ul>
          </nav>
          <div className="md:col-span-2">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'data' && <DataSettings />}
            {activeTab === 'credentials' && 
              <Card>
                  <CardHeader>
                      <CardTitle>Credenciales y API</CardTitle>
                      <CardDescription>
                          Has sido redirigido a la página de configuración de API.
                      </CardDescription>
                  </CardHeader>
              </Card>
            }
          </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SettingsPageContent />
        </Suspense>
    );
}
