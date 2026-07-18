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
