import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SectionProps } from "./sectionTypes";
import styles from "./Letters.module.css";
import { guides, GuideCharacter } from "../data/guides";
import { letterReplyDialogues } from "../data/letterReplyDialogues";
import { memberLetters } from "../data/memberLetters";
import { useReducedMotion } from "../hooks/useReducedMotion";

const LetterModal = lazy(() =>
  import("../components/LetterModal/LetterModal").then((module) => ({ default: module.LetterModal })),
);

type TeamLetter = {
  sender: GuideCharacter;
  title: string;
  content: string;
  closing: string;
};

/** Animation phase for the letter open/close sequence. */
type LetterAnimPhase =
  | "idle"          // No letter shown
  | "flap"          // Envelope flap opening (0.4s)
  | "slide"         // Paper sliding out (0.3s)
  | "unroll"        // Letter paper expanding via max-height
  | "open"          // Fully open, interactive
  | "closing-paper" // Reverse: collapsing max-height (0.3s)
  | "closing-slide" // Reverse: paper sliding back (0.3s)
  | "closing-flap"; // Reverse: flap closing (0.4s)

// Timing constants (ms)
const FLAP_DURATION = 400;
const SLIDE_DURATION = 300;
const UNROLL_SETTLE = 100; // Small buffer after max-height transition starts
const CLOSE_PAPER_DURATION = 300;
const CLOSE_SLIDE_DURATION = 300;

