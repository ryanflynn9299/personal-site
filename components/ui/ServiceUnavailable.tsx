import { WifiOff } from 'lucide-react';

export function ServiceUnavailable() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-12 text-center">
      <WifiOff className="h-12 w-12 text-amber-400" />
      <h3 className="mt-4 font-semibold text-slate-50">
        Content Service Unavailable
      </h3>
      <p className="mt-2 text-slate-400">
        There was a problem connecting to the content service. Please try again later.
      </p>
    </div>
  );
}