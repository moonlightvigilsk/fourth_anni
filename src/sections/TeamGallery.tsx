import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { guideList, guides } from "../data/guides";
import { pokeResponses } from "../data/pokeResponses";
import { SectionProps } from "./sectionTypes";

export const TeamGallery = ({
  state,
  setState,
  requestDialogue,
  markDialogueSeen,
  hasSeenDialogue,
  isActive,
  increaseAffinity,
}: SectionProps) => {
  const hasQueuedRef = useRef(false);
  const [pokedAnimation, setPokedAnimation] = useState<string | null>(null);
  const [failedPortraits, setFailedPortraits] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dialogueId = "dialogue:team-gallery:intro";
    if (!isActive || hasSeenDialogue(dialogueId) || hasQueuedRef.current) {
      return;
    }

    hasQueuedRef.current = true;
    markDialogueSeen(dialogueId);
    requestDialogue({
      speaker: guides.kagura,
      lines: [
        "Trước hồi kết, tụi tớ muốn gom những người đã chuẩn bị món quà này vào cùng một khung hình.",
        "Mỗi người góp một phần khác nhau, nhưng lời chúc gửi đến Linh Lan và Lan Linh là cùng một điều.",
      ],
      mood: "soft",
    });
    requestDialogue({
      speaker: guides.nova,
      lines: ["Đội hình đã đủ mặt. Món quà này có thể khép lại đẹp rồi."],
      mood: "soft",
    });
    requestDialogue({
      speaker: guides.imed,
      lines: ["Cuối cùng thì cũng được đứng cạnh nhau trong đúng một khung hình."],
      mood: "funny",
    });
    requestDialogue({
      speaker: guides.anChi,
      lines: ["Nếu muốn, hai cậu có thể chạm nhẹ vào từng người trước khi credit bắt đầu chạy."],
      mood: "intimate",
    });
  }, [hasSeenDialogue, isActive, markDialogueSeen, requestDialogue]);

  const handlePoke = useCallback(
    (memberId: string) => {
      if (state.pokedCharacters.includes(memberId)) {
        return;
      }

      const member = guideList.find((guide) => guide.id === memberId);
      if (!member) {
        return;
      }

      setState((prev) => ({
        ...prev,
        pokedCharacters: [...prev.pokedCharacters, memberId],
      }));

      increaseAffinity?.(memberId, 1);

      setPokedAnimation(memberId);
      window.setTimeout(() => setPokedAnimation(null), 600);

      const responses = pokeResponses[memberId] || ["..."];
      const randomLine = responses[Math.floor(Math.random() * responses.length)];

      requestDialogue({
        speaker: member,
        mood: "soft",
        lines: [randomLine],
      });
    },
    [increaseAffinity, requestDialogue, setState, state.pokedCharacters],
  );

  return (
    <div className="partStack teamGalleryStack">
      <section className="teamGalleryIntro">
        <h2>Chúng tớ là ai?</h2>
        <p>Mỗi người góp một phần khác nhau để món quà kỷ niệm này có thể sáng lên trọn vẹn.</p>
        <div className="teamGalleryProgress" aria-live="polite">
          <span>{state.pokedCharacters.length}/{guideList.length} tín hiệu đã nhận</span>
          <div aria-hidden="true">
            <i style={{ width: `${(state.pokedCharacters.length / guideList.length) * 100}%` }} />
          </div>
        </div>
      </section>

      <section className="teamPhotoWall" aria-label="Thành viên LL Team">
        {guideList.map((member) => {
          const isPoked = state.pokedCharacters.includes(member.id);
          const isAnimating = pokedAnimation === member.id;
          const portraitFailed = failedPortraits.has(member.id);

          return (
            <button
              className={`teamPhotoCard ${isPoked ? "isPoked" : ""} ${isAnimating ? "pokeAnimation" : ""}`}
              key={member.id}
              style={{ "--member-color": member.color } as CSSProperties}
              onClick={() => handlePoke(member.id)}
              type="button"
              aria-label={isPoked ? `Đã nhận tín hiệu từ ${member.name}` : `Nhận tín hiệu từ ${member.name}`}
            >
              <div className="teamPhotoFrame">
                {member.artSrc && !portraitFailed ? (
                  <img
                    src={member.artSrc}
                    alt=""
                    onError={() =>
                      setFailedPortraits((current) => {
                        const next = new Set(current);
                        next.add(member.id);
                        return next;
                      })
                    }
                  />
                ) : (
                  <div className="teamPhotoPlaceholder" aria-hidden="true">
                    <strong>{member.name.slice(0, 1)}</strong>
                    <span>{member.placeholderLabel}</span>
                  </div>
                )}
                <div className="teamPhotoShade" aria-hidden="true" />
              </div>
              <div className="teamPhotoInfo">
                <span>{member.id === "kagura" ? "✦ LEADER" : member.role}</span>
                <h3>{member.name}</h3>
                <small>{isPoked ? "Tín hiệu đã nhận ♥" : "Chạm để lắng nghe"}</small>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
};
