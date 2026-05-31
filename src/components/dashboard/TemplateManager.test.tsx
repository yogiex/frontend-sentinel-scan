// src/components/TemplateManager.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateManager } from './TemplateManager';
import { apiClient } from '../../api/client';

vi.mock('../api/client');

describe('TemplateManager', () => {
  it('renders templates', async () => {
    const mockTemplates = [
      { id: 1, name: 'Test Template', severity: 'high', tags: ['web'], content: '', version: '1.0', createdAt: '' },
    ];
    vi.mocked(apiClient.getTemplates).mockResolvedValueOnce(mockTemplates);

    render(<TemplateManager />);
    expect(await screen.findByText('Test Template')).toBeInTheDocument();
  });
});
