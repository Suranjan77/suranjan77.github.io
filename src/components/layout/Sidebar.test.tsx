import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/algorithms/calculus',
}));

describe('Sidebar', () => {
  it('shows the current module and its schema-backed learning track', () => {
    render(<Sidebar />);

    expect(screen.getByRole('complementary', { name: 'Study navigator' })).toBeInTheDocument();
    expect(screen.getByText('Current module')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Calculus & Optimisation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mathematical Foundations' })).toHaveAttribute(
      'href',
      '/#track-foundations',
    );
    expect(screen.getByText('40 modules · 1 interactive lab')).toBeInTheDocument();
  });

});
