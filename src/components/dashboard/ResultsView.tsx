import { ScanResult } from '../../types';

interface ResultsViewProps {
  results: ScanResult[];
  loading: boolean;
}

export function ResultsView({ results, loading }: ResultsViewProps) {
  if (loading) return <div>Loading results...</div>;
  if (results.length === 0) return <div>No results found</div>;

  return (
    <div className="p-4 bg-white rounded-md shadow">
      <h2 className="text-xl font-bold mb-4">Scan Results</h2>
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.id} className="p-3 border rounded-lg">
            <div className="font-medium">{result.templateId}</div>
            <div className="text-sm text-gray-600">{result.target}</div>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded-md">
              {JSON.stringify(result.finding, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
