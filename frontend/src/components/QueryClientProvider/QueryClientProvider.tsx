import {
  QueryClientProvider as TanstackQueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { Response404Error } from "@/lib/customErrors";

const shouldRetry = (failureCount: number, error: unknown) => {
  if (error instanceof Response404Error) return false;
  return failureCount < 3;
};

type QueryClientProviderProps = {
  children: React.ReactNode;
};

const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: shouldRetry } },
      }),
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
};

export default QueryClientProvider;
