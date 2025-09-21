
import Link from "next/link"
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

const settingsNav = [
    {
        name: "Cuenta",
        description: "Gestiona tu información de perfil.",
        href: "#",
        icon: User,
        current: true,
    },
    {
        name: "Apariencia",
        description: "Personaliza la apariencia de la app.",
        href: "#",
        icon: Palette,
        current: false,
    },
    {
        name: "Credenciales",
        description: "Administra tus claves de API.",
        href: "#",
        icon: ShieldCheck,
        current: false,
    },
    {
        name: "Datos",
        description: "Administra tus datos y exportaciones.",
        href: "#",
        icon: Database,
        current: false,
    },
]

export default function SettingsPage() {
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
                              className={cn(
                                  item.current
                                      ? "bg-accent text-primary"
                                      : "hover:bg-accent hover:text-primary",
                                  "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground"
                              )}
                          >
                              <item.icon
                                  className={cn(
                                      item.current ? "text-primary" : "text-muted-foreground group-hover:text-primary",
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
            <Card>
                <CardHeader>
                  <CardTitle>Cuenta</CardTitle>
                  <CardDescription>
                    Realiza cambios en tu cuenta aquí. Haz clic en guardar cuando hayas terminado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Account form fields will go here. For now, it's just a placeholder */}
                   <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-foreground">Nombre</label>
                        <div className="mt-2">
                            <input type="text" name="name" id="name" className="block w-full rounded-md border-0 bg-input py-1.5 px-2 text-foreground shadow-sm ring-1 ring-inset ring-ring focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6" defaultValue="Admin" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">Email</label>
                        <div className="mt-2">
                            <input type="email" name="email" id="email" className="block w-full rounded-md border-0 bg-input py-1.5 px-2 text-foreground shadow-sm ring-1 ring-inset ring-ring focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6" defaultValue="admin@factos-ubicsys.com" />
                        </div>
                    </div>
                </CardContent>
                 <CardContent>
                    <Button>Guardar Cambios</Button>
                </CardContent>
              </Card>
          </div>
      </main>
    </div>
  )
}
