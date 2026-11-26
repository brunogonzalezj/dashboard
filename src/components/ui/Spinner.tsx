import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden="true" className={cn('h-4 w-4 animate-spin', className)} />;
}

export function PageLoader({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className="flex h-screen w-full items-center justify-center" role="status" aria-label={label}>
      <Spinner className="h-7 w-7 text-secondary-500" />
    </div>
  );
}
