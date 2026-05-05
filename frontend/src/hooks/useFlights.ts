import { useQuery } from "@tanstack/react-query";
import { getFlights, getStats } from "../api/flights";
import type { Flight, Stats } from "../api/flights";

export function useFlights() {
  return useQuery<Flight[]>({
    queryKey: ["flights"],
    queryFn: getFlights,
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 60000,
  });
}