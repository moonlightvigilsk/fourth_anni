import React, { useRef } from "react";
import { AppState, SavedTarotCard } from "../../lib/storage";
import { useModalA11y } from "../../hooks/useModalA11y";
import styles from "./TarotJournal.module.css";

interface TarotJournalProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onClose: () => void;
}

export const TarotJournal = ({ state, setState, onClose }: TarotJournalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useModalA11y({
    isOpen: true,
    onClose,
    id: "tarot-journal",
    containerRef: modalRef,
  });

  const pinCard = (card: SavedTarotCard, readingCreatedAt: string) => {
    setState((prev) => ({
      ...prev,
      pinnedCharm: { ...card, _createdAt: readingCreatedAt } as any,
    }));
  };

  const unpinCard = () => {
    setState((prev) => ({
      ...prev,
      pinnedCharm: null,
    }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tarot-journal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng nhật ký tarot">
          &times;
        </button>
        <h2 id="tarot-journal-title" className={styles.title}>Nhật ký trải bài tarot</h2>

        <div className={styles.historyList}>
          {state.tarotHistory.length === 0 ? (
            <p className={styles.empty}>Chưa có trải bài nào được lưu.</p>
          ) : (
            [...state.tarotHistory].reverse().map((reading, index) => (
              <div key={index} className={styles.readingEntry}>
                <div className={styles.readingHeader}>
                  <h3>{reading.topicLabel}</h3>
                  <span className={styles.date}>
                    {new Date(reading.createdAt).toLocaleDateString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {reading.question ? <p className={styles.question}>"{reading.question}"</p> : null}

                <div className={styles.cardsRow}>
                  {reading.cards.map((card, cardIndex) => {
                    const isPinned =
                      state.pinnedCharm?.id === card.id &&
                      state.pinnedCharm?.orientation === card.orientation &&
                      (state.pinnedCharm as any)._createdAt === reading.createdAt;

                    return (
                      <div key={cardIndex} className={styles.cardInfo}>
                        <div className={styles.cardHeader}>
                          <span className={styles.cardPos}>{card.positionLabel}</span>
                          {card.orientation === "reversed" ? (
                            <span className={styles.reversedBadge}>Ngược</span>
                          ) : null}
                        </div>
                        <h4 className={styles.cardName}>{card.viName}</h4>
                        <p className={styles.cardKeywords}>{card.keywords.join(", ")}</p>

                        {isPinned ? (
                          <button className={styles.pinnedBtn} onClick={unpinCard}>
                            Đã ghim lá hộ mệnh
                          </button>
                        ) : (
                          <button className={styles.pinBtn} onClick={() => pinCard(card, reading.createdAt)}>
                            Ghim lá hộ mệnh
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
