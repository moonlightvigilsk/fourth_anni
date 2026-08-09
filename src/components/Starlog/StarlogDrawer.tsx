import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { GIFT_AFFINITY_GAIN, gifts } from "../../data/gacha";
import { achievements } from "../../data/achievements";
import { guideList } from "../../data/guides";
import { journeyParts } from "../../data/journey";
import { canSeeHiddenStarlog, getUnlockedAchievementCount } from "../../lib/achievements";
import { AppState } from "../../lib/storage";
import { getLevelProgress } from "../../hooks/useAffinity";
import { useModalA11y } from "../../hooks/useModalA11y";
import { MemberQuiz } from "../MemberQuiz/MemberQuiz";
import styles from "./StarlogDrawer.module.css";

const StarlogReplyInbox = lazy(() =>
  import("./StarlogReplyInbox").then((module) => ({ default: module.StarlogReplyInbox })),
);

// Mirrors private localStorage keys in src/hooks/useMessages.ts.
const REPLY_STORAGE_KEYS = ["ll-sent-messages", "ll-local-reply-messages"];

type PendingGiftTransfer = {
  characterId: string;
  affinityGain: number;
  guideName: string;
};

type StarlogDrawerProps = {
  open: boolean;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onClose: () => void;
  openTarotJournal?: () => void;
  increaseAffinity: (characterId: string, amount?: number) => void;
  isObscured?: boolean;
};

