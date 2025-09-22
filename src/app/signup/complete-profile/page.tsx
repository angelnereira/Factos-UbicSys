
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { addCompany } from '@/lib/firebase/firestore';
import type { Company } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';

const profileSchema = z.object({
  taxId: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();


  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const uid = searchParams.get('uid') || '';
  
  useEffect(() => {
    // If the user is already logged in and the UIDs match, they can complete the profile
    // Or if the URL contains a UID from the signup process
    if (!loading && !user && !uid) {
      toast({
        title: 'Acceso no autorizado',
        description: 'Por favor, regístrate primero.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [user, loading, router, uid, toast]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      taxId: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    
    const userUid = user?.uid || uid;

    if (!userUid) {
        toast({
            title: 'Error de Registro',
            description: 'No se encontró el ID de usuario. Por favor, intenta registrarte de nuevo.',
            variant: 'destructive',
        });
        setIsLoading(false);
        router.push('/');
        return;
    }

    const companyData: Partial<Company> = {
      name,
      email,
      authUid: userUid,
      status: 'Demo',
      onboarded: new Date(),
      integrationConfig: {
        erpType: 'custom',
        notificationSettings: {
            emailNotifications: true,
            webhookNotifications: false,
            smsNotifications: false,
        }
      },
      factoryHkaConfig: {
        demo: {
            username: "user_demo", // Placeholder
            isActive: true,
            maxDocumentsPerMonth: 1000,
            documentsUsedThisMonth: 0,
        },
        production: {
            username: "user_prod", // Placeholder
            isActive: false,
        }
      },
      ...values,
    };

    const { error } = await addCompany(companyData);
    
    if (error) {
        toast({
            title: 'Error al completar el perfil',
            description: 'No se pudo guardar la información de la compañía.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    toast({
      title: '¡Registro completado!',
      description: 'Tu perfil ha sido creado exitosamente.',
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };
  
  if (loading) {
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
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Completar Perfil</CardTitle>
          <CardDescription>
            Añade información adicional (opcional) para completar tu registro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 1234567890001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 0991234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Quito, Ecuador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                 <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                    Omitir
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Finalizar Registro'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompleteProfilePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <CompleteProfileForm />
        </Suspense>
    )
}
