import { useQuery } from "@tanstack/react-query";
import { getSessionsByCountry } from "@/api/apis";
import { ISO_NORMALIZE } from "@/app/(admin)/dashboard/analytics/components/isoNormalize";

export const useSessionsByCountry = ({ range, metric, topN = 250 }) => {
  return useQuery({
    queryKey: ["sessions-by-country", range, metric, topN],
    queryFn: async () => {
      const res = await getSessionsByCountry(range, topN, metric);
      const rows = res?.data?.rows || [];

      return rows
        .map((r) => {
          let iso = r.iso?.toUpperCase();

          // ✅ Normalize ISO codes
          if (ISO_NORMALIZE[iso]) {
            iso = ISO_NORMALIZE[iso];
          }

          return {
            country: r.country,
            iso,
            value: Number(r.value || 0),
          };
        })
        // ❗ DO NOT remove zero-value countries
        .filter((r) => r.iso)
        .sort((a, b) => b.value - a.value);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