export const Letters = ({
  state,
  setState,
  isActive,
  isCompleted,
  completePart,
  requestDialogue,
  hasSeenDialogue,
  markDialogueSeen,
  increaseAffinity,
}: SectionProps) => {
  const hasQueuedIntroRef = useRef(false);
  const reducedMotion = useReducedMotion();

  // --- State ---
  const [openedLetters, setOpenedLetters] = useState<string[]>([]);
  const [firstOpenedLetters, setFirstOpenedLetters] = useState<Set<string>>(new Set());
  const [activeLetter, setActiveLetter] = useState<number | null>(null);
  const [animPhase, setAnimPhase] = useState<LetterAnimPhase>("idle");
  const [pendingLetter, setPendingLetter] = useState<{ index: number; senderId: string } | null>(null);
  const [viewerMessageMember, setViewerMessageMember] = useState<{ member: GuideCharacter; content: string } | null>(null);

  // Refs for animation timers so we can clean up
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teamLetters = useMemo<TeamLetter[]>(
    () => [
      { sender: guides.kagura, ...memberLetters.kagura },
      { sender: guides.imed, ...memberLetters.imed },
      { sender: guides.anChi, ...memberLetters["an-chi"] },
      { sender: guides.lilWayne, ...memberLetters["lil-wayne"] },
      { sender: guides.nova, ...memberLetters.nova },
      { sender: guides.stone, ...memberLetters.stone },
    ],
    [],
  );

  // Cleanup animation timers on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  // --- Intro dialogue ---
  useEffect(() => {
    const dialogueId = "dialogue:letters:intro";
    if (!isActive || hasSeenDialogue(dialogueId) || hasQueuedIntroRef.current) {
      return;
    }

    hasQueuedIntroRef.current = true;
    markDialogueSeen(dialogueId);

    requestDialogue({
      speaker: guides.kagura,
      lines: ["Tụi tớ có vài dòng muốn để lại riêng cho hai cậu ở đây."],
      mood: "intimate",
    });
  }, [hasSeenDialogue, isActive, markDialogueSeen, requestDialogue]);

  // --- Journey completion ---
  const handleContinue = useCallback((awardAchievement = openedLetters.length >= teamLetters.length) => {
    completePart("letters", { awardAchievement });
    requestDialogue({
      speaker: guides.kagura,
      lines: [
        "Những lời nhắn đã ở đây đầy đủ rồi.",
        "Trước hồi kết, hãy ghé qua khung ảnh của những người đã gửi món quà này nhé.",
      ],
      mood: "soft",
    });
  }, [completePart, openedLetters.length, requestDialogue, teamLetters.length]);

  // --- Mark letter as read & check completion ---
  const markLetterOpened = useCallback(
    (senderId: string) => {
      setOpenedLetters((prev) => {
        if (prev.includes(senderId)) return prev;
        const newOpened = [...prev, senderId];
        if (newOpened.length === teamLetters.length && !isCompleted) {
          // Use setTimeout to avoid nested setState during render
          setTimeout(() => handleContinue(true), 0);
        }
        return newOpened;
      });
    },
    [handleContinue, isCompleted, teamLetters.length],
  );

  // --- Open animation sequence ---
  const startOpenSequence = useCallback(
    (index: number, senderId: string) => {
      const isFirstOpen = !firstOpenedLetters.has(senderId);

      setActiveLetter(index);
      markLetterOpened(senderId);

      if (reducedMotion) {
        // Reduced motion: skip all motion, jump to open
        setAnimPhase("open");
        setFirstOpenedLetters((prev) => new Set(prev).add(senderId));
        return;
      }

      if (isFirstOpen) {
        // Full sequence: flap → slide → unroll → open
        setAnimPhase("flap");

        animTimerRef.current = setTimeout(() => {
          setAnimPhase("slide");

          animTimerRef.current = setTimeout(() => {
            setAnimPhase("unroll");

            animTimerRef.current = setTimeout(() => {
              setAnimPhase("open");
              setFirstOpenedLetters((prev) => new Set(prev).add(senderId));
            }, UNROLL_SETTLE);
          }, SLIDE_DURATION);
        }, FLAP_DURATION);
      } else {
        // Re-open: skip flap & slide, go straight to fast unroll
        setAnimPhase("unroll");

        animTimerRef.current = setTimeout(() => {
          setAnimPhase("open");
        }, UNROLL_SETTLE);
      }
    },
    [firstOpenedLetters, markLetterOpened, reducedMotion],
  );

  // --- Close animation sequence ---
  const startCloseSequence = useCallback(
    (onComplete: () => void) => {
      if (reducedMotion || animPhase === "idle") {
        onComplete();
        return;
      }

      // Reverse: close paper → slide back → flap close
      setAnimPhase("closing-paper");

      animTimerRef.current = setTimeout(() => {
        setAnimPhase("closing-slide");

        animTimerRef.current = setTimeout(() => {
          setAnimPhase("idle");
          setActiveLetter(null);
          onComplete();
        }, CLOSE_SLIDE_DURATION);
      }, CLOSE_PAPER_DURATION);
    },
    [animPhase, reducedMotion],
  );

  // --- Handle envelope click ---
  const handleOpenLetter = useCallback(
    (index: number, senderId: string) => {
      // If clicking the same letter that's already open, ignore
      if (activeLetter === index && (animPhase === "open" || animPhase === "unroll")) {
        return;
      }

      // If a close animation is in progress, queue this letter
      if (animPhase.startsWith("closing")) {
        setPendingLetter({ index, senderId });
        return;
      }

      // If another letter is open, close it first then open the new one
      if (activeLetter !== null && animPhase !== "idle") {
        setPendingLetter({ index, senderId });
        startCloseSequence(() => {
          // The pending letter will be opened via the effect below
        });
        return;
      }

      // Nothing open — start opening directly
      startOpenSequence(index, senderId);
    },
    [activeLetter, animPhase, startCloseSequence, startOpenSequence],
  );

  // --- Process pending letter after close completes ---
  useEffect(() => {
    if (animPhase === "idle" && pendingLetter) {
      const { index, senderId } = pendingLetter;
      setPendingLetter(null);
      startOpenSequence(index, senderId);
    }
  }, [animPhase, pendingLetter, startOpenSequence]);

  // --- Close letter ---
  const closeLetter = useCallback(() => {
    if (reducedMotion) {
      setAnimPhase("idle");
      setActiveLetter(null);
      return;
    }

    startCloseSequence(() => {
      // Already handled in close sequence
    });
  }, [reducedMotion, startCloseSequence]);

  // --- Reply handler (unchanged logic) ---
  const handleReply = (sender: GuideCharacter) => {
    if (state.letterReplies.includes(sender.id)) {
      return;
    }

    setState((prev) => ({
      ...prev,
      letterReplies: [...prev.letterReplies, sender.id],
    }));

    increaseAffinity?.(sender.id, 3);

    const replyData = letterReplyDialogues[sender.id];
    if (replyData) {
      requestDialogue({
        speaker: sender,
        mood: replyData.mood,
        lines: replyData.lines,
      });
    }
  };

  // --- Derived animation states ---
  const isFlapOpen = animPhase === "flap" || animPhase === "slide" || animPhase === "unroll" || animPhase === "open";
  const isSlideVisible = animPhase === "slide" || animPhase === "unroll" || animPhase === "open";
  const isClosingPhase = animPhase.startsWith("closing");
  const isPaperUnrolled = animPhase === "unroll" || animPhase === "open";
  const isPaperClosing = animPhase === "closing-paper";
  const isFirstOpenForActive = activeLetter !== null && !firstOpenedLetters.has(teamLetters[activeLetter]?.sender.id);
  const isFastUnroll = activeLetter !== null && !isFirstOpenForActive && !reducedMotion;

  // Build letterPaper class
  const letterPaperClass = [
    styles.letterPaper,
    isPaperUnrolled ? styles.unrolled : "",
    isPaperClosing ? styles.closing : "",
    isFastUnroll ? styles.fastUnroll : "",
    reducedMotion ? styles.reducedMotion : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Build letterSlideWrapper class
  const slideWrapperClass = [
    styles.letterSlideWrapper,
    isSlideVisible && !isClosingPhase ? styles.slideVisible : "",
    reducedMotion ? `${styles.reducedMotion} ${styles.slideVisible}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.lettersContainer}>
      <h2 className={styles.title}>LỜI NHẮN GỬI HAI CẬU</h2>

      <div className={styles.envelopesGrid}>
        {teamLetters.map((letter, index) => {
          const isOpened = openedLetters.includes(letter.sender.id);
          const isActiveEnvelope = activeLetter === index;
          const showFlap = isActiveEnvelope && isFlapOpen && !reducedMotion;

          // Build envelope class
          const envelopeClass = [
            styles.envelope,
            isOpened ? styles.opened : styles.unread,
            isActiveEnvelope ? styles.active : "",
            showFlap ? styles.flapOpen : "",
            letter.sender.id === "kagura" ? styles.leaderEnvelope : "",
          ]
            .filter(Boolean)
            .join(" ");

          // Guide color as CSS custom property for glow
          const guideColorGlow = letter.sender.color
            ? `${letter.sender.color}66` // Hex color + ~40% alpha
            : undefined;

          return (
            <button
              key={letter.sender.id}
              className={envelopeClass}
              style={
                {
                  "--guide-color-glow": guideColorGlow ?? "rgba(216, 180, 92, 0.4)",
                } as React.CSSProperties
              }
              onClick={() => handleOpenLetter(index, letter.sender.id)}
              type="button"
            >
              <div className={styles.envelopeInner}>
                {/* Envelope flap (3D fold element) */}
                <div className={styles.envelopeFlap} />
                <div className={styles.envelopeIcon} style={{ color: letter.sender.color }}>
                  {isOpened ? "💌" : "📫"}
                </div>
                <div className={styles.senderName} style={{ color: letter.sender.color }}>
                  {letter.sender.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeLetter !== null ? (
        <div className={styles.letterInPlaceContainer}>
          <div className={slideWrapperClass}>
            <div className={styles.scrollLetter}>
              <div className={styles.rodTop} />
              <article className={letterPaperClass}>
                <button className={styles.closeButton} onClick={closeLetter} type="button" aria-label="Đóng thư">
                  ×
                </button>

                <p className={styles.letterGreeting} style={{ color: teamLetters[activeLetter].sender.color }}>
                  {teamLetters[activeLetter].title}
                </p>

                <p className={styles.letterBody}>{teamLetters[activeLetter].content}</p>

                <p className={styles.letterSignoff}>Thương mến,</p>
                <p className={styles.letterSign} style={{ color: teamLetters[activeLetter].sender.color }}>
                  {teamLetters[activeLetter].closing}
                </p>

                <button
                  className={styles.viewerMessageButton}
                  onClick={() => {
                    const letter = teamLetters[activeLetter];
                    setViewerMessageMember({
                      member: letter.sender,
                      content: letter.content,
                    });
                  }}
                  type="button"
                >
                  {state.letterReplies.includes(teamLetters[activeLetter].sender.id) ? "Mở lại dấu sao" : "Để lại dấu sao"} cho {teamLetters[activeLetter].sender.name}
                </button>
              </article>
              <div className={styles.rodBottom} />
            </div>
          </div>
        </div>
      ) : null}

      {isCompleted ? (
        <div className={styles.completedMessage}>
          Tất cả thư đã mở. Con đường dẫn tới khung ảnh sau tín hiệu đã sẵn sàng.
        </div>
      ) : null}

      {!isCompleted ? (
        <div style={{ marginTop: "2rem", textAlign: "center", position: "relative", zIndex: 10 }}>
          <button className="primaryAction" type="button" onClick={() => handleContinue()}>
            Tiếp tục hành trình
          </button>
        </div>
      ) : null}

      {viewerMessageMember ? (
        <Suspense fallback={null}>
          <LetterModal
            member={viewerMessageMember.member}
            letterContent={viewerMessageMember.content}
            onSent={() => handleReply(viewerMessageMember.member)}
            onClose={() => setViewerMessageMember(null)}
          />
        </Suspense>
      ) : null}
    </div>
  );
};
