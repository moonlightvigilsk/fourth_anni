import type { TarotTopic } from "../data/tarotDeck";
import { achievements } from "../data/achievements";

export type SectionId =
  | "who"
  | "vhs"
  | "constellation"
  | "moonphase"
  | "vtuberArt"
  | "scrapbook"
  | "tarot"
  | "gacha"
  | "cipher"
  | "wishes"
  | "letters"
  | "teamGallery"
  | "starlog"
  | "finale";

export type PartId =
  | "constellation"
  | "moonphase"
  | "vtuberArt"
  | "scrapbook"
  | "tarot"
  | "gacha"
  | "cipher"
  | "wishes"
  | "letters"
  | "teamGallery"
  | "finale";
export type JourneyPartStatus = "locked" | "active" | "completed";

const PART_ORDER: PartId[] = [
  "constellation",
  "moonphase",
  "vtuberArt",
  "scrapbook",
  "tarot",
  "gacha",
  "cipher",
  "wishes",
  "letters",
  "teamGallery",
  "finale",
];

const PART_ID_SET = new Set<string>(PART_ORDER);
const ACHIEVEMENT_ID_SET = new Set(achievements.map((achievement) => achievement.id));

const isPartId = (value: unknown): value is PartId =>
  typeof value === "string" && PART_ID_SET.has(value);

const normalizeAchievements = (value: unknown): string[] =>
  Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter(
            (id): id is string => typeof id === "string" && ACHIEVEMENT_ID_SET.has(id),
          ),
        ),
      )
    : [];

const getFirstIncompletePartId = (completedParts: PartId[]): PartId =>
  PART_ORDER.find((partId) => !completedParts.includes(partId)) ?? "finale";

export type ArrivalYear = "2022" | "2023" | "2024" | "2025_2026";
export type ZodiacElement = "fire" | "earth" | "air" | "water";

export type Profile = {
  arrivalYear: ArrivalYear;
  birthMonth: number;
  zodiac: string;
  element: ZodiacElement;
};

export type SavedTarotCard = {
  id: string;
  title: string;
  viName: string;
  position: "single" | "past" | "present" | "advice";
  positionLabel: string;
  orientation: "upright" | "reversed";
  orientationLabel: "Xuôi" | "Ngược";
  keywords: string[];
  meaning: string;
};

export type TarotReading = {
  cards: SavedTarotCard[];
  topic: TarotTopic;
  topicLabel: string;
  question: string;
  createdAt: string;
} | null;

export type AppState = {
  hasStarted: boolean;
  currentSection: SectionId;
  activePartId: PartId;
  completedParts: PartId[];
  profile: Profile | null;
  achievements: string[];
  unlockedStars: string[];
  constellationSpecialStars: string[];
  scrapbookChapterIndex: number;
  tarotReading: TarotReading;
  tarotHistory: NonNullable<TarotReading>[];
  pinnedCharm: SavedTarotCard | null;
  characterAffinity: Record<string, number>;
  gashaponInventory: string[];
  gashaponPulls: number;
  visitCount: number;
  directorCommentary: string[];
  readWishIds: number[];
  /**
   * Wish IDs for which the first-reaction affinity grant has already fired.
   * Used to make the grant idempotent across reloads and prevent reload farming.
   */
  wishAffinityGrantedIds: number[];
  scrapbookUnlocked: boolean;
  usedQuizIds: string[];
  quizFails: number;
  /**
   * @deprecated Tickets are no longer consumed by the gacha flow.
   * Kept only so older saved states can still be normalized safely.
   */
  gachaTickets: number;
  minigameRecords: Record<string, { plays: number; wins: number }>;
  hasSeenGuidedTour: boolean;
  // ─── Affinity System ──────────────────────────
  giftedItems: Record<string, string[]>;     // characterId → gift IDs given
  pokedCharacters: string[];                  // characterIds poked this visit
  letterReplies: string[];                    // characterIds with replied letters
  tarotInterpretedBy: string[];               // characterIds that interpreted tarot (history)
  memberQuizPassed: string[];                 // characterIds with passed member quiz
  charmBonusGranted: boolean;                 // whether charm passive was given this visit
};

