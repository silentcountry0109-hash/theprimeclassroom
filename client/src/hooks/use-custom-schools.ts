import { useQuery } from "@tanstack/react-query";
import type { CustomSchool } from "@shared/schema";

export function useCustomSchools() {
  const { data = [] } = useQuery<CustomSchool[]>({
    queryKey: ["/api/custom-schools"],
  });
  return data;
}
