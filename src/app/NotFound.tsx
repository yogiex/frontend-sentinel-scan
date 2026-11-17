import { Button } from '@/components/ui/button';
import { StatePanel } from '@/shared/ui/StatePanel';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--paper)] p-6">
      <div className="w-full max-w-md">
        <StatePanel
          variant="empty"
          title="Page not found"
          description="The page you are looking for does not exist or has moved."
          action={{ label: 'Go to dashboard', onClick: () => navigate('/dashboard') }}
          secondaryAction={{ label: 'Back', onClick: () => navigate(-1) }}
        />
        <p className="mt-3 text-center text-xs text-[var(--steel)]">
          If you followed a link inside the app, report it so we can fix the route.
        </p>
      </div>
    </div>
  );
}

export function Forbidden() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md">
        <StatePanel variant="no-permission" />
        <div className="mt-3 text-center">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            Go to overview
          </Button>
        </div>
      </div>
    </div>
  );
}
