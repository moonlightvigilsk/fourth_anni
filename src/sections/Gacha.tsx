import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  gifts,
  Gift,
  GiftRarity,
  GIFT_AFFINITY_GAIN,
  LEGENDARY_GUARANTEE_INTERVAL,
  LEGENDARY_GUARANTEE_LIMIT,
  legendaryGifts,
} from "../data/gacha";
import { guides } from "../data/guides";
import { audioManager } from "../lib/audioManager";
import { pickRandom, weightedPick } from "../lib/random";
import { constellationStars } from "../data/constellation";
import { MINIGAME_REWARD_BY_TYPE, MINIGAME_TYPES } from "../minigames/MinigamesHub";
import { DialogueOverlayRequest, SectionProps } from "./sectionTypes";
import styles from "./Gacha.module.css";

type DrawingPhase = "idle" | "turning" | "dropping" | "opening" | "revealed";

type Particle = {
  id: number;
  x: number;
  y: number;
};

type RollOption = {
  id: "single" | "ten";
  label: string;
  cost: number;
  rewardCount: number;
  note: string;
};

type DrawnGift = {
  gift: Gift;
  isFree: boolean;
};

const HIDDEN_STAR_TICKETS = 5;

const RARITY_RANK: Record<GiftRarity, number> = {
  common: 0,
  rare: 1,
  legendary: 2,
};

const ROLL_OPTIONS: RollOption[] = [
  {
    id: "single",
    label: "Quay 1",
    cost: 1,
    rewardCount: 1,
    note: "1 lượt · 1 quà",
  },
  {
    id: "ten",
    label: "Quay 10 + 1",
    cost: 10,
    rewardCount: 11,
    note: "10 lượt · tặng 1 quà",
  },
];

const rarityLabel: Record<GiftRarity, string> = {
  common: "common",
  rare: "rare",
  legendary: "legendary",
};

const getReceivedLegendaryIds = (
  inventory: string[],
  giftedItems: Record<string, string[]>,
) => {
  const giftedIds = new Set(Object.values(giftedItems).flat());

  return new Set(
    legendaryGifts
      .filter((gift) => inventory.includes(gift.title) || giftedIds.has(gift.id))
      .map((gift) => gift.id),
  );
};

const pickPaidGift = (
  nextPull: number,
  inventory: string[],
  giftedItems: Record<string, string[]>,
) => {
  const receivedLegendaryIds = getReceivedLegendaryIds(inventory, giftedItems);
  const missingLegendary = legendaryGifts.filter((gift) => !receivedLegendaryIds.has(gift.id));
  const shouldGuaranteeLegendary =
    missingLegendary.length > 0 &&
    (nextPull > LEGENDARY_GUARANTEE_LIMIT ||
      (nextPull <= LEGENDARY_GUARANTEE_LIMIT && nextPull % LEGENDARY_GUARANTEE_INTERVAL === 0));

  if (shouldGuaranteeLegendary) {
    return pickRandom(missingLegendary);
  }

  return weightedPick(gifts);
};

const getHighestRarity = (drawnGifts: DrawnGift[]) =>
  drawnGifts.reduce<GiftRarity>(
    (highest, item) => (RARITY_RANK[item.gift.rarity] > RARITY_RANK[highest] ? item.gift.rarity : highest),
    "common",
  );

const sortForReveal = (drawnGifts: DrawnGift[]) =>
  [...drawnGifts].sort((a, b) => RARITY_RANK[b.gift.rarity] - RARITY_RANK[a.gift.rarity]);

