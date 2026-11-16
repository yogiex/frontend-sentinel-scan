import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Card, CardContent, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('renders header, title, and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Scanner status</CardTitle>
        </CardHeader>
        <CardContent>Online</CardContent>
      </Card>,
    );
    expect(screen.getByText('Scanner status')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('uses a hairline border instead of a shadow', () => {
    const { container } = render(<Card>content</Card>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('border-[var(--rule)]');
    expect(el.className).not.toContain('shadow');
  });
});
