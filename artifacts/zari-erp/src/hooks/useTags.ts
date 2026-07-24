import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export const TAGS_QK = "entity-tags";

export function useTagList(filter : {entityType: string, search: string}) {
  return useQuery({
    queryKey: [TAGS_QK, filter.entityType, filter.search],
    enabled: !!filter.entityType,
    queryFn: async () => {
      const qs = new URLSearchParams({
        entityType: filter.entityType,
        search: filter.search,
      }).toString();

      const response = await customFetch<{
        message: string;
        data: string[];
      }>(`/api/entity-tags?${qs}`);

      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}