export const Gacha = ({
  state,
  setState,
  completePart,
  requestDialogue,
  markDialogueSeen,
  hasSeenDialogue,
  isActive,
  isCompleted,
}: SectionProps) => {
  const [drawnGifts, setDrawnGifts] = useState<DrawnGift[]>([]);
  const [activeRarity, setActiveRarity] = useState<GiftRarity>("common");
  const [drawingPhase, setDrawingPhase] = useState<DrawingPhase>("idle");
  const [selectedRollMode, setSelectedRollMode] = useState<RollOption["id"]>("single");
  const [particles, setParticles] = useState<Particle[]>([]);
  const hasQueuedIntroRef = useRef(false);
  const particleTimeoutRef = useRef<number | null>(null);

  const keyStarIds = constellationStars.filter((star) => star.kind === "key").map((star) => star.id);
  const foundHiddenStars = keyStarIds.filter((id) => state.unlockedStars.includes(id)).length;
  const minigameTickets = Object.entries(state.minigameRecords || {}).reduce((total, [gameId, record]) => {
    const type = MINIGAME_TYPES[gameId] ?? "solo";
    return total + record.wins * MINIGAME_REWARD_BY_TYPE[type];
  }, 0);

  const totalTicketsEarned = foundHiddenStars * HIDDEN_STAR_TICKETS + minigameTickets;
  const ticketsSpent = state.gashaponPulls;
  const ticketsLeft = Math.max(0, totalTicketsEarned - ticketsSpent);
  const isBusy = drawingPhase !== "idle" && drawingPhase !== "revealed";
  const revealGifts = useMemo(() => sortForReveal(drawnGifts), [drawnGifts]);
  const selectedRoll =
    ROLL_OPTIONS.find((option) => option.id === selectedRollMode) ?? ROLL_OPTIONS[0];

  useEffect(() => {
    return () => {
      if (particleTimeoutRef.current !== null) {
        window.clearTimeout(particleTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const dialogueId = "dialogue:gacha:intro";
    if (!isActive || hasSeenDialogue(dialogueId) || hasQueuedIntroRef.current) {
      return;
    }

    hasQueuedIntroRef.current = true;
    markDialogueSeen(dialogueId);
    const dialogues: DialogueOverlayRequest[] = [
      {
        speaker: guides.lilWayne,
        lines: ["Máy gacha đã mở. Có lượt thì quay, hết lượt thì quay lại kiếm thêm."],
        mood: "funny",
      },
      {
        speaker: guides.imed,
        lines: ["Sao ẩn cho 5 lượt. Minigame solo cho 2 lượt, co-op cho 4 lượt."],
        mood: "serious",
      },
      {
        speaker: guides.kagura,
        lines: [
          "Chọn quay 1 hoặc quay 10 + 1. Chế độ 10 + 1 chỉ tốn 10 lượt nhưng nhận 11 món quà.",
          "Trong 30 lượt trả phí đầu, máy bảo đảm đủ 6 món legendary của đội.",
        ],
        mood: "soft",
      },
    ];

    dialogues.forEach(requestDialogue);
  }, [hasSeenDialogue, isActive, markDialogueSeen, requestDialogue]);

  const buildBatch = (option: RollOption) => {
    const batch: DrawnGift[] = [];
    const virtualInventory = [...state.gashaponInventory];

    for (let index = 0; index < option.cost; index += 1) {
      const nextPull = state.gashaponPulls + index + 1;
      const gift = pickPaidGift(nextPull, virtualInventory, state.giftedItems);
      batch.push({ gift, isFree: false });
      virtualInventory.push(gift.title);
    }

    const freeCount = option.rewardCount - option.cost;
    for (let index = 0; index < freeCount; index += 1) {
      const gift = weightedPick(gifts);
      batch.push({ gift, isFree: true });
      virtualInventory.push(gift.title);
    }

    return batch;
  };

  const drawBatch = (option: RollOption) => {
    if (isBusy || drawingPhase === "revealed") return;

    if (ticketsLeft < option.cost) {
      requestDialogue({
        speaker: guides.lilWayne,
        lines: [
          `Cần ${option.cost} lượt để ${option.label.toLowerCase()}, hiện còn ${ticketsLeft}.`,
          "Tìm thêm sao ẩn hoặc thắng vài minigame rồi quay lại nhé.",
        ],
        mood: "funny",
      });
      return;
    }

    const batch = buildBatch(option);
    const highestRarity = getHighestRarity(batch);

    setState((previous) => ({
      ...previous,
      gashaponPulls: previous.gashaponPulls + option.cost,
    }));

    audioManager.setMood("gacha");
    setDrawnGifts(batch);
    setActiveRarity(highestRarity);

    setDrawingPhase("turning");
    audioManager.playUiSound("insert");

    setTimeout(() => {
      setDrawingPhase("dropping");
      audioManager.playUiSound("unlock");
    }, highestRarity === "legendary" ? 900 : 820);

    setTimeout(() => {
      setDrawingPhase("opening");
      audioManager.playUiSound("draw");
    }, highestRarity === "legendary" ? 1900 : highestRarity === "rare" ? 1800 : 1700);

    setTimeout(() => {
      setDrawingPhase("revealed");
      setState((previous) => ({
        ...previous,
        gashaponInventory: [...previous.gashaponInventory, ...batch.map((item) => item.gift.title)],
      }));
    }, highestRarity === "legendary" ? 3060 : highestRarity === "rare" ? 2860 : 2680);
  };

  const closeResult = () => {
    setDrawingPhase("idle");
    setDrawnGifts([]);
    setActiveRarity("common");
  };

  const triggerParticles = () => {
    if (particleTimeoutRef.current !== null) {
      window.clearTimeout(particleTimeoutRef.current);
    }

    setParticles(
      Array.from({ length: 30 }, (_, index) => ({
        id: Date.now() + index,
        x: Math.random() * 100,
        y: Math.random() * 100,
      })),
    );

    particleTimeoutRef.current = window.setTimeout(() => {
      setParticles([]);
      particleTimeoutRef.current = null;
    }, 1600);
  };

  const bgCapsules = [
    { id: 1, top: "40%", left: "20%", bg: "#eab308" },
    { id: 2, top: "60%", left: "30%", bg: "#ef4444" },
    { id: 3, top: "50%", left: "60%", bg: "#3b82f6" },
    { id: 4, top: "75%", left: "45%", bg: "#22c55e" },
    { id: 5, top: "65%", left: "70%", bg: "#a855f7" },
    { id: 6, top: "80%", left: "25%", bg: "#f97316" },
  ];

  const rarityClass = styles[`${activeRarity}Capsule`];
  const resultRarityClass = styles[`result${activeRarity}`];
  const rollSummary = drawnGifts.length === 1 ? "1 món quà" : `${drawnGifts.length} món quà`;

  return (
    <div className={styles.arcadeStage} id="gacha">
      <div className={styles.arcadeFrame}>
        <div className={styles.verticalSignLeft} aria-hidden="true">
          <span>ガ</span>
          <span>チ</span>
          <span>ャ</span>
          <span>ポ</span>
          <span>ン</span>
        </div>

        <div className={styles.verticalSignRight} aria-hidden="true">
          <span>L</span>
          <span>U</span>
          <span>C</span>
          <span>K</span>
          <span>Y</span>
        </div>

        <div className={styles.neonStrip1} />
        <div className={styles.neonStrip2} />
        <div className={styles.neonStrip3} />
        <div className={styles.particleLayer} aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className={styles.particle}
              style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            />
          ))}
        </div>

        <div className={styles.sloganBanner}>
          <span className={styles.sloganText}>GIFT CAPSULE</span>
        </div>

        <div className={styles.gashaponContainer}>
          <h1 className={styles.gachaSign}>GACHA</h1>
          <div className={styles.machineWrapper}>
            <div className={`${styles.globe} ${isBusy ? styles.globeMixing : ""}`}>
              {bgCapsules.map((cap, index) => (
                <div
                  key={cap.id}
                  className={styles.bgCapsule}
                  style={{
                    top: cap.top,
                    left: cap.left,
                    background: cap.bg,
                    animationDelay: `${index * -0.43}s`,
                  }}
                />
              ))}
            </div>

            <div className={styles.base}>
              <div className={styles.ticketDisplay}>Lượt gacha: {ticketsLeft}</div>
              <p className={styles.rollNote}>Chọn chế độ, sau đó nhấn nút tròn để quay.</p>

              <div className={styles.rollModeSelector} role="group" aria-label="Chọn chế độ quay">
                {ROLL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className={`${styles.rollModeButton} ${
                      selectedRollMode === option.id ? styles.rollModeButtonActive : ""
                    }`}
                    type="button"
                    onClick={() => setSelectedRollMode(option.id)}
                    disabled={isBusy || drawingPhase === "revealed"}
                    aria-pressed={selectedRollMode === option.id}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.note}</span>
                  </button>
                ))}
              </div>

              <button
                className={styles.drawButton}
                type="button"
                onClick={() => drawBatch(selectedRoll)}
                disabled={isBusy || drawingPhase === "revealed" || ticketsLeft < selectedRoll.cost}
                aria-label={`${selectedRoll.label}, ${selectedRoll.note}`}
              >
                <div className={`${styles.turnHandleWrapper} ${drawingPhase === "turning" ? styles.turning : ""}`}>
                  <span className={styles.turnHandle} />
                </div>
                <strong>{selectedRoll.label}</strong>
                <small>{selectedRoll.note}</small>
              </button>

              <div className={`${styles.chute} ${drawingPhase === "dropping" || drawingPhase === "opening" ? styles.open : ""}`}>
                <div className={styles.chuteFlap} />
                <div
                  className={`${styles.activeCapsule} ${styles[drawingPhase]} ${rarityClass}`}
                  aria-hidden="true"
                >
                  <span className={styles.capsuleTop} />
                  <span className={styles.capsuleBottom} />
                  <span className={styles.capsuleGlow} />
                </div>
              </div>
          </div>

          {drawingPhase === "revealed" && drawnGifts.length > 0 && typeof document !== "undefined"
            ? createPortal(
            <div className={`${styles.resultOverlay} ${resultRarityClass}`}>
              <div className={`${styles.resultPanelPopup} ${styles.batchResultPanel}`}>
                <span className={styles.resultRarity}>{rarityLabel[activeRarity]}</span>
                <h2 className={styles.resultTitle}>Đã mở {rollSummary}</h2>
                <p className={styles.resultDesc}>Quà đã được đưa vào túi Starlog. Legendary được xếp lên đầu để dễ xem.</p>
                <div className={styles.resultGrid}>
                  {revealGifts.map((item, index) => (
                    <article
                      key={`${item.gift.id}-${index}`}
                      className={`${styles.resultGiftCard} ${styles[`giftCard${item.gift.rarity}`]}`}
                    >
                      <div className={styles.resultGiftMeta}>
                        <span>{rarityLabel[item.gift.rarity]}</span>
                        {item.isFree ? <small>free</small> : null}
                      </div>
                      <h3>{item.gift.title}</h3>
                      <p>{item.gift.description}</p>
                      <small>+{GIFT_AFFINITY_GAIN[item.gift.rarity]} kết nối khi tặng</small>
                    </article>
                  ))}
                </div>
                <button className={styles.closeBtn} onClick={closeResult}>Nhận quà</button>
              </div>
              <div className="confetti" aria-hidden="true" />
            </div>,
            document.body,
          )
            : null}

          {!isCompleted && state.gashaponPulls > 0 ? (
            <div style={{ marginTop: "3rem", textAlign: "center", position: "relative", zIndex: 20 }}>
              <button
                className="primaryAction"
                type="button"
                onClick={() => {
                  triggerParticles();

                  requestDialogue({
                    speaker: guides.anChi,
                    lines: ["Nhiều người đã đến đây trước bạn... và để lại điều gì đó."],
                    mood: "mysterious",
                    onComplete: () => {
                      completePart("gacha");
                      window.setTimeout(() => {
                        document.getElementById("cipher")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    },
                  });
                }}
              >
                Tiếp tục hành trình
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
    </div>
  );
};
