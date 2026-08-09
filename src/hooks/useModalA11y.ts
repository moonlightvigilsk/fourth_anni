import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const modalStack: string[] = [];
let scrollLockCount = 0;
let previousBodyOverflow: string | null = null;

type UseModalA11yOptions = {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  containerRef: RefObject<HTMLElement>;
};

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
  );

export const useModalA11y = ({ isOpen, onClose, id, containerRef }: UseModalA11yOptions) => {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const existingIndex = modalStack.indexOf(id);
    if (existingIndex !== -1) {
      modalStack.splice(existingIndex, 1);
    }
    modalStack.push(id);

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    if (scrollLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLockCount += 1;

    const container = containerRef.current;
    if (container) {
      const firstFocusable = getFocusableElements(container)[0];
      (firstFocusable ?? container).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== id) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const activeContainer = containerRef.current;
      if (!activeContainer) {
        return;
      }

      const focusableElements = getFocusableElements(activeContainer);
      if (focusableElements.length === 0) {
        event.preventDefault();
        activeContainer.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (!activeContainer.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      const index = modalStack.lastIndexOf(id);
      if (index !== -1) {
        modalStack.splice(index, 1);
      }

      scrollLockCount = Math.max(0, scrollLockCount - 1);
      if (scrollLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow ?? "";
        previousBodyOverflow = null;
      }

      previouslyFocused.current?.focus?.();
    };
  }, [containerRef, id, isOpen]);

  const isTopmost = () => modalStack[modalStack.length - 1] === id;

  return { isTopmost };
};
