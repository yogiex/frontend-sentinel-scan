import { render } from '@testing-library/react';
import { CategoryIcon } from './CategoryIcon';
import type { AuditCategory } from '@/lib/logger';

describe('CategoryIcon', () => {
  const categories: AuditCategory[] = ['auth', 'scan', 'export', 'user_management', 'settings', 'navigation', 'system', 'security', 'performance'];

  categories.forEach((category) => {
    it(`renders ${category} icon correctly`, () => {
      render(<CategoryIcon category={category} />);
      // Just check it renders without crashing
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('applies custom size', () => {
    render(<CategoryIcon category="auth" size={20} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
  });
});
