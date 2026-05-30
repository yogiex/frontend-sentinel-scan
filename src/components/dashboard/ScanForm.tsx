import { useState } from 'react';
import { CreateScanRequest } from '../../types';

interface ScanFormProps {
  onSubmit: (request: CreateScanRequest) => void;
  loading: boolean;
}

export function ScanForm({ onSubmit, loading }: ScanFormProps) {
  const [targets, setTargets] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetList = targets.split('\n').map(t => t.trim()).filter(t => t);
    if (targetList.length === 0) {
      setError('Please enter at least one target');
      return;
    }

    onSubmit({ targets: targetList });
  };

   return (
     <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-md shadow" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
       <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>New Scan</h2>
       
       <div>
         <label htmlFor="targets" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Targets (one per line)</label>
         <textarea
           id="targets"
           value={targets}
           onChange={(e) => setTargets(e.target.value)}
           className="w-full p-2 border rounded-md h-32"
           style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
           placeholder="http://example.com&#10;https://test.com"
         />
       </div>

       {error && <div className="text-sm" style={{ color: 'var(--danger)' }}>{error}</div>}

       <button
         type="submit"
         disabled={loading}
         className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
         style={{ backgroundColor: 'var(--primary)', color: 'white' }}
         onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.9)' }}
         onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)' }}
       >
         {loading ? 'Starting Scan...' : 'Start Scan'}
       </button>
     </form>
   );
}