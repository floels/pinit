// React Query client provider
// Inspired by https://github.com/TkDodo/testing-react-query/blob/main/src/tests/utils.tsx
// referenced in https://tkdodo.eu/blog/testing-react-query#putting-it-all-together

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export const withQueryClient = (children: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock the IntersectionObserver, used notably in 'components/PinsBoard' tests
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: "",
    thresholds: [],
    takeRecords: () => [],
  }));
};

// A generic mock for local storage:
export class MockLocalStorage {
  store: { [key: string]: string } = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}