export const STORAGE_KEY = "four-years-two-stars:v4";

export const createInitialState = (): AppState => ({
  hasStarted: false,
  currentSection: "vhs",
  activePartId: "constellation",
  completedParts: [],
  profile: null,
  achievements: [],
  unlockedStars: [],
  constellationSpecialStars: [],
  scrapbookChapterIndex: 0,
  tarotReading: null,
  tarotHistory: [],
  pinnedCharm: null,
  characterAffinity: {},
  gashaponInventory: [],
  gashaponPulls: 0,
  visitCount: 0,
  directorCommentary: [],
  readWishIds: [],
  wishAffinityGrantedIds: [],
  scrapbookUnlocked: false,
  usedQuizIds: [],
  quizFails: 0,
  gachaTickets: 0,
  minigameRecords: {
    signalTiming: { plays: 0, wins: 0 },
    memoryCatch: { plays: 0, wins: 0 },
    memoryFlip: { plays: 0, wins: 0 },
    signalRepairCoop: { plays: 0, wins: 0 },
    balanceCoop: { plays: 0, wins: 0 },
  },
  hasSeenGuidedTour: false,
  giftedItems: {},
  pokedCharacters: [],
  letterReplies: [],
  tarotInterpretedBy: [],
  memberQuizPassed: [],
  charmBonusGranted: false,
});

