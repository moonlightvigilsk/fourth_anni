import { useEffect, useRef } from "react";
import { guides } from "../data/guides";
import { SectionProps } from "./sectionTypes";

const vtuberArtSlots = [
  {
    name: "Nika Linh Lan",
    imageSrc: "",
    note: "Một khung lưu niệm dành riêng cho Linh Lan.",
  },
  {
    name: "Nika Lan Linh",
    imageSrc: "",
    note: "Một khung lưu niệm dành riêng cho Lan Linh.",
  },
];

export const VtuberArt = ({
  completePart,
  requestDialogue,
  markDialogueSeen,
  hasSeenDialogue,
  isActive,
  isCompleted,
}: SectionProps) => {
  const hasQueuedRef = useRef(false);

  useEffect(() => {
    const dialogueId = "dialogue:vtuber-art:intro";
    if (!isActive || hasSeenDialogue(dialogueId) || hasQueuedRef.current) {
      return;
    }

    hasQueuedRef.current = true;
    markDialogueSeen(dialogueId);
    requestDialogue({
      speaker: guides.stone,
      lines: [
        "Trước khi mở cuốn sổ, tụi tớ muốn dành riêng một khoảng cho hình bóng của hai cậu.",
        "Không cần nói nhiều đâu. Cứ để khung này sáng lên như một lời chào nhỏ.",
      ],
      mood: "intimate",
    });
  }, [hasSeenDialogue, isActive, markDialogueSeen, requestDialogue]);

  return (
    <div className="partStack artShowcaseStack">
      <section className="artShowcaseIntro">
        <span>VTUBER ART</span>
        <h2>Hai hình bóng dưới cùng một bầu trời</h2>
        <p>Một khoảng riêng cho Linh Lan và Lan Linh trước khi bước sâu hơn vào những trang ký ức.</p>
      </section>

      <section className="vtuberArtGrid" aria-label="Khung art VTuber">
        {vtuberArtSlots.map((slot) => (
          <article className="vtuberArtCard" key={slot.name}>
            <div className="vtuberArtFrame">
              {slot.imageSrc ? (
                <img src={slot.imageSrc} alt={`Art của ${slot.name}`} />
              ) : (
                <div className="vtuberArtPlaceholder" aria-hidden="true">
                  <strong>{slot.name}</strong>
                </div>
              )}
            </div>
            <div className="vtuberArtCaption">
              <h3>{slot.name}</h3>
              <p>{slot.note}</p>
            </div>
          </article>
        ))}
      </section>

      {!isCompleted ? (
        <button className="primaryAction" type="button" onClick={() => completePart("vtuberArt")}>
          Mở Scrapbook
        </button>
      ) : null}
    </div>
  );
};
