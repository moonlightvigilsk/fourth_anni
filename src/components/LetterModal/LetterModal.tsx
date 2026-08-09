import { useCallback, useEffect, useRef, useState } from "react";
import type { GuideCharacter } from "../../data/guides";
import { useMessages } from "../../hooks/useMessages";
import { useModalA11y } from "../../hooks/useModalA11y";
import styles from "./LetterModal.module.css";

interface LetterModalProps {
  member: GuideCharacter | null;
  letterContent: string | null;
  onClose: () => void;
  onSent?: () => void;
}

export const LetterModal = ({ member, letterContent, onClose, onSent }: LetterModalProps) => {
  const [messageText, setMessageText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isOpen = member !== null;

  useModalA11y({
    isOpen,
    onClose,
    id: "letter-viewer-message",
    containerRef: cardRef as React.RefObject<HTMLElement>,
  });

  const { messages, loading, hasSent, sendMessage, firebaseReady } = useMessages(member?.id ?? null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    setMessageText("");
    setSenderName("");
    setSending(false);
    setJustSent(false);
    setSendError("");
  }, [member?.id]);

  const handleSend = useCallback(async () => {
    if (!senderName.trim() || !messageText.trim() || sending || hasSent) {
      return;
    }

    setSending(true);
    setSendError("");

    try {
      const saved = await sendMessage(messageText, senderName);
      if (saved) {
        setJustSent(true);
        setMessageText("");
        setSenderName("");
        onSent?.();
      }
    } catch {
      setSendError("Dấu sao chưa thể gửi đi lúc này. Cậu thử lại thêm một lần nữa nhé.");
    } finally {
      setSending(false);
    }
  }, [hasSent, messageText, onSent, sendMessage, senderName, sending]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  if (!member || !letterContent) {
    return null;
  }

  const alreadySent = hasSent || justSent;
  const charsLeft = 200 - messageText.length;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        ref={cardRef}
        className={styles.card}
        style={{ "--member-color": member.color } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-modal-title"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng dấu sao" type="button">
          ×
        </button>

        <div className={styles.header}>
          {member.artSrc ? (
            <div className={styles.avatarWrap}>
              <img src={member.artSrc} alt={member.name} className={styles.avatar} />
            </div>
          ) : null}
          <div className={styles.headerText}>
            <span className={styles.role}>{member.role}</span>
            <h3 className={styles.name} id="letter-modal-title">
              {member.name}
            </h3>
          </div>
        </div>

        <div className={styles.letterSection}>
          <h4 className={styles.letterTitle}>Từ: {member.name}</h4>
          <div className={styles.letterContent}>
            {letterContent.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <p className={styles.letterClosing}>
            Thương mến,
            <br />
            <span style={{ color: member.color }}>{member.name}</span>
          </p>
        </div>

        <div className={styles.divider} />

        <div className={styles.messagesSection}>
          <h4 className={styles.messagesTitle}>✦ Dấu sao gửi lại cho {member.name}</h4>
          <p className={styles.emptyText} style={{ marginBottom: "0.8rem" }}>
            {firebaseReady
              ? "Nếu muốn, cậu có thể để lại một lời nhắn nhỏ ở đây."
              : "Phần này đang lưu ngay trên trình duyệt hiện tại để món quà vẫn trọn vẹn dù không cần kết nối thêm."}
          </p>

          <div className={styles.messagesList}>
            {loading ? <p className={styles.loadingText}>Đang mở lại những dấu sao...</p> : null}
            {!loading && messages.length === 0 ? (
              <p className={styles.emptyText}>Chưa có dấu sao nào quay về. Nếu cậu muốn, hãy để lại lời nhắn đầu tiên ở đây.</p>
            ) : null}
            {messages.map((msg) => (
              <div key={msg.id} className={styles.messageBubble}>
                <p className={styles.messageText}>"{msg.text}"</p>
                <span className={styles.messageSender}>- {msg.senderName}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {alreadySent ? (
            <div className={styles.sentConfirm}>
              <span>Đã gửi dấu sao</span>
              <p>Cảm ơn cậu đã để lại một lời nhắn nhỏ cho {member.name}. Dấu sao này sẽ còn ở đây khi cậu mở lại.</p>
            </div>
          ) : (
            <div className={styles.sendForm}>
              <label className={styles.inputGroup}>
                <span className={styles.fieldLabel}>Cậu là?</span>
                <input
                  className={styles.nameInput}
                  type="text"
                  placeholder="Linh, Lan, hoặc cả hai"
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value.slice(0, 30))}
                  maxLength={30}
                  autoComplete="name"
                />
              </label>
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel} htmlFor="viewer-reply-content">
                  Lời nhắn
                </label>
                <textarea
                  id="viewer-reply-content"
                  className={styles.messageInput}
                  placeholder={`Cậu muốn để lại điều gì cho ${member.name}?`}
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value.slice(0, 200))}
                  onKeyDown={handleKeyDown}
                  maxLength={200}
                  rows={2}
                />
                <span className={`${styles.charCount} ${charsLeft <= 20 ? styles.charCountWarn : ""}`}>{charsLeft}</span>
              </div>
              <div className={styles.sendRow}>
                <button
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={!senderName.trim() || !messageText.trim() || sending}
                  type="button"
                >
                  {sending ? "..." : "Gửi dấu sao"}
                </button>
              </div>
              {sendError ? <p className={styles.sendError}>{sendError}</p> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
