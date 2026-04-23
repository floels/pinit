import {
  QueryClientProvider as TanstackQueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { Response404Error } from "@/lib/customErrors";

const isNot404 = (error: unknown) => !(error instanceof Response404Error);

type QueryClientProviderProps = {
  children: React.ReactNode;
};

const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: isNot404 } },
      }),
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
};

export default QueryClientProvider;
