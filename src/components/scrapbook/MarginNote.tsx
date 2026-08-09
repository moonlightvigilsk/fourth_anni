import { useState, type SyntheticEvent } from "react";
import { DialogueOverlayRequest } from "../../sections/sectionTypes";
import { GuideCharacter, guideList, guides } from "../../data/guides";

type MarginNoteProps = {
  id: string;
  author: string;
  text: string;
  requestDialogue: (dialogue: DialogueOverlayRequest) => void;
  onTrigger: () => void;
};

export const MarginNote = ({ author, text, requestDialogue, onTrigger }: MarginNoteProps) => {
  const [hasClicked, setHasClicked] = useState(false);

  const handleClick = () => {
    if (!hasClicked) {
      setHasClicked(true);
      onTrigger();
    }

    const speaker: GuideCharacter = guideList.find((guide) => guide.id === author) || guides.lilWayne;

    requestDialogue({
      speaker,
      lines: [text],
      mood: "soft",
    });
  };

  const stopPageFlipGesture = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      className={`marginNote ${hasClicked ? "clicked" : ""}`}
      onClick={handleClick}
      onPointerDownCapture={stopPageFlipGesture}
      onMouseDownCapture={stopPageFlipGesture}
      onTouchStartCapture={stopPageFlipGesture}
      onPointerDown={stopPageFlipGesture}
      onMouseDown={stopPageFlipGesture}
      onTouchStart={stopPageFlipGesture}
      aria-label={`Mở ghi chú của ${author}`}
    >
      <span className="noteText">{text}</span>
      <span className="noteAuthor">- {author}</span>
    </button>
  );
};