export const StarlogDrawer = ({
  open,
  state,
  setState,
  onClose,
  openTarotJournal,
  increaseAffinity,
  isObscured = false,
}: StarlogDrawerProps) => {
  const drawerRef = useRef<HTMLElement | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReplyInbox, setShowReplyInbox] = useState(false);
  const [giftTarget, setGiftTarget] = useState<string | null>(null);
  const [quizTarget, setQuizTarget] = useState<string | null>(null);
  const [giftToast, setGiftToast] = useState<string | null>(null);
  const pendingGiftTransfersRef = useRef<PendingGiftTransfer[]>([]);
  const giftToastTimeoutRef = useRef<number | null>(null);
  const hiddenVisible = canSeeHiddenStarlog(state);
  const completedCount = state.completedParts.length;
  const totalWins = Object.values(state.minigameRecords).reduce((total, record) => total + record.wins, 0);
  const progressPercent = Math.round((completedCount / journeyParts.length) * 100);

  const handleModalClose = useCallback(() => {
    if (showReplyInbox) {
      setShowReplyInbox(false);
      return;
    }

    if (giftTarget) {
      setGiftTarget(null);
      return;
    }

    if (quizTarget) {
      setQuizTarget(null);
      return;
    }

    if (showConfirm) {
      setShowConfirm(false);
      return;
    }

    onClose();
  }, [giftTarget, onClose, quizTarget, showConfirm, showReplyInbox]);

  useModalA11y({
    isOpen: open,
    onClose: handleModalClose,
    id: "starlog",
    containerRef: drawerRef,
  });

  useEffect(() => {
    return () => {
      if (giftToastTimeoutRef.current !== null) {
        window.clearTimeout(giftToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingGiftTransfersRef.current.length) {
      return;
    }

    const transfers = pendingGiftTransfersRef.current;
    const latestTransfer = transfers[transfers.length - 1];
    pendingGiftTransfersRef.current = [];

    transfers.forEach((transfer) => {
      increaseAffinity(transfer.characterId, transfer.affinityGain);
    });

    setGiftTarget(null);
    setGiftToast(`Đã gửi quà cho ${latestTransfer.guideName}`);

    if (giftToastTimeoutRef.current !== null) {
      window.clearTimeout(giftToastTimeoutRef.current);
    }

    giftToastTimeoutRef.current = window.setTimeout(() => {
      setGiftToast(null);
      giftToastTimeoutRef.current = null;
    }, 2000);
  }, [increaseAffinity, state.giftedItems]);

  if (!open) {
    return null;
  }

  const handleGift = (characterId: string, giftTitle: string) => {
    setState((prev) => {
      const giftItem = gifts.find((gift) => gift.title === giftTitle);
      if (!giftItem) {
        return prev;
      }

      const inventoryIndex = prev.gashaponInventory.indexOf(giftTitle);
      if (inventoryIndex === -1) {
        return prev;
      }

      const newInventory = [...prev.gashaponInventory];
      newInventory.splice(inventoryIndex, 1);

      const currentGifts = prev.giftedItems[characterId] || [];
      const newGiftedItems = {
        ...prev.giftedItems,
        [characterId]: [...currentGifts, giftItem.id],
      };
      const isFirstGift = !prev.giftedItems[characterId]?.length;
      const guideName = guideList.find((guide) => guide.id === characterId)?.name ?? "thành viên này";

      pendingGiftTransfersRef.current.push({
        characterId,
        affinityGain: GIFT_AFFINITY_GAIN[giftItem.rarity],
        guideName,
      });

      return {
        ...prev,
        gashaponInventory: newInventory,
        giftedItems: newGiftedItems,
        achievements:
          isFirstGift && !prev.achievements.includes("first_gift")
            ? [...prev.achievements, "first_gift"]
            : prev.achievements,
      };
    });
  };

  const handleQuizComplete = (characterId: string) => {
    setState((prev) => {
      if (prev.memberQuizPassed.includes(characterId)) return prev;

      return {
        ...prev,
        memberQuizPassed: [...prev.memberQuizPassed, characterId],
      };
    });
    increaseAffinity(characterId, 5);
    setQuizTarget(null);
  };

  return (
    <div className={styles.scrim} onMouseDown={onClose}>
      <aside
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="starlog-title"
        aria-hidden={isObscured ? true : undefined}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {giftToast ? (
          <div className={styles.giftToast} role="status" aria-live="polite">
            {giftToast}
          </div>
        ) : null}

        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <span>KHO LƯU TRỮ</span>
            <h2 id="starlog-title">Nhật ký sao của hai cậu</h2>
            <p>Những chặng đường đã mở, những món quà đã nhận, và các dấu sao mà mọi người để lại sau khi đọc xong.</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.hiddenInboxButton}
              type="button"
              onClick={() => setShowReplyInbox(true)}
              aria-label="Mở hòm dấu sao gửi lại"
              data-audio="quiet"
            />
            <button type="button" onClick={onClose} aria-label="Đóng Starlog">
              Đóng
            </button>
          </div>
        </header>

        <section className={styles.heroPanel}>
          <div className={styles.heroOrb} aria-hidden="true">
            ✦
          </div>
          <div>
            <span>BỐN NĂM, HAI NGÔI SAO</span>
            <strong>{progressPercent}% tín hiệu đã sáng</strong>
            <p>
              {completedCount}/{journeyParts.length} chặng đã đi qua cùng Linh Lan và Lan Linh.
            </p>
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Dấu mốc đã sáng</h3>
          <div className={styles.metricGrid}>
            <div>
              <span>Chặng</span>
              <strong>
                {completedCount}/{journeyParts.length}
              </strong>
            </div>
            <div>
              <span>Thành tựu</span>
              <strong>
                {getUnlockedAchievementCount(state)}/{achievements.length}
              </strong>
            </div>
            <div>
              <span>Sao</span>
              <strong>{state.unlockedStars.length}</strong>
            </div>
            <div>
              <span>Thắng</span>
              <strong>{totalWins}</strong>
            </div>
          </div>
          <div className={styles.progressTrack} aria-hidden="true">
            <div style={{ width: `${progressPercent}%` }} />
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Kỷ niệm và thành tựu</h3>
          <ul className={styles.list}>
            {achievements.map((achievement) => {
              const found = state.achievements.includes(achievement.id);
              return (
                <li key={achievement.id} className={found ? styles.unlocked : styles.locked}>
                  <span>{found ? "✦" : "???"}</span>
                  <div>
                    <strong>{found ? achievement.title : "Tín hiệu mờ"}</strong>
                    <small>{found ? achievement.description : "Hãy đi tiếp thêm một chút để mở tín hiệu này."}</small>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.panel}>
          <h3>Mức độ kết nối</h3>
          <div className={styles.bondGrid}>
            {guideList.map((guide) => {
              const affinity = state.characterAffinity[guide.id] || 0;
              const { level, maxLevel, isMaxed, progress } = getLevelProgress(affinity, guide.id);
              const hasGiftsToGive = state.gashaponInventory.length > 0;
              const quizPassed = state.memberQuizPassed.includes(guide.id);

              return (
                <div
                  key={guide.id}
                  className={`${styles.bondCard} ${isMaxed ? styles.bondMaxed : ""}`}
                  style={{ "--bond-color": guide.color } as React.CSSProperties}
                >
                  <div className={styles.bondHeader}>
                    <div className={styles.bondInfo}>
                      <strong style={{ color: guide.color }}>{guide.name}</strong>
                      <small>{guide.role}</small>
                    </div>
                    <span className={styles.bondLevel}>
                      {isMaxed ? <span className={styles.bondMaxBadge}>Tối đa</span> : `Lv.${level}/${maxLevel}`}
                    </span>
                  </div>

                  <div className={styles.bondBarTrack}>
                    <div className={styles.bondBarFill} style={{ width: `${Math.max(progress * 100, level > 0 ? 5 : 0)}%` }} />
                  </div>

                  <div className={styles.bondActions}>
                    {hasGiftsToGive && !isMaxed ? (
                      <button className={styles.bondActionBtn} onClick={() => setGiftTarget(guide.id)} title="Tặng quà" type="button">
                        🎁
                      </button>
                    ) : null}
                    {!quizPassed && !isMaxed ? (
                      <button className={styles.bondActionBtn} onClick={() => setQuizTarget(guide.id)} title="Quiz về thành viên" type="button">
                        📝
                      </button>
                    ) : null}
                    {quizPassed ? <span className={styles.bondQuizDone} title="Đã hoàn thành quiz">✅</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Túi quà đã mở</h3>
          {state.gashaponInventory.length ? (
            <ul className={styles.inventoryList}>
              {state.gashaponInventory.map((title, index) => {
                const itemDetails = gifts.find((gift) => gift.title === title);
                return (
                  <li key={`${title}-${index}`} className={styles.inventoryItem}>
                    <span className={styles.inventoryItemRarity}>{itemDetails?.rarity || "common"}</span>
                    <strong>{title}</strong>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Chưa có món quà nào đang chờ ở đây nữa.</p>
          )}
        </section>

        <section className={styles.panel}>
          <h3>Trải bài tarot</h3>
          {state.tarotReading ? (
            <>
              <p>Chủ đề: {state.tarotReading.topicLabel}</p>
              {state.tarotReading.question ? <p>Câu hỏi: {state.tarotReading.question}</p> : null}
              <ul className={styles.chips}>
                {state.tarotReading.cards.map((card) => (
                  <li key={`${card.position}-${card.id}`}>
                    {card.positionLabel}: {card.title} ({card.orientationLabel})
                  </li>
                ))}
              </ul>
              <p>{state.tarotReading.cards[0]?.meaning}</p>
            </>
          ) : (
            <p>Các lá bài vẫn đang úp, chờ được lật lại.</p>
          )}
          {openTarotJournal ? (
            <button className={styles.tarotButton} onClick={openTarotJournal} type="button">
              Mở nhật ký trải bài
            </button>
          ) : null}
        </section>

        {hiddenVisible ? (
          <section className={`${styles.panel} ${styles.hiddenPanel}`}>
            <h3>Tín hiệu ẩn</h3>
            <p>Cuộn băng này vẫn giữ một tầng tín hiệu riêng cho những ai đã nhận quà và lật bài đến tận cùng.</p>
          </section>
        ) : null}

        <button className={styles.resetButton} onClick={() => setShowConfirm(true)} type="button">
          Làm lại từ đầu
        </button>

        {showReplyInbox ? (
          <Suspense fallback={null}>
            <StarlogReplyInbox onClose={() => setShowReplyInbox(false)} />
          </Suspense>
        ) : null}

        {showConfirm ? (
          <div className={styles.confirmOverlay} onMouseDown={(event) => { event.stopPropagation(); setShowConfirm(false); }}>
            <div className={styles.confirmDialog} onMouseDown={(event) => event.stopPropagation()}>
              <h3>Xóa toàn bộ tiến trình?</h3>
              <p>Mọi dấu mốc, quà và những gì đang mở trong trình duyệt này sẽ được đưa về điểm bắt đầu.</p>
              <div className={styles.confirmActions}>
                <button className={styles.confirmCancelBtn} onClick={() => setShowConfirm(false)} type="button">
                  Hủy
                </button>
                <button
                  className={styles.confirmConfirmBtn}
                  onClick={() => {
                    window.localStorage.removeItem("four-years-two-stars:v4");
                    REPLY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
                    window.location.reload();
                  }}
                  type="button"
                >
                  Xóa và bắt đầu lại
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {giftTarget ? (
          <div className={styles.confirmOverlay} onMouseDown={() => setGiftTarget(null)}>
            <div className={styles.giftPickerDialog} onMouseDown={(event) => event.stopPropagation()}>
              <h3>Tặng quà cho {guideList.find((guide) => guide.id === giftTarget)?.name}</h3>
              <p>Chọn một món quà đã mở để gửi lại cho thành viên này.</p>
              <div className={styles.giftPickerList}>
                {state.gashaponInventory.map((title, index) => {
                  const giftItem = gifts.find((gift) => gift.title === title);
                  return (
                    <button
                      key={`${title}-${index}`}
                      className={styles.giftPickerItem}
                      onClick={() => handleGift(giftTarget, title)}
                      type="button"
                    >
                      <span className={styles.giftPickerRarity}>{giftItem?.rarity || "common"}</span>
                      <strong>{title}</strong>
                      <small>+{giftItem ? GIFT_AFFINITY_GAIN[giftItem.rarity] : 3} kết nối</small>
                    </button>
                  );
                })}
              </div>
              <button className={styles.confirmCancelBtn} onClick={() => setGiftTarget(null)} style={{ marginTop: "1rem", width: "100%" }} type="button">
                Đóng
              </button>
            </div>
          </div>
        ) : null}

        {quizTarget ? (
          <div className={styles.confirmOverlay} onMouseDown={() => setQuizTarget(null)}>
            <div className={styles.giftPickerDialog} onMouseDown={(event) => event.stopPropagation()} style={{ maxWidth: "420px" }}>
              <MemberQuiz characterId={quizTarget} onComplete={() => handleQuizComplete(quizTarget)} onClose={() => setQuizTarget(null)} />
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
};
