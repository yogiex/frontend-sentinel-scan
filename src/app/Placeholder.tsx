import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatePanel } from '@/shared/ui/StatePanel';

export function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--paper)] p-6">
      <div className="w-full max-w-md">
        <StatePanel variant="empty" title={title} description={description} />
        <div className="mt-3 text-center">
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
