
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
  KeyRound,
  Eye,
  EyeOff,
  PlusCircle,
  ArrowLeft,
  Copy,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';


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
        name: "Credenciales y API",
        description: "Administra tus claves de API y secretos.",
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

type SecretCollection = {
    id: string;
    demoUser: string;
    demoPass: string;
    prodUser: string;
    prodPass: string;
    status: 'active' | 'inactive';
};

function HkaSecretsManager() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [collections, setCollections] = useState<SecretCollection[]>([
        { id: 'col-1', demoUser: 'walgofugiitj_ws_tfhka', demoPass: 'Tfhka.P4n4m4.2023', prodUser: '', prodPass: '', status: 'active' }
    ]);
    const [showDemoPass, setShowDemoPass] = useState(false);
    const [showProdPass, setShowProdPass] = useState(false);
    
    // Form state
    const [demoUser, setDemoUser] = useState('walgofugiitj_ws_tfhka');
    const [demoPass, setDemoPass] = useState('Tfhka.P4n4m4.2023');
    const [prodUser, setProdUser] = useState('');
    const [prodPass, setProdPass] = useState('');

    const handleSaveCollection = () => {
        const newCollection: SecretCollection = {
            id: `col-${collections.length + 1}`,
            demoUser,
            demoPass,
            prodUser,
            prodPass,
            status: 'inactive',
        };
        setCollections(prev => [...prev, newCollection]);
        setView('list');
    };
    
    const handleCreateNewCollection = () => {
        // Reset form fields
        setDemoUser('');
        setDemoPass('');
        setProdUser('');
        setProdPass('');
        setView('form');
    }

    if (view === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                             <KeyRound /> Bóveda de Secretos (The Factory HKA)
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Colecciones de credenciales para conectar con el PAC.
                        </p>
                    </div>
                    <Button onClick={handleCreateNewCollection}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Colección
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario Demo</TableHead>
                            <TableHead>Usuario Producción</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collections.map((col) => (
                            <TableRow key={col.id}>
                                <TableCell>{col.demoUser}</TableCell>
                                <TableCell>{col.prodUser || 'No configurado'}</TableCell>
                                <TableCell>
                                    <Badge variant={col.status === 'active' ? 'default' : 'outline'}>
                                        {col.status === 'active' ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    // Form View
     return (
        <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setView('list')} className="w-fit p-1 h-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la lista
            </Button>
            <div className="space-y-1 pt-2">
                 <h3 className="text-lg font-medium flex items-center gap-2">
                    <PlusCircle /> Nueva Colección de Secretos
                </h3>
                <p className="text-sm text-muted-foreground">
                   Añade las credenciales de API para los ambientes de Demo y Producción de HKA.
                </p>
            </div>
            <div className="space-y-6 pt-4">
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Ambiente de Demo / Pruebas</h3>
                     <div className="space-y-2">
                        <Label htmlFor="demo-user">Username</Label>
                        <Input id="demo-user" value={demoUser} onChange={e => setDemoUser(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="demo-pass">Password</Label>
                        <div className="relative">
                            <Input id="demo-pass" type={showDemoPass ? 'text' : 'password'} value={demoPass} onChange={e => setDemoPass(e.target.value)} />
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowDemoPass(!showDemoPass)}>
                                {showDemoPass ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Ambiente de Producción</h3>
                     <div className="space-y-2">
                        <Label htmlFor="prod-user">Username</Label>
                        <Input id="prod-user" placeholder="Aún no configurado" value={prodUser} onChange={e => setProdUser(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="prod-pass">Password</Label>
                         <div className="relative">
                            <Input id="prod-pass" type={showProdPass ? 'text' : 'password'} placeholder="Aún no configurado" value={prodPass} onChange={e => setProdPass(e.target.value)} />
                             <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowProdPass(!showProdPass)}>
                                {showProdPass ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                    </div>
                </div>
                <div>
                    <Button onClick={handleSaveCollection}>Guardar Colección</Button>
                </div>
            </div>
        </div>
    );
}

function CompanyApiKeys() {
    const { toast } = useToast();
    const [showKey, setShowKey] = useState(false);
    const apiKey = "fu_live_sk_ex******************XYZ"; // Example key

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        toast({
            title: "Copiado",
            description: "La clave de API ha sido copiada al portapapeles.",
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Claves de API de la Compañía</h3>
                    <p className="text-sm text-muted-foreground">
                        Usa estas claves para conectar tu ERP o sistemas a Factos UbicSys.
                    </p>
                </div>
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Generar Nueva Clave
                </Button>
            </div>
            <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="font-mono text-sm">
                        {showKey ? apiKey : `••••••••••••••••••••••••${apiKey.slice(-4)}`}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">Mostrar/Ocultar clave</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copiar clave</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}


function CredentialsSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Credenciales y API</CardTitle>
                <CardDescription>
                    Administra tus claves de API para conectar tus sistemas y las credenciales para el proveedor de facturación (PAC).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <CompanyApiKeys />
                <Separator />
                <HkaSecretsManager />
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
  
  const handleTabChange = (tabId: string) => {
      setActiveTab(tabId);
      router.push(`/dashboard/settings?tab=${tabId}`, { scroll: false });
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
                          <button
                              onClick={() => handleTabChange(item.id)}
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

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SettingsPageContent />
        </Suspense>
    );
}
