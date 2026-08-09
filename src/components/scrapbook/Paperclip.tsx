import { useState, type SyntheticEvent } from "react";
import { motion, AnimatePresence } from "motion/react";

type PaperclipProps = {
  id: string;
  note: string;
  onOpen: () => void;
};

export const Paperclip = ({ note, onOpen }: PaperclipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (!isOpen) {
      onOpen();
    }
    setIsOpen(!isOpen);
  };

  const stopPageFlipGesture = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <div className="paperclipContainer">
      <button
        type="button"
        className="paperclipIcon"
        onClick={handleToggle}
        onPointerDownCapture={stopPageFlipGesture}
        onMouseDownCapture={stopPageFlipGesture}
        onTouchStartCapture={stopPageFlipGesture}
        onPointerDown={stopPageFlipGesture}
        onMouseDown={stopPageFlipGesture}
        onTouchStart={stopPageFlipGesture}
        aria-label={isOpen ? "Đóng ghi chú kẹp giấy" : "Mở ghi chú kẹp giấy"}
      >
        📎
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="paperclipNote"
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
          >
            <div className="foldedPaper">
              {note}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
