import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LuckyW branding', () => {
  render(<App />);
  expect(screen.getAllByText(/LuckyW/i).length).toBeGreaterThan(0);
});
