import { useCallback } from "react";
import { AppState } from "../lib/storage";
import { guides } from "../data/guides";
import { DialogueOverlayRequest } from "../sections/sectionTypes";

// ─── Level Thresholds ───────────────────────────────────────────────
// Cumulative points required to reach each level (1-indexed: index 0 = level 1)
export const LEVEL_THRESHOLDS = [3, 8, 15, 25, 40, 52, 67, 85, 105, 130];

// Per-character maximum achievable level
export const MAX_LEVELS: Record<string, number> = {
  "kagura": 10,    // Nhiên Anh — Leader, max level 10
  "an-chi": 5,     // An Chi — capped at level 5
  "imed": 5,
  "lil-wayne": 5,
  "nova": 5,
  "stone": 5,
};

// Milestone levels that trigger special rewards/achievements
export const MILESTONE_LEVELS = [5, 10];

// ─── Helper Functions ───────────────────────────────────────────────

/** Get the current affinity level from raw points (0 = no level yet) */
export const getAffinityLevel = (points: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 0;
};

/** Get the max achievable points for a character (based on their max level) */
export const getMaxPoints = (characterId: string): number => {
  const maxLevel = MAX_LEVELS[characterId] ?? 5;
  return LEVEL_THRESHOLDS[maxLevel - 1];
};

/** Get detailed level progress info for UI display */
export const getLevelProgress = (points: number, characterId: string) => {
  const level = getAffinityLevel(points);
  const maxLevel = MAX_LEVELS[characterId] ?? 5;
  const cappedLevel = Math.min(level, maxLevel);
  const currentThreshold = cappedLevel > 0 ? LEVEL_THRESHOLDS[cappedLevel - 1] : 0;
  const nextThreshold = cappedLevel < maxLevel ? LEVEL_THRESHOLDS[cappedLevel] : currentThreshold;
  const prevThreshold = cappedLevel > 1 ? LEVEL_THRESHOLDS[cappedLevel - 2] : 0;
  const isMaxed = cappedLevel >= maxLevel;

  // Progress within current level segment (0-1)
  const segmentTotal = nextThreshold - prevThreshold;
  const segmentCurrent = Math.min(points, nextThreshold) - prevThreshold;
  const progress = isMaxed ? 1 : segmentTotal > 0 ? segmentCurrent / segmentTotal : 0;

  return { level: cappedLevel, maxLevel, currentThreshold, nextThreshold, isMaxed, progress };
};

// ─── Milestone Dialogues ────────────────────────────────────────────

export const getAffinityDialogue = (characterId: string, level: number): DialogueOverlayRequest | null => {
  // ── Level 5 milestones (all characters) ──
  if (level === 5) {
    if (characterId === "an-chi") {
      return { speaker: guides.anChi, mood: "soft", lines: ["Cậu đã dành nhiều thời gian lắng nghe tớ nhỉ. Tớ rất vui."] };
    }
    if (characterId === "lil-wayne") {
      return { speaker: guides.lilWayne, mood: "funny", lines: ["Ê, chơi game nhiều phết đấy. Nhớ giữ gìn sức khoẻ nhé!"] };
    }
    if (characterId === "imed") {
      return { speaker: guides.imed, mood: "soft", lines: ["Cậu đọc hết thoại luôn hả? Siêng năng quá vậy."] };
    }
    if (characterId === "nova") {
      return { speaker: guides.nova, mood: "serious", lines: ["Tín hiệu ổn định. Có vẻ cậu không bỏ sót chi tiết nào."] };
    }
    if (characterId === "stone") {
      return { speaker: guides.stone, mood: "soft", lines: ["Cậu có thấy những chuyển động tớ tạo ra không? Nhìn cậu xem, thật kỹ tính."] };
    }
    if (characterId === "kagura") {
      return { speaker: guides.kagura, mood: "soft", lines: ["Hành trình này thật trọn vẹn khi có cậu đồng hành."] };
    }
  }

  // ── Level 10 milestone (kagura only — Nhiên Anh max) ──
  if (level === 10) {
    if (characterId === "kagura") {
      return {
        speaker: guides.kagura,
        mood: "intimate",
        lines: [
          "Cậu đã ở bên tớ từ đầu đến cuối.",
          "Không phải ai cũng làm được điều đó. Cảm ơn cậu thật nhiều.",
          "Từ giờ, cậu là người mà tớ tin tưởng nhất. 🌟",
        ],
      };
    }
  }

  return null;
};

/** Map character ID → achievement ID for level 5 milestone */
const LEVEL5_ACHIEVEMENT_MAP: Record<string, string> = {
  "kagura": "bond_5_kagura",
  "imed": "bond_5_imed",
  "an-chi": "bond_5_anchi",
  "lil-wayne": "bond_5_lilwayne",
  "nova": "bond_5_nova",
  "stone": "bond_5_stone",
};

// ─── Hook ───────────────────────────────────────────────────────────

export const useAffinity = (
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  requestDialogue?: (dialogue: DialogueOverlayRequest) => void
) => {
  const increaseAffinity = useCallback((characterId: string, amount: number = 1) => {
    setState(prev => {
      const current = prev.characterAffinity[characterId] || 0;
      const maxPoints = getMaxPoints(characterId);

      // Cap at max level
      if (current >= maxPoints) return prev;
      const next = Math.min(current + amount, maxPoints);

      const prevLevel = getAffinityLevel(current);
      const nextLevel = getAffinityLevel(next);

      // Check milestone crossings
      if (requestDialogue) {
        MILESTONE_LEVELS.forEach(milestone => {
          if (prevLevel < milestone && nextLevel >= milestone) {
            const dialogue = getAffinityDialogue(characterId, milestone);
            if (dialogue) {
              setTimeout(() => requestDialogue(dialogue), 1500);
            }
          }
        });
      }

      // Collect new achievements
      const newAchievements = [...prev.achievements];

      // Level 5 achievement
      if (prevLevel < 5 && nextLevel >= 5) {
        const achievementId = LEVEL5_ACHIEVEMENT_MAP[characterId];
        if (achievementId && !newAchievements.includes(achievementId)) {
          newAchievements.push(achievementId);
        }
      }

      // Level 10 achievement (kagura only)
      if (characterId === "kagura" && prevLevel < 10 && nextLevel >= 10) {
        if (!newAchievements.includes("bond_10_kagura")) {
          newAchievements.push("bond_10_kagura");
        }
      }

      // Check "max all" achievement — all characters at their max level
      const updatedAffinity = { ...prev.characterAffinity, [characterId]: next };
      const allMaxed = Object.keys(MAX_LEVELS).every(id => {
        const pts = updatedAffinity[id] || 0;
        return pts >= getMaxPoints(id);
      });
      if (allMaxed && !newAchievements.includes("bond_max_all")) {
        newAchievements.push("bond_max_all");
      }

      return {
        ...prev,
        characterAffinity: updatedAffinity,
        achievements: newAchievements,
      };
    });
  }, [setState, requestDialogue]);

  return { increaseAffinity };
};
