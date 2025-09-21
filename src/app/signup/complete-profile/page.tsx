
'use client';

import { Suspense } from 'react';
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

const profileSchema = z.object({
  ruc: z.string().optional(),
  contactNumber: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ruc: '',
      contactNumber: '',
      location: '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);

    const clientData = {
      name,
      email,
      ...values,
      clientId: `CLI${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'Demo',
      onboarded: new Date().toISOString().split('T')[0],
    };

    console.log('Final Client Data:', clientData);

    // Here you would typically save the data to your database (e.g., Firestore)
    // For now, we'll just simulate a successful registration.

    toast({
      title: '¡Registro completado!',
      description: 'Tu perfil ha sido creado exitosamente.',
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

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
                name="ruc"
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
                name="contactNumber"
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
                name="location"
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
        <Suspense fallback={<div>Cargando...</div>}>
            <CompleteProfileForm />
        </Suspense>
    )
}
