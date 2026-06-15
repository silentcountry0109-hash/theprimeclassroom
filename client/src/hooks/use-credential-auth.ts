import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

async function fetchCredentialUser(): Promise<User | null> {
  const response = await fetch("/api/credential-user", {
    credentials: "include",
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.json();
}

export function useCredentialAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isFetching } = useQuery<User | null>({
    queryKey: ["/api/credential-user"],
    queryFn: fetchCredentialUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/credential-logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/credential-user"] });
    },
  });

  return {
    user,
    isLoading,
    isFetching,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
