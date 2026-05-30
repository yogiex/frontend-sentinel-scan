// src/components/TemplateManager.tsx
import { useState, useEffect } from 'react';
import { Template } from '../../types';
import { apiClient } from '../../api/client';

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getTemplates()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="p-4 bg-white rounded-md shadow">
      <h2 className="text-xl font-bold mb-4">Template Library</h2>
      <div className="space-y-2">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="p-3 border rounded-lg">
            <div className="font-medium">{tmpl.name}</div>
            <div className="text-sm text-gray-600">Severity: {tmpl.severity}</div>
            <div className="text-sm text-gray-600">Tags: {tmpl.tags.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
