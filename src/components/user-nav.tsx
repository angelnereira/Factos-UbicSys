
'use client';

import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { getAuth, signOut } from 'firebase/auth';

export function UserNav() {
  const router = useRouter();
  const { user } = useAuth();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
             {userAvatar?.imageUrl && (
              <AvatarImage
                src={userAvatar.imageUrl}
                alt="User avatar"
                data-ai-hint={userAvatar.imageHint}
                width={40}
                height={40}
              />
            )}
            <AvatarFallback>{user?.email?.[0].toUpperCase() || 'A'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || 'Admin'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'admin@factos-ubicsys.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>Facturación</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>Ajustes</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
