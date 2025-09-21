import { CircleDollarSign } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Factos UbicSys Home">
      <div className="bg-primary rounded-lg p-2">
        <CircleDollarSign className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="font-headline text-lg font-semibold">Factos UbicSys</span>
    </div>
  );
}
