import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useModalA11y } from "../../hooks/useModalA11y";

type PolaroidProps = {
  id: string;
  mediaPlaceholder: string;
  caption?: string;
  rotation?: number;
  isLarge?: boolean;
  isVideo?: boolean;
};

const isRenderableMediaPath = (value: string) => {
  return /^(\/|https?:\/\/|data:|blob:)/i.test(value.trim());
};

export const Polaroid = ({ id, mediaPlaceholder, caption, rotation = 0, isLarge = false, isVideo = false }: PolaroidProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMediaError, setHasMediaError] = useState(false);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  const clampedRotation = Math.max(-4, Math.min(4, rotation));
  const shouldRenderMedia = isRenderableMediaPath(mediaPlaceholder) && !hasMediaError;
  const titleId = `${id}-lightbox-title`;

  const closeExpanded = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useModalA11y({
    isOpen: isExpanded,
    onClose: closeExpanded,
    id: `scrapbook-polaroid-${id}`,
    containerRef: lightboxRef,
  });

  useEffect(() => {
    setHasMediaError(false);
  }, [mediaPlaceholder]);

  const stopPageFlipGesture = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  const openExpanded = (event: SyntheticEvent) => {
    event.stopPropagation();
    setIsExpanded(true);
  };

  const renderMedia = (expanded = false) => {
    const mediaClassName = `polaroidMedia ${isVideo ? "video" : "image"} ${expanded ? "large" : ""} ${shouldRenderMedia ? "realMedia" : ""}`;

    if (isVideo) {
      return (
        <div className={mediaClassName}>
          {shouldRenderMedia ? (
            <video
              src={mediaPlaceholder}
              controls={expanded}
              muted={!expanded}
              playsInline
              preload="metadata"
              aria-label={caption ?? id}
              onError={() => setHasMediaError(true)}
            />
          ) : (
            <>
              <div className="videoIcon">▶</div>
              <span>{mediaPlaceholder}</span>
            </>
          )}
        </div>
      );
    }

    return (
      <div className={mediaClassName}>
        {shouldRenderMedia ? (
          <img src={mediaPlaceholder} alt={caption ?? id} loading="lazy" onError={() => setHasMediaError(true)} />
        ) : (
          <span>{mediaPlaceholder}</span>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className={`scrapbookPolaroid ${isLarge ? "large" : "small"}`}
        style={{ transform: `rotate(${clampedRotation}deg)` }}
        onClick={openExpanded}
        onPointerDownCapture={stopPageFlipGesture}
        onMouseDownCapture={stopPageFlipGesture}
        onTouchStartCapture={stopPageFlipGesture}
        onPointerDown={stopPageFlipGesture}
        onMouseDown={stopPageFlipGesture}
        onTouchStart={stopPageFlipGesture}
        aria-label={`Mở ${isVideo ? "video" : "ảnh"} scrapbook: ${caption ?? mediaPlaceholder}`}
      >
        <div className="washiTape top" />
        <div className="washiTape bottom" />
        {renderMedia(false)}
        {caption ? <div className="polaroidCaption">{caption}</div> : null}
      </button>

      <AnimatePresence>
        {isExpanded && typeof document !== "undefined" && createPortal(
          <motion.div
            key={`${id}-lightbox`}
            className="polaroidLightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeExpanded}
            onPointerDown={stopPageFlipGesture}
          >
            <motion.div
              ref={lightboxRef}
              className="lightboxContent"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              onClick={stopPageFlipGesture}
              onPointerDown={stopPageFlipGesture}
            >
              <h3 id={titleId} className="sr-only">
                {caption ?? (isVideo ? "Video scrapbook" : "Ảnh scrapbook")}
              </h3>
              {renderMedia(true)}
              {caption ? <div className="polaroidCaption large">{caption}</div> : null}
              <button className="closeBtn" type="button" onClick={closeExpanded} aria-label="Đóng">
                ×
              </button>
            </motion.div>
          </motion.div>,
          document.body,
        )}
      </AnimatePresence>
    </>
  );
};