export const normalizeStoredState = (value: Partial<AppState> | null): AppState => {
  const base = createInitialState();

  if (!value || typeof value !== "object") {
    return base;
  }

  const { streamSafeMode: _streamSafeMode, ...storedValue } = value as Partial<AppState> & {
    streamSafeMode?: unknown;
  };
  let completedParts = Array.isArray(value.completedParts)
    ? value.completedParts.filter(isPartId)
    : [];
  const storedActivePartId = isPartId(value.activePartId) ? value.activePartId : null;

  if (value.hasStarted && storedActivePartId) {
    const activePartIndex = PART_ORDER.indexOf(storedActivePartId);
    const inferredCompletedParts = PART_ORDER.slice(0, activePartIndex);

    completedParts = inferredCompletedParts.reduce(
      (parts, partId) => (parts.includes(partId) ? parts : [...parts, partId]),
      completedParts,
    );
  }
  const shouldInsertMoonPhase =
    value.hasStarted &&
    value.activePartId === "scrapbook" &&
    completedParts.includes("constellation") &&
    !completedParts.includes("moonphase") &&
    !completedParts.includes("scrapbook");

  const shouldInsertVtuberArt =
    value.hasStarted &&
    completedParts.includes("moonphase") &&
    !completedParts.includes("vtuberArt") &&
    !completedParts.includes("scrapbook");
    
  const shouldInsertCipher =
    value.hasStarted &&
    completedParts.includes("gacha") &&
    !completedParts.includes("cipher");

  const shouldInsertWishes = 
    value.hasStarted && 
    completedParts.includes("cipher") && 
    !completedParts.includes("wishes");

  const shouldInsertLetters = 
    value.hasStarted && 
    completedParts.includes("wishes") && 
    !completedParts.includes("letters");

  const shouldInsertTeamGallery =
    value.hasStarted &&
    completedParts.includes("letters") &&
    !completedParts.includes("teamGallery") &&
    !completedParts.includes("finale");

  let activePartId = storedActivePartId ?? "constellation";
  let currentSection = value.currentSection ?? (value.hasStarted ? "constellation" : "vhs");

  if (shouldInsertMoonPhase) {
    activePartId = "moonphase";
    currentSection = "moonphase";
  } else if (shouldInsertVtuberArt) {
    activePartId = "vtuberArt";
    currentSection = "vtuberArt";
  } else if (shouldInsertCipher) {
    activePartId = "cipher";
    currentSection = "cipher";
  } else if (shouldInsertWishes) {
    activePartId = "wishes";
    currentSection = "wishes";
  } else if (shouldInsertLetters) {
    activePartId = "letters";
    currentSection = "letters";
  } else if (shouldInsertTeamGallery) {
    activePartId = "teamGallery";
    currentSection = "teamGallery";
  }

  if (value.hasStarted && completedParts.includes(activePartId)) {
    activePartId = getFirstIncompletePartId(completedParts);
    currentSection = activePartId;
  }

  const wishAffinityGrantedIds = Array.isArray(value.wishAffinityGrantedIds)
    ? Array.from(new Set(value.wishAffinityGrantedIds.filter((id): id is number => typeof id === "number")))
    : [];
  const storedGashaponPulls = value.gashaponPulls as unknown;

  return {
    ...base,
    ...storedValue,
    currentSection,
    activePartId,
    completedParts,
    achievements: normalizeAchievements(value.achievements),
    unlockedStars: Array.isArray(value.unlockedStars) ? value.unlockedStars : [],
    constellationSpecialStars: Array.isArray(value.constellationSpecialStars)
      ? value.constellationSpecialStars
      : [],
    scrapbookChapterIndex:
      typeof value.scrapbookChapterIndex === "number" ? value.scrapbookChapterIndex : 0,
    tarotHistory: Array.isArray(value.tarotHistory) ? value.tarotHistory : [],
    pinnedCharm: typeof value.pinnedCharm === "object" ? value.pinnedCharm : null,
    characterAffinity: typeof value.characterAffinity === "object" && value.characterAffinity !== null 
      ? (value.characterAffinity as Record<string, number>) 
      : {},
    gashaponInventory: Array.isArray(value.gashaponInventory) ? value.gashaponInventory : [],
    gashaponPulls: typeof storedGashaponPulls === "number" && Number.isFinite(storedGashaponPulls) && storedGashaponPulls >= 0
      ? Math.floor(storedGashaponPulls)
      : 0,
    directorCommentary: Array.isArray(value.directorCommentary) ? value.directorCommentary : [],
    readWishIds: Array.isArray(value.readWishIds) ? value.readWishIds : [],
    wishAffinityGrantedIds,
    scrapbookUnlocked: typeof value.scrapbookUnlocked === "boolean" ? value.scrapbookUnlocked : false,
    usedQuizIds: Array.isArray(value.usedQuizIds) ? value.usedQuizIds : [],
    quizFails: typeof value.quizFails === "number" ? value.quizFails : 0,
    gachaTickets: typeof value.gachaTickets === "number" ? value.gachaTickets : 0,
    minigameRecords: typeof value.minigameRecords === "object" && value.minigameRecords !== null
      ? (value.minigameRecords as Record<string, { plays: number; wins: number }>)
      : base.minigameRecords,
    hasSeenGuidedTour: typeof value.hasSeenGuidedTour === "boolean" ? value.hasSeenGuidedTour : false,
    // ─── Affinity System (migration-safe defaults) ──────────────────────────
    giftedItems: typeof value.giftedItems === "object" && value.giftedItems !== null
      ? (value.giftedItems as Record<string, string[]>)
      : {},
    pokedCharacters: Array.isArray(value.pokedCharacters) ? value.pokedCharacters : [],
    letterReplies: Array.isArray(value.letterReplies) ? value.letterReplies : [],
    tarotInterpretedBy: Array.isArray(value.tarotInterpretedBy) ? value.tarotInterpretedBy : [],
    memberQuizPassed: Array.isArray(value.memberQuizPassed) ? value.memberQuizPassed : [],
    charmBonusGranted: typeof value.charmBonusGranted === "boolean" ? value.charmBonusGranted : false,
  };
};
