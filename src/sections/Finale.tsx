import { useCallback, useEffect, useMemo, useState } from "react";
import { StarfieldCanvas } from "../components/Starfield/StarfieldCanvas";
import { guideList } from "../data/guides";
import { useElapsedTimeText } from "../hooks/useElapsedTimeText";
import { SectionProps } from "./sectionTypes";

type CreditGroup = {
  heading: string;
  names: string[];
};

export const Finale = ({
  state,
  completePart,
  isActive,
  isCompleted,
  onClose,
}: SectionProps) => {
  const [rollKey, setRollKey] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const timeText = useElapsedTimeText();

  const creditGroups = useMemo<CreditGroup[]>(
    () => [
      { heading: "Dành riêng cho", names: ["Linh Lan", "Lan Linh"] },
      ...guideList.map((member) => ({
        heading: member.role,
        names: [member.name],
      })),
      {
        heading: "Special Thanks",
        names: ["Cộng đồng Nal", "Cộng đồng Kani"],
      },
      {
        heading: "Yêu thương từ",
        names: ["Những người đã chuẩn bị món quà này"],
      },
    ],
    [],
  );

  useEffect(() => {
    if (isActive && !isCompleted) {
      completePart("finale");
    }
  }, [completePart, isActive, isCompleted]);

  useEffect(() => {
    if (isActive) {
      setShowControls(false);
      setRollKey((value) => value + 1);
    }
  }, [isActive]);

  const handleSkipCredits = useCallback(() => {
    setShowControls(true);
  }, []);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        handleSkipCredits();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkipCredits, isActive]);

  const handleReplay = useCallback(() => {
    setShowControls(false);
    setRollKey((value) => value + 1);
  }, []);

  const handleRollEnd = useCallback(() => {
    setShowControls(true);
  }, []);

  return (
    <div className="partStack finaleCreditsStack finaleFullscreen">
      <div className="finaleSky" aria-hidden="true">
        <StarfieldCanvas unlockedStars={state.unlockedStars} bright />
      </div>

      {!showControls ? (
        <section className="creditScreen" aria-label="Final credits">
          <div className="creditRoll" key={rollKey} onAnimationEnd={handleRollEnd}>
            <div className="creditTitle">
              <span>FOUR YEARS, TWO STARS</span>
              <h2>IV YEARS</h2>
              <p>Linh Lan x Lan Linh</p>
              <p>20.08.2022 - 20.08.2026</p>
              <p className="finaleElapsedTicker">{timeText} kể từ ngày đầu tiên</p>
            </div>

            {creditGroups.map((group) => (
              <article className="creditLine" key={`${group.heading}-${group.names.join("-")}`}>
                <span>{group.heading}</span>
                <strong>{group.names.join(" · ")}</strong>
              </article>
            ))}

            <div className="creditTitle creditEnd">
              <h2>Cảm ơn vì đã đi cùng nhau suốt 4 năm qua</h2>
              <p>Mong món quà nhỏ này giữ lại được một phần ánh sáng mà hai cậu đã mang đến cho rất nhiều người.</p>
              <h2 style={{ marginTop: "2rem" }}>Hẹn gặp lại ở năm tiếp theo.</h2>
            </div>
          </div>
        </section>
      ) : (
        <section className="finaleAfterCredit" aria-label="Credit controls">
          <div className="finaleAfterCreditContent">
            <h2>Hành Trình Này Vẫn Sẽ Còn Tiếp Diễn</h2>
            <p>Mong rằng chúng ta sẽ đồng hành thật lâu nữa</p>
            <div className="finaleControls">
              <button className="primaryAction" type="button" onClick={handleReplay}>
                Xem lại credit
              </button>
              <button className="primaryAction" type="button" onClick={() => onClose?.()}>
                Đóng
              </button>
            </div>
          </div>
        </section>
      )}

      {!showControls ? (
        <div className="skipHint">bấm [Space] để bỏ qua credit</div>
      ) : null}
    </div>
  );
};
