import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { getAchievement } from "../lib/achievements";
import { audioManager } from "../lib/audioManager";
import { AppState } from "../lib/storage";

type ToastState = {
  id: string;
  title: string;
} | null;

export const useAchievement = (
  state: AppState,
  setState: Dispatch<SetStateAction<AppState>>,
) => {
  const [toast, setToast] = useState<ToastState>(null);
  const unlockedRef = useRef(new Set(state.achievements));
  unlockedRef.current = new Set(state.achievements);

  const unlock = useCallback(
    (id: string) => {
      const achievement = getAchievement(id);
      if (!achievement || unlockedRef.current.has(id)) {
        return;
      }
      unlockedRef.current.add(id);

      setState((previous) => {
        if (previous.achievements.includes(id)) {
          return previous;
        }

        return {
          ...previous,
          achievements: [...previous.achievements, id],
        };
      });

      setToast({ id, title: achievement.title });
      void audioManager.start().then(() => audioManager.playAchievementCue(achievement.tier));
    },
    [setState],
  );

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return { unlock, toast };
};
