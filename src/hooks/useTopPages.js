import { useQuery } from "@tanstack/react-query";
import { getTopPages } from "@/api/apis";

export const useTopPages = ({ days = 28, limit = 10 }) => {
  return useQuery({
    queryKey: ["top-pages", days, limit],
    queryFn: () => getTopPages({ days, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
