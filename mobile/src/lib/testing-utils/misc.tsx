import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, fireEvent } from "@testing-library/react-native";

// React Query client provider
// Inspired by https://github.com/TkDodo/testing-react-query/blob/main/src/tests/utils.tsx
// referenced in https://tkdodo.eu/blog/testing-react-query#putting-it-all-together
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Collect a query as soon as its last observer goes away. The default is
        // five minutes, and nothing clears this client, so every test that
        // rendered a query left a five-minute timer alive in its Jest worker.
        // The worker then could not exit, and Jest reported "A worker process
        // has failed to exit gracefully" after an otherwise green run.
        gcTime: 0,
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

export const pressButton = ({ testID }: { testID: string }) => {
  const button = screen.getByTestId(testID);

  fireEvent.press(button);
};

export class MockFormData {
  entries: { [key: string]: any };

  constructor() {
    this.entries = {};
  }
  append(key: string, value: any) {
    this.entries[key] = value;
  }
}
