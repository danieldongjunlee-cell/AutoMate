import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client. All data access goes through the mock service layer
 * (src/services/mock/, added with each feature step) so the backend can be
 * wired in later without touching screens.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});
