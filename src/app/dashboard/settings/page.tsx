
'use client';

import { useState } from 'react';
import Link from "next/link"
import {
  ChevronRight,
  ShieldCheck,
  Database,
  Palette,
  User,
  KeyRound,
  Eye,
  EyeOff,
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
    },
    {
        id: 'appearance',
        name: "Apariencia",
        description: "Personaliza la apariencia de la app.",
        icon: Palette,
    },
    {
        id: 'credentials',
        name: "Credenciales",
        description: "Administra tus claves de API.",
        icon: ShieldCheck,
    },
    {
        id: 'data',
        name: "Datos",
        description: "Administra tus datos y exportaciones.",
        icon: Database,
    },
]

function AccountSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cuenta</CardTitle>
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

function CredentialsSettings() {
    const [showDemoPass, setShowDemoPass] = useState(false);
    const [showProdPass, setShowProdPass] = useState(false);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound /> Bóveda de Secretos
                </CardTitle>
                <CardDescription>
                    Gestiona las credenciales de API para la conexión con The Factory HKA. Estos datos son sensibles y están encriptados.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Demo Credentials */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Ambiente de Demo / Pruebas</h3>
                     <div className="space-y-2">
                        <Label htmlFor="demo-user">Username</Label>
                        <Input id="demo-user" defaultValue="walgofugiitj_ws_tfhka" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="demo-pass">Password</Label>
                        <div className="relative">
                            <Input id="demo-pass" type={showDemoPass ? 'text' : 'password'} defaultValue="Tfhka.P4n4m4.2023" />
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowDemoPass(!showDemoPass)}>
                                {showDemoPass ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                    </div>
                </div>
                
                 {/* Production Credentials */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Ambiente de Producción</h3>
                     <div className="space-y-2">
                        <Label htmlFor="prod-user">Username</Label>
                        <Input id="prod-user" placeholder="Aún no configurado" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="prod-pass">Password</Label>
                         <div className="relative">
                            <Input id="prod-pass" type={showProdPass ? 'text' : 'password'} placeholder="Aún no configurado" />
                             <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowProdPass(!showProdPass)}>
                                {showProdPass ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                    </div>
                </div>

            </CardContent>
            <CardContent>
                 <Button>Guardar Credenciales</Button>
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


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

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
                          <button
                              onClick={() => setActiveTab(item.id)}
                              className={cn(
                                  activeTab === item.id
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
                          </button>
                      </li>
                  ))}
              </ul>
          </nav>
          <div className="md:col-span-2">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'credentials' && <CredentialsSettings />}
            {activeTab === 'data' && <DataSettings />}
          </div>
      </main>
    </div>
  )
}
