import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from './table';

describe('Table Components', () => {
  it('renders table with all subcomponents', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Cell')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Table className="custom-class"><TableBody><TableRow><TableCell>Test</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByText('Test').closest('table')).toHaveClass('custom-class');
  });
});
