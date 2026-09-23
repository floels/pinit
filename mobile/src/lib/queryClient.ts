import { QueryClient } from "@tanstack/react-query";

// Module singleton shared by QueryClientProvider and Session teardown helpers.
export const queryClient = new QueryClient();
