import { useEffect, useRef, useState } from "react";
import styles from "./minigames.module.css";
import { randomInRange } from "../lib/random";

const GAME_DURATION = 60;
const WIN_SCORE = 30;
const isTouchDevice = () =>
  typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const simulateKey = (key: string, type: "keydown" | "keyup") => {
  const event = new KeyboardEvent(type, {
    key,
    code: `Key${key.toUpperCase()}`,
    bubbles: true,
  });
  window.dispatchEvent(event);
};

type Fault = {
  id: number;
  xPercent: number;
  widthPercent: number;
};

export const SignalRepairCoopGame = ({ onComplete, onBack }: { onComplete: (isWin: boolean) => void; onBack: () => void }) => {
  const [repairs, setRepairs] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<"playing" | "end">("playing");
  
  const [cursorX, setCursorX] = useState(50);
  const [fault, setFault] = useState<Fault | null>(null);

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const cursorXRef = useRef(50);
  const faultRef = useRef<Fault | null>(null);
  const faultElementRef = useRef<HTMLDivElement | null>(null);
  const cursorElementRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number>();
  const repairKeyDownRef = useRef(false);

  // Spawn new fault
  useEffect(() => {
    if (gameState !== "playing") return;
    if (!fault) {
      const width = randomInRange(10, 20);
      const nextFault = {
        id: Date.now(),
        xPercent: randomInRange(width, 100 - width),
        widthPercent: width,
      };
      faultRef.current = nextFault;
      setFault(nextFault);
    }
  }, [fault, gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const tick = () => {
      let dx = 0;
      if (keysRef.current["a"] || keysRef.current["A"]) dx -= 0.8;
      if (keysRef.current["d"] || keysRef.current["D"]) dx += 0.8;

      if (dx !== 0) {
        cursorXRef.current += dx;
        if (cursorXRef.current < 0) cursorXRef.current = 0;
        if (cursorXRef.current > 100) cursorXRef.current = 100;
        setCursorX(cursorXRef.current);
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("end");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearInterval(timerId);
    };
  }, [gameState]);

  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (gameState === "end" && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete(repairs >= WIN_SCORE && lives > 0);
    }
  }, [gameState, onComplete, repairs, lives]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      // P2 action
      if (key === "l" || e.key === "Enter") {
        e.preventDefault();

        // A physical press must only submit one repair. Keyboard repeat events
        // previously evaluated the same (stale) fault multiple times.
        if (e.repeat || repairKeyDownRef.current) {
          return;
        }
        repairKeyDownRef.current = true;

        const activeFault = faultRef.current;
        if (activeFault) {
          // Score against the actual rendered shapes. If even the edge of the
          // purple cursor touches the visible red zone, the repair is valid.
          const faultRect = faultElementRef.current?.getBoundingClientRect();
          const cursorRect = cursorElementRef.current?.getBoundingClientRect();
          const inZone =
            Boolean(faultRect && cursorRect) &&
            cursorRect!.right >= faultRect!.left &&
            cursorRect!.left <= faultRect!.right;

          if (inZone) {
            faultRef.current = null;
            setRepairs(r => r + 1);
            setFault(null);
          } else {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState("end");
              }
              return newLives;
            });
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
      if (key === "l" || e.key === "Enter") {
        repairKeyDownRef.current = false;
      }
    };
    const handleBlur = () => {
      keysRef.current = {};
      repairKeyDownRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [gameState]);

  const isWin = repairs >= WIN_SCORE && lives > 0;
  const showTouchControls = isTouchDevice();

  return (
    <div className={styles.minigameOverlay}>
      <div className={styles.minigameHeader}>
        <h3 className={styles.minigameTitle}>Sửa Tín Hiệu (Co-op)</h3>
        <div className={styles.minigameStatus}>
          <div className={styles.minigameScore}>Đã sửa: {repairs}/{WIN_SCORE}</div>
          <div style={{ color: "#ef4444" }}>HP: {"♥".repeat(lives)}</div>
          <div className={styles.minigameTime}>T/g: {timeLeft}s</div>
        </div>
      </div>
      <div className={styles.minigameBody}>
        <div style={{ width: "80%", maxWidth: "600px", position: "relative" }}>
          {/* Signal Track */}
          <div style={{ height: "40px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", position: "relative" }}>
            {/* Fault Zone */}
            {fault && (
              <div
                ref={faultElementRef}
                style={{
                  position: "absolute",
                  left: `${fault.xPercent}%`,
                  width: `${fault.widthPercent}%`,
                  height: "100%",
                  background: "rgba(239, 68, 68, 0.4)",
                  transform: "translateX(-50%)",
                  animation: "pulse 1s infinite alternate"
                }}
              />
            )}
            
            {/* P1 Cursor */}
            <div
              ref={cursorElementRef}
              style={{
                position: "absolute",
                left: `${cursorX}%`,
                top: "-10px",
                bottom: "-10px",
                width: "6px",
                background: "#a855f7",
                boxShadow: "0 0 10px #a855f7",
                transform: "translateX(-50%)"
              }}
            ></div>
          </div>
        </div>
        <div className={styles.instructions}>
          <p><strong>Player 1:</strong> Dùng A / D để di chuyển con trỏ.</p>
          <p><strong>Player 2:</strong> Bấm L khi con trỏ P1 đang ở trong vùng lỗi (đỏ).</p>
        </div>
      </div>

      {showTouchControls && gameState === "playing" ? (
        <div className={styles.touchOverlay}>
          <div className={styles.touchGroup}>
            <button
              className={styles.touchBtn}
              type="button"
              onPointerDown={() => simulateKey("a", "keydown")}
              onPointerUp={() => simulateKey("a", "keyup")}
              onPointerCancel={() => simulateKey("a", "keyup")}
              onPointerLeave={() => simulateKey("a", "keyup")}
              aria-label="Player 1 trái"
            >
              ◀
            </button>
            <button
              className={styles.touchBtn}
              type="button"
              onPointerDown={() => simulateKey("d", "keydown")}
              onPointerUp={() => simulateKey("d", "keyup")}
              onPointerCancel={() => simulateKey("d", "keyup")}
              onPointerLeave={() => simulateKey("d", "keyup")}
              aria-label="Player 1 phải"
            >
              ▶
            </button>
          </div>
          <div className={styles.touchGroup}>
            <button
              className={styles.touchBtn}
              type="button"
              onPointerDown={() => simulateKey("l", "keydown")}
              onPointerUp={() => simulateKey("l", "keyup")}
              onPointerCancel={() => simulateKey("l", "keyup")}
              aria-label="Player 2 sửa"
            >
              Sửa
            </button>
          </div>
        </div>
      ) : null}

      {gameState === "end" && (
        <div className={`${styles.minigameResult} ${isWin ? styles.resultWinScene : styles.resultLoseScene}`}>
          <h2 className={`${styles.resultTitle} ${isWin ? styles.win : styles.lose}`}>
            {isWin ? "THÀNH CÔNG" : "THẤT BẠI"}
          </h2>
          <p className={styles.resultDesc}>
            {isWin ? "Hai bạn đã sửa thành công tín hiệu!" : "Tín hiệu đã bị đứt gãy hoàn toàn."}
          </p>
          <div className={styles.resultActions}>
            <button className={`${styles.actionButton} ${styles.primary}`} onClick={onBack}>
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
