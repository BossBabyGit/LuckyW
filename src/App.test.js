import { render, screen } from '@testing-library/react';
import App from './App';

// jsdom doesn't implement canvas; mock getContext to avoid errors
HTMLCanvasElement.prototype.getContext = () => {};

test('renders LuckyW brand', () => {
  render(<App />);
  expect(screen.getAllByText(/LuckyW/i).length).toBeGreaterThan(0);
});
