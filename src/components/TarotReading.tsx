import { useEffect, useMemo, useState } from "react";
import { tarotTopicLabels, TarotTopic, tarotDeck } from "../data/tarotDeck";
import { DrawnTarotCard, drawTarotSpread } from "../lib/tarot";
import { guideList, GuideCharacter } from "../data/guides";
import { tarotInterpretations } from "../data/tarotInterpretations";
import { TarotReading as SavedReadingType } from "../lib/storage";
import { useReducedMotion } from "../hooks/useReducedMotion";

type SpreadCount = 1 | 3;

export type TarotReadingResult = {
  topic: TarotTopic;
  topicLabel: string;
  question: string;
  spreadCount: SpreadCount;
  cards: DrawnTarotCard[];
};

type TarotReadingProps = {
  onReadingComplete?: (reading: TarotReadingResult) => void;
  onInterpret?: (characterId: string) => void;
  savedReading?: SavedReadingType;
  onReset?: () => void;
};

const tarotTopics = Object.keys(tarotTopicLabels) as TarotTopic[];
const spreadPositions = ["Quá khứ", "Hiện tại", "Lời khuyên"];

export const TarotReading = ({ onReadingComplete, onInterpret, savedReading, onReset }: TarotReadingProps) => {
  const [topic, setTopic] = useState<TarotTopic>(savedReading?.topic ?? "general");
  const [question, setQuestion] = useState(savedReading?.question ?? "");
  const [spreadCount, setSpreadCount] = useState<SpreadCount>(
    savedReading ? (savedReading.cards.length === 3 ? 3 : 1) : 1
  );
  const [drawnCards, setDrawnCards] = useState<DrawnTarotCard[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showInterpretPicker, setShowInterpretPicker] = useState(false);
  const [interpretedBy, setInterpretedBy] = useState<string | null>(null);
  const [selectedInterpretationText, setSelectedInterpretationText] = useState<string | null>(null);

  // Overhaul states (Tasks 1, 2, 5)
  const [preDrawnBatch, setPreDrawnBatch] = useState<DrawnTarotCard[]>([]);
  const [selectedFanIndices, setSelectedFanIndices] = useState<number[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiReadingText, setGeminiReadingText] = useState<string | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const isReducedMotion = useReducedMotion();

  // Pre-draw the cards when entering/resetting the draw UI
  useEffect(() => {
    if (drawnCards.length === 0 && !savedReading) {
      const cards = drawTarotSpread(spreadCount, topic);
      setPreDrawnBatch(cards);
      setSelectedFanIndices([]);
      setFlippedIndices([]);
      setGeminiReadingText(null);
      setGeminiError(null);
      setGeminiLoading(false);
    }
  }, [drawnCards.length, savedReading, spreadCount, topic]);

  // Restore saved readings
  useEffect(() => {
    if (savedReading) {
      setTopic(savedReading.topic);
      setQuestion(savedReading.question);
      setSpreadCount(savedReading.cards.length === 3 ? 3 : 1);
      
      const reconstructed = savedReading.cards.map((savedCard) => {
        const card = tarotDeck.find((c) => c.id === savedCard.id);
        return {
          card: card!,
          orientation: savedCard.orientation,
          orientationLabel: savedCard.orientationLabel,
          keywords: savedCard.keywords,
          meaning: savedCard.meaning,
        };
      }).filter(c => c.card) as DrawnTarotCard[];
      setDrawnCards(reconstructed);
    } else {
      setDrawnCards([]);
      setQuestion("");
      setShowInterpretPicker(false);
      setInterpretedBy(null);
      setSelectedInterpretationText(null);
      setGeminiReadingText(null);
      setGeminiError(null);
    }
  }, [savedReading]);

  // Flip staggering effect
  useEffect(() => {
    if (drawnCards.length > 0) {
      if (isReducedMotion) {
        setFlippedIndices(drawnCards.map((_, i) => i));
      } else {
        setFlippedIndices([]);
        drawnCards.forEach((_, index) => {
          setTimeout(() => {
            setFlippedIndices((prev) => {
              if (prev.includes(index)) return prev;
              return [...prev, index];
            });
          }, index * 300);
        });
      }
    } else {
      setFlippedIndices([]);
    }
  }, [drawnCards, isReducedMotion]);

  const trimmedQuestion = useMemo(() => question.trim(), [question]);

  const handleSelectCard = (fanIndex: number) => {
    if (selectedFanIndices.includes(fanIndex)) return;
    if (selectedFanIndices.length >= spreadCount) return;

    const newSelections = [...selectedFanIndices, fanIndex];
    setSelectedFanIndices(newSelections);

    if (newSelections.length === spreadCount) {
      setTimeout(() => {
        setDrawnCards(preDrawnBatch);
        setImageErrors({});
        setShowInterpretPicker(false);
        setInterpretedBy(null);
        setSelectedInterpretationText(null);

        onReadingComplete?.({
          topic,
          topicLabel: tarotTopicLabels[topic],
          question: trimmedQuestion,
          spreadCount,
          cards: preDrawnBatch,
        });

        setTimeout(() => setShowInterpretPicker(true), 800);
      }, 800);
    }
  };

  const handleInterpret = (guide: GuideCharacter) => {
    setInterpretedBy(guide.id);
    setShowInterpretPicker(false);

    const lines = tarotInterpretations[guide.id] || [];
    const randomLine = lines[Math.floor(Math.random() * lines.length)] || "...";
    setSelectedInterpretationText(randomLine);

    onInterpret?.(guide.id);
  };

  const handleReset = () => {
    setDrawnCards([]);
    setSelectedFanIndices([]);
    setPreDrawnBatch([]);
    setFlippedIndices([]);
    setQuestion("");
    setShowInterpretPicker(false);
    setInterpretedBy(null);
    setSelectedInterpretationText(null);
    setGeminiReadingText(null);
    setGeminiLoading(false);
    setGeminiError(null);
    onReset?.();
  };

  const handleGeminiAnalysis = async () => {
    setGeminiLoading(true);
    setGeminiError(null);

    const payloadCards = drawnCards.map((drawnCard, index) => {
      const positionLabel = drawnCards.length === 3 ? spreadPositions[index] : undefined;
      return {
        name: drawnCard.card.name,
        viName: drawnCard.card.viName,
        orientation: drawnCard.orientation,
        position: positionLabel,
      };
    });

    try {
      const response = await fetch("/api/gemini-tarot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cards: payloadCards,
          topic: tarotTopicLabels[topic],
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to call API");
      }

      const data = await response.json();
      if (data && data.reading) {
        setGeminiReadingText(data.reading);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      console.error(err);
      setGeminiError("Dịch vụ này đang lỗi xíu, chọn mấy cái khác nhó ✦");
    } finally {
      setGeminiLoading(false);
    }
  };

  return (
    <div className="tarotReadingModule">
      <section className="tarotConsole" aria-label="Tarot reading controls">
        <div className="tarotConsoleHeader">
          <span>TAROT CHANNEL</span>
          <h2>Máy đọc tín hiệu</h2>
          <p>Chọn một chủ đề, giữ câu hỏi trong đầu, rồi để lá bài trả lời bằng một lớp sương mềm.</p>
        </div>

        <div className="tarotControls">
          <label>
            <span>Chủ đề</span>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value as TarotTopic)}
              disabled={drawnCards.length > 0 || selectedFanIndices.length > 0}
            >
              {tarotTopics.map((item) => (
                <option key={item} value={item}>
                  {tarotTopicLabels[item]}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.42rem' }}>
            <span>Câu hỏi của bạn</span>
            <textarea
              placeholder="Hãy giữ câu hỏi trong đầu hoặc ghi lại tại đây..."
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={drawnCards.length > 0 || selectedFanIndices.length > 0}
            />
          </label>

          <div className="tarotSpreadToggle" aria-label="Chọn số lá">
            <button
              type="button"
              className={spreadCount === 1 ? "selected" : ""}
              aria-pressed={spreadCount === 1}
              onClick={() => setSpreadCount(1)}
              disabled={drawnCards.length > 0 || selectedFanIndices.length > 0}
            >
              1 lá
            </button>
            <button
              type="button"
              className={spreadCount === 3 ? "selected" : ""}
              aria-pressed={spreadCount === 3}
              onClick={() => setSpreadCount(3)}
              disabled={drawnCards.length > 0 || selectedFanIndices.length > 0}
            >
              3 lá
            </button>
          </div>

          {drawnCards.length > 0 && (
            <button className="tarotDrawButton" type="button" onClick={handleReset}>
              Trải bài mới
            </button>
          )}
        </div>
      </section>

      <section className="tarotResultPanel" aria-live="polite" style={{ display: 'flex', flexDirection: 'column' }}>
        {drawnCards.length ? (
          <>
            <div className={`tarotSpread tarotSpread${drawnCards.length}`}>
              {drawnCards.map((drawnCard, index) => {
                const cardKey = `${drawnCard.card.id}-${drawnCard.orientation}`;
                const hasImageError = imageErrors[drawnCard.card.id];
                const positionLabel = drawnCards.length === 3 ? spreadPositions[index] : "Lá bài";
                const isFlipped = flippedIndices.includes(index);

                return (
                  <article className="tarotResultCard" key={cardKey} style={{ "--card-index": index } as React.CSSProperties}>
                    <span className="tarotPosition">{positionLabel}</span>
                    
                    {/* Task 2: 3D Flip Wrapper */}
                    <div className="tarotCardFlipWrapper">
                      <div className={`tarotCardFlipper ${isFlipped ? "isFlipped" : ""}`}>
                        
                        {/* Card Back */}
                        <div className="tarotCardBack">
                          <span>✦</span>
                        </div>
                        
                        {/* Card Face */}
                        <div className="tarotCardFace">
                          {/* Task 3: Shimmer border rotating gradient container */}
                          <div className={`tarotImageFrame ${drawnCard.orientation === "reversed" ? "isReversed" : ""}`}>
                            {/* Inner content div (Task 3 border mask) */}
                            <div className="tarotImageFrameInner">
                              {hasImageError ? (
                                <div className="tarotCardBack" style={{ border: 0, boxShadow: 'none' }}>
                                  <span>{drawnCard.card.viName}</span>
                                </div>
                              ) : (
                                <img
                                  src={drawnCard.card.image}
                                  className="tarotCardImage"
                                  alt={`${drawnCard.card.name} tarot card`}
                                  onError={() =>
                                    setImageErrors((previous) => ({
                                      ...previous,
                                      [drawnCard.card.id]: true,
                                    }))
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="tarotCardText">
                      <span>{drawnCard.orientationLabel}</span>
                      <h3>
                        {drawnCard.card.name} <small>({drawnCard.card.viName})</small>
                      </h3>
                      <ul className="tarotKeywords">
                        {drawnCard.keywords.map((keyword) => (
                          <li key={keyword}>{keyword}</li>
                        ))}
                      </ul>
                      <p>{drawnCard.meaning}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Soft hint for selecting interpreter (Task 6) */}
            {!interpretedBy && (
              <p className="interpreterHint" style={{ opacity: 0.7, textAlign: 'center', marginTop: '2rem', fontStyle: 'italic' }}>
                Hãy chọn một thành viên để đọc bài trước nhé ✦
              </p>
            )}

            {/* ─── Member Interpretation Picker ─── */}
            {showInterpretPicker && !interpretedBy && (
              <div className="tarotInterpretSection">
                <h3 className="tarotInterpretTitle">
                  Chọn người diễn giải
                </h3>
                <div className="tarotInterpretGrid">
                  {guideList.map((guide) => (
                    <button
                      key={guide.id}
                      className="tarotInterpretBtn"
                      onClick={() => handleInterpret(guide)}
                      style={{ "--member-color": guide.color } as React.CSSProperties}
                    >
                      <span className="interpretStar">✦</span>
                      <span className="interpretName">{guide.name}</span>
                      <small className="interpretRole">{guide.role}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Interpretation Result ─── */}
            {interpretedBy && selectedInterpretationText && (() => {
              const interpreter = guideList.find(g => g.id === interpretedBy);
              return (
                <div className="tarotInterpretResult" style={{ "--interpreter-color": interpreter?.color } as React.CSSProperties}>
                  <strong style={{ color: interpreter?.color }}>
                    🔮 {interpreter?.name} diễn giải:
                  </strong>
                  <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"{selectedInterpretationText}"</p>
                </div>
              );
            })()}

            {/* ─── Gemini Tarot Analysis (Task 5) ─── */}
            {interpretedBy && (
              <div className="geminiSection" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2.5rem', gap: '1rem' }}>
                {!geminiReadingText && !geminiError && (
                  <button
                    className="primaryAction"
                    onClick={handleGeminiAnalysis}
                    disabled={geminiLoading}
                    style={{ minWidth: '200px' }}
                  >
                    {geminiLoading ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <span className="spinningStar">✦</span> Đang đọc các lá bài...
                      </span>
                    ) : (
                      "Phân tích bài bằng Gemini ✦"
                    )}
                  </button>
                )}

                {geminiError && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <p className="geminiErrorText" style={{ opacity: 0.8, color: 'var(--rose)', fontStyle: 'italic' }}>
                      {geminiError}
                    </p>
                    <button
                      className="primaryAction"
                      onClick={handleGeminiAnalysis}
                      disabled={geminiLoading}
                    >
                      Thử lại ✦
                    </button>
                  </div>
                )}

                {geminiReadingText && (
                  <div className="geminiReading" style={{ width: '100%', marginTop: '1.5rem', padding: '1.5rem', border: '1px solid rgba(168, 146, 214, 0.25)', borderRadius: '12px', background: 'rgba(13, 17, 32, 0.5)', animation: 'fadeIn 0.5s ease-out both' }}>
                    <h4 style={{ color: 'var(--lavender)', fontFamily: 'var(--heading-font)', fontSize: '1.35rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>✦</span> Tiên tri Gemini phán giải
                    </h4>
                    <div style={{ lineHeight: 1.7, color: 'var(--cream)', opacity: 0.95, whiteSpace: 'pre-wrap' }}>
                      {geminiReadingText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="tarotDrawArea" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Task 1 Selected slots */}
            <div className="tarotSelectedSlots">
              {Array.from({ length: spreadCount }).map((_, idx) => {
                const label = spreadCount === 3 ? spreadPositions[idx] : "Lá bài";
                const isFilled = selectedFanIndices.length > idx;
                return (
                  <div key={idx} className="tarotSlot">
                    <span className="tarotSlotLabel">{label}</span>
                    <div className={`tarotSlotCard ${isFilled ? "isFilled" : ""}`}>
                      {isFilled ? <span>✦</span> : <span>?</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Task 1 Fan of cards */}
            <div className="tarotFannedDeck">
              {Array.from({ length: 6 }).map((_, idx) => {
                const isSelected = selectedFanIndices.includes(idx);
                const total = 6;
                const mid = 2.5;
                const angle = (idx - mid) * 12;
                const ty = Math.abs(idx - mid) * 8;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`tarotFannedCard ${isSelected ? "isSelected" : ""}`}
                    style={{
                      "--angle": `${angle}deg`,
                      "--ty": `${ty}px`,
                    } as React.CSSProperties}
                    onClick={() => handleSelectCard(idx)}
                    disabled={isSelected || selectedFanIndices.length >= spreadCount}
                    aria-label={`Rút lá bài thứ ${idx + 1}`}
                  >
                    ✦
                  </button>
                );
              })}
            </div>

            {selectedFanIndices.length === spreadCount ? (
              <p style={{ fontStyle: 'italic', opacity: 0.8, color: 'var(--gold)', animation: 'pulse 1.5s infinite' }}>
                Đang lật mở tương lai... ✦
              </p>
            ) : (
              <p style={{ opacity: 0.72 }}>
                Hãy chọn {spreadCount} lá bài từ bộ bài ở trên nhó ✦
              </p>
            )}
          </div>
        )}

        <p className="tarotDisclaimer" style={{ marginTop: 'auto', paddingTop: '2rem', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
          Phần bói bài này chỉ dành cho giải trí và tự suy ngẫm, không phải lời khuyên chuyên môn.
        </p>
      </section>
    </div>
  );
};
