import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/services/user";

export const userQueryKeys = {
  all: ["user"] as const,
  current: () => [...userQueryKeys.all, "current"] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.current(),
    queryFn: getCurrentUser,
    staleTime: 60_000,
  });
}
