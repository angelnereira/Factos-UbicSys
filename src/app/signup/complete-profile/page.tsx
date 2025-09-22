
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
import type { Company } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { addCompany } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';


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
  const { user, loading, db } = useAuth();


  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const uid = searchParams.get('uid') || '';
  
  useEffect(() => {
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
    if (!db) {
        toast({
            title: 'Error de base de datos',
            description: 'No se pudo conectar a la base de datos.',
            variant: 'destructive'
        });
        return;
    }
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

    // Creates the company profile in Firestore.
    // This connects the authenticated user (authUid) to their company data.
    const companyData: Omit<Company, 'id'> = {
      name,
      email,
      authUid: userUid,
      status: 'Demo',
      onboarded: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
      taxId: values.taxId,
      phone: values.phone,
      address: values.address,
    };

    try {
        await addCompany(db, companyData);
        toast({
          title: '¡Registro completado!',
          description: 'Tu perfil ha sido creado exitosamente. Serás redirigido al dashboard.',
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
    } catch (error) {
        console.error("Error adding company: ", error);
        toast({
            title: 'Error al completar el perfil',
            description: 'No se pudo guardar la información de la compañía.',
            variant: 'destructive',
        });
        setIsLoading(false);
    }
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
          <CardTitle>Completar Perfil de la Compañía</CardTitle>
          <CardDescription>
            Añade información adicional (opcional) para tu compañía.
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
                    <FormLabel>RUC (Registro Único de Contribuyente)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 123456-7-890123 DV 45" {...field} />
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
                      <Input placeholder="Ej: +507 123-4567" {...field} />
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
                    <FormLabel>Dirección Física</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ciudad de Panamá, Panamá" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                 <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                    Omitir por ahora
                </Button>
                <Button type="submit" disabled={isLoading || !db}>
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
