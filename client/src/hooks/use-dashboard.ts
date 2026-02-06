import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardStats(days = 30) {
  return useQuery({
    queryKey: [api.dashboard.stats.path, days],
    queryFn: async () => {
      const url = `${api.dashboard.stats.path}?days=${days}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
  });
}
