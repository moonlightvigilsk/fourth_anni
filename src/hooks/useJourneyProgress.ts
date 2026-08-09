import { Dispatch, SetStateAction, useCallback } from "react";
import { getNextPartId, journeyParts, partAchievementMap } from "../data/journey";
import { AppState, JourneyPartStatus, PartId } from "../lib/storage";
import type { CompletePartOptions } from "../sections/sectionTypes";

export const useJourneyProgress = (
  state: AppState,
  setState: Dispatch<SetStateAction<AppState>>,
  unlock: (id: string) => void,
) => {
  const effectiveActivePartId = state.completedParts.includes(state.activePartId)
    ? journeyParts.find((part) => !state.completedParts.includes(part.id))?.id ?? state.activePartId
    : state.activePartId;

  const getPartStatus = useCallback(
    (partId: PartId): JourneyPartStatus => {
      if (state.completedParts.includes(partId)) {
        return "completed";
      }

      if (state.hasStarted && effectiveActivePartId === partId) {
        return "active";
      }

      return "locked";
    },
    [effectiveActivePartId, state.completedParts, state.hasStarted],
  );

  const isPartLocked = useCallback(
    (partId: PartId) => getPartStatus(partId) === "locked",
    [getPartStatus],
  );

  const completePart = useCallback(
    (partId: PartId, options?: CompletePartOptions) => {
      if (options?.awardAchievement !== false) {
        unlock(partAchievementMap[partId]);
      }

      setState((previous) => {
        const completedParts = previous.completedParts.includes(partId)
          ? previous.completedParts
          : [...previous.completedParts, partId];
        const nextPart = getNextPartId(partId);

        return {
          ...previous,
          completedParts,
          activePartId: nextPart ?? partId,
          currentSection: nextPart ?? partId,
        };
      });
    },
    [setState, unlock],
  );

  return {
    activePartId: effectiveActivePartId,
    completedParts: state.completedParts,
    completePart,
    getPartStatus,
    isPartLocked,
  };
};
