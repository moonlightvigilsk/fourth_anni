import { type FormEvent, useState } from "react";
import { guideList } from "../../data/guides";
import { useAllMessages } from "../../hooks/useMessages";
import styles from "./StarlogDrawer.module.css";

type StarlogReplyInboxProps = {
  onClose: () => void;
};

const INBOX_CODE = (import.meta.env.VITE_REPLY_INBOX_CODE ?? "echo").trim().toLowerCase();

const formatTimestamp = (timestamp: number) => {
  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
};

export const StarlogReplyInbox = ({ onClose }: StarlogReplyInboxProps) => {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [codeError, setCodeError] = useState("");
  const { messages, loading, error } = useAllMessages(unlocked);

  const unlockWithCode = () => {
    if (code.trim().toLowerCase() === INBOX_CODE) {
      setUnlocked(true);
      setCodeError("");
      return;
    }

    setCodeError("Mật hiệu chưa khớp.");
    setCode("");
  };

  const handleCodeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    unlockWithCode();
  };

  if (!unlocked) {
    return (
      <div className={styles.confirmOverlay} onMouseDown={onClose}>
        <form className={styles.inboxCodeDialog} onSubmit={handleCodeSubmit} onMouseDown={(event) => event.stopPropagation()}>
          <input
            className={styles.inboxCodeInput}
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                unlockWithCode();
              }
            }}
            aria-label="Mật hiệu mở hòm dấu sao"
            autoComplete="off"
            autoFocus
          />
          {codeError ? <p className={styles.inboxCodeError}>{codeError}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className={styles.confirmOverlay} onMouseDown={onClose}>
      <section className={styles.replyInboxDialog} aria-labelledby="starlog-reply-inbox-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className={styles.replyInboxHeader}>
          <div>
            <span>HÒM DẤU SAO GỬI LẠI</span>
            <h3 id="starlog-reply-inbox-title">Dấu sao gửi lại</h3>
          </div>
          <button className={styles.confirmCancelBtn} type="button" onClick={onClose}>
            Đóng
          </button>
        </header>

        {loading ? (
          <p className={styles.replyInboxEmpty}>Đang dò lại những dấu sao đã quay về...</p>
        ) : error ? (
          <p className={styles.replyInboxEmpty}>Không đọc được hòm dấu sao lúc này. Thử lại sau nhé ✦</p>
        ) : messages.length ? (
          <div className={styles.replyInboxList}>
            {messages.map((message, index) => {
              const guide = guideList.find((item) => item.id === message.memberId);
              const guideName = guide?.name ?? message.memberId;

              return (
                <article
                  key={`${message.memberId}-${message.id}`}
                  className={`${styles.replyInboxItem} ${styles.replyStarItem}`}
                  style={{ "--reply-color": guide?.color ?? "var(--gold)" } as React.CSSProperties}
                >
                  <div className={styles.replyStarMark} aria-hidden="true">
                    <span>✦</span>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                  </div>
                  <div className={styles.replyStarContent}>
                    <div className={styles.replyInboxMeta}>
                      <strong>{message.senderName}</strong>
                      <span>gửi cho {guideName}</span>
                      {message.timestamp ? <time>{formatTimestamp(message.timestamp)}</time> : null}
                    </div>
                    <p>{message.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className={styles.replyInboxEmpty}>Chưa có dấu sao nào quay về hòm lưu trữ này.</p>
        )}
      </section>
    </div>
  );
};
