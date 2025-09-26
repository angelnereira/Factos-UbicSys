
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { signUpWithEmailAndPassword, loginWithEmailAndPassword, signInWithGoogle } from '@/lib/firebase/auth';
import { getCompanyByAuthUid } from '@/lib/firebase/firestore';
import type { AuthError } from 'firebase/auth';
import { GoogleIcon } from '@/components/google-icon';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const signUpSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, auth, db } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This state will be true if Firebase config is missing in the environment.
  const isAuthServiceUnavailable = !auth && !authLoading;

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);


  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    if (!auth) return;
    setIsSubmitting(true);
    const { email, password } = values;
    const { error } = await loginWithEmailAndPassword(auth, email, password);

    if (error) {
       toast({
        title: 'Inicio de sesión fallido',
        description: 'El correo electrónico o la contraseña son incorrectos.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    } else {
      toast({
        title: '¡Inicio de sesión exitoso!',
        description: 'Serás redirigido al panel de control.',
      });
       setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  };

  const onSignUpSubmit = async (values: SignUpFormValues) => {
    if (!auth) return;
    setIsSubmitting(true);
    const { email, password, name } = values;
    
    const { user: newUser, error } = await signUpWithEmailAndPassword(auth, email, password);

    if (error) {
      const authError = error as AuthError;
      let friendlyMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      if (authError.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Este correo electrónico ya está registrado. Por favor, inicia sesión.';
      } else if (authError.code === 'auth/weak-password') {
        friendlyMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      }
      toast({
        title: 'Registro fallido',
        description: friendlyMessage,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    } else if (newUser) {
      toast({
        title: '¡Cuenta creada!',
        description: 'Ahora completa tu perfil.',
      });
      router.push(`/signup/complete-profile?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&uid=${newUser.uid}`);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setIsSubmitting(true);
    const { result, error } = await signInWithGoogle(auth);

    if (error) {
      setIsSubmitting(false);
      if (error.code !== 'auth/popup-closed-by-user') {
          toast({
            title: 'Error de inicio de sesión con Google',
            description: 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.',
            variant: 'destructive'
          });
      }
      return;
    }

    if (result) {
        const user = result.user;
        const companyProfile = await getCompanyByAuthUid(db, user.uid);
        
        if (companyProfile) {
             toast({
                title: '¡Inicio de sesión exitoso!',
                description: 'Bienvenido de nuevo.'
            });
            router.push('/dashboard');
        } else {
             toast({
                title: '¡Cuenta creada con Google!',
                description: 'Por favor, completa tu perfil de compañía.'
            });
            const { displayName, email, uid } = user;
            router.push(`/signup/complete-profile?name=${encodeURIComponent(displayName || '')}&email=${encodeURIComponent(email || '')}&uid=${uid}`);
        }
    } else {
      setIsSubmitting(false);
    }
  }
  
  if (authLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="absolute top-8 left-8">
            <Logo />
        </div>
        <div className="absolute top-8 right-8">
            <ThemeToggle />
        </div>
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="signup">Registrarse</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthServiceUnavailable ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error de Configuración</AlertTitle>
                    <AlertDescription>
                      El servicio de autenticación no está disponible. Asegúrate de haber configurado las variables de entorno de Firebase en tu plataforma de hosting.
                    </AlertDescription>
                  </Alert>
              ) : (
                <div className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting || !auth}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2" /> Continuar con Google</>}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        O continuar con
                      </span>
                    </div>
                  </div>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input placeholder="usuario@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isSubmitting || !auth}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Iniciar Sesión'}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Registrarse</CardTitle>
              <CardDescription>
                Crea una cuenta para comenzar.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {isAuthServiceUnavailable ? (
                    <Alert variant="destructive">
                      <AlertTitle>Error de Configuración</AlertTitle>
                      <AlertDescription>
                        El servicio de autenticación no está disponible. Asegúrate de haber configurado las variables de entorno de Firebase en tu plataforma de hosting.
                      </AlertDescription>
                    </Alert>
                ) : (
                  <div className="space-y-4">
                      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting || !auth}>
                          {isSubmitting ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2" /> Continuar con Google</>}
                      </Button>
                      <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">
                                  O registrarse con email
                              </span>
                          </div>
                      </div>
                      <Form {...signUpForm}>
                          <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                          <FormField
                              control={signUpForm.control}
                              name="name"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nombre de la Compañía</FormLabel>
                                  <FormControl>
                                  <Input placeholder="Tu Compañía S.A." {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={signUpForm.control}
                              name="email"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Correo Electrónico de Contacto</FormLabel>
                                  <FormControl>
                                  <Input placeholder="contacto@tucompania.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={signUpForm.control}
                              name="password"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Contraseña</FormLabel>
                                  <FormControl>
                                  <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <Button type="submit" className="w-full" disabled={isSubmitting || !auth}>
                              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Siguiente'}
                          </Button>
                          </form>
                      </Form>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
