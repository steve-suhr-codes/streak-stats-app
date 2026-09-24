import type { CreateStreakInput, StreakDto } from '@streak-stats/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './api';

export const streakKeys = {
  all: ['streaks'] as const,
  detail: (id: string) => ['streaks', id] as const,
};

export function useStreaks() {
  return useQuery({ queryKey: streakKeys.all, queryFn: api.listStreaks });
}

export function useStreak(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: streakKeys.detail(id),
    queryFn: () => api.getStreak(id),
    // Show the card's data instantly when coming from the list.
    initialData: () =>
      queryClient.getQueryData<StreakDto[]>(streakKeys.all)?.find((s) => s.id === id),
  });
}

function useStreakMutation<TArgs>(fn: (args: TArgs) => Promise<StreakDto | void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (streak) => {
      if (streak) queryClient.setQueryData(streakKeys.detail(streak.id), streak);
      return queryClient.invalidateQueries({ queryKey: streakKeys.all });
    },
  });
}

export const useCreateStreak = () =>
  useStreakMutation((input: CreateStreakInput) => api.createStreak(input));

export const useRestartStreak = () =>
  useStreakMutation(({ id, date }: { id: string; date: string }) => api.restartStreak(id, { date }));

export const useDeleteStreak = () => useStreakMutation((id: string) => api.deleteStreak(id));
