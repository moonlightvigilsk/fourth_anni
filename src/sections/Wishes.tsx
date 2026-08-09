import { useCallback, useEffect, useRef, useState } from "react";
import { SectionProps } from "./sectionTypes";
import styles from "./Wishes.module.css";
import { guideList, guides } from "../data/guides";
import { useModalA11y } from "../hooks/useModalA11y";

const wishesData = [
  { id: 1, icon: "🎂", author: "Fan giấu tên", content: "Chúc em sống thọ." },
  { id: 2, icon: "✨", author: "Fan giấu tên", content: "Chúc Linh Lan sinh nhật vui vẻ.\nMong bạn luôn xinh xắn, may mắn và ngày nào cũng ngập tràn tiếng cười." },
  { id: 3, icon: "🎉", author: "Fan giấu tên", content: "Chúc Lan Linh tuổi mới thật nhiều niềm vui.\nChúc Lan đạt được những điều mình mong muốn và luôn hạnh phúc." },
  { id: 4, icon: "💌", author: "Wibu cắt moi", content: "Hello đại ka của em,\nCũng đã lâu từ ngày chị debut rồi nhỉ, vẫn nhớ những buổi freetalk vui vẻ của chị, nhớ lắm những ngày chị chơi Bang Bang, nhớ khi handcam và nhiều stream khác. Từ ngày ra mắt gen 2.5 đến nay, em cảm thấy chị luôn là tấm gương sáng, một con người nghị lực.\nDo điều kiện không cho phép nên em không thể tặng quà sinh nhật cho chị và Lan, nhưng em hứa là sau khi ra trường, nếu có dịp gặp trực tiếp, em nhất định sẽ mang một chút tấm lòng nhỏ của mình đến." },
  { id: 5, icon: "🌹", author: "Linh1706", content: "Chúc Linh tuổi mới luôn tràn đầy năng lượng, lúc nào cũng cười tươi và đạt được mọi mục tiêu đề ra nha. Mong Linh và Lan mãi là cặp bài trùng xịn xò nhất." },
  { id: 6, icon: "🎮", author: "Fan giấu tên", content: "Dạo này em bận hơn nên không xem stream đều được nữa, nhưng vẫn chúc cậu tiếp tục gặt hái nhiều thành công trên con đường VTuber này nhé." },
  { id: 7, icon: "💛", author: "Fan giấu tên", content: "Sinh nhật vui vẻ nha Linh. Chúc Linh sẽ đạt được những mục tiêu mình mong muốn và luôn luôn được mọi người ủng hộ." },
  { id: 8, icon: "🌟", author: "Fan giấu tên", content: "Tuy chưa xem bạn nhiều nhưng chúc bạn sớm đạt được các mục tiêu của bản thân và luôn truyền những năng lượng tích cực đến người xem." },
  { id: 9, icon: "🫶", author: "Fan giấu tên", content: "Cảm ơn Linh vì đã mang đến thật nhiều tiếng cười, năng lượng dễ thương và những khoảnh khắc đáng nhớ cho các Kani nha." },
  { id: 10, icon: "🎁", author: "Fan giấu tên", content: "Happy Birthday Linh Lõm nhé." },
  { id: 11, icon: "💪", author: "Fan giấu tên", content: "Chúc mừng sinh nhật quý cô ngầu lòi, tuổi mới càng giỏi và càng kiếm được nhiều niềm vui hơn." },
  { id: 12, icon: "💖", author: "Fan giấu tên", content: "Gái iu sinh nhật vui vẻ, tuổi mới năng động hơn tuổi cũ nhé." },
  { id: 13, icon: "🐧", author: "Fan giấu tên", content: "Chúc Linh sinh nhật năm nay nhiều sức khỏe, ít bị cảm hơn nha. Nhớ chơi nhiều game hơn nữa để cho mấy con cua xem." },
  { id: 14, icon: "🎊", author: "Fan giấu tên", content: "Chúc chị sinh nhật thật vui vẻ, thuận lợi hơn trên con đường mình chọn, và thành công hơn với những gì mình mong muốn." },
  { id: 15, icon: "🌈", author: "Fan giấu tên", content: "Chúc Linh tuổi mới ngày càng đẹp, càng giải trí, càng vui vẻ và không quạo nữa nhé." },
  { id: 16, icon: "📝", author: "Fan giấu tên", content: "Dù không xem Linh nhiều nhưng lướt được vài short thấy giọng Linh khá thú vị. Chúc Linh sinh nhật vui vẻ." },
  { id: 17, icon: "🎂", author: "Fan giấu tên", content: "Sinh nhật vui vẻ nhen." },
  { id: 18, icon: "💛", author: "Demi", content: "Chúc Linh tuổi mới luôn xinh đẹp, bình an và gặt hái thật nhiều thành công." },
  { id: 19, icon: "🦀", author: "Fan giấu tên", content: "Chúc Linh một năm đầy vui vẻ, hạnh phúc và nhiều điều may mắn." },
  { id: 20, icon: "🌟", author: "Fan giấu tên", content: "Hi vọng đợt anniversary này Linh sẽ gặp nhiều thành công hơn, gặp được nhiều con cua lọt hố hơn và tiếp tục thống lĩnh cả đàn cua đông đảo trong tương lai." },
  { id: 21, icon: "💌", author: "cong95751", content: "Chúc bạn giữ gìn sức khỏe thật tốt, từ đó đạt được nhiều thành công trong công việc cũng như cuộc sống cá nhân và đặc biệt là phát triển mạnh mẽ hơn nữa tài năng ca hát." },
  { id: 22, icon: "💎", author: "Fan giấu tên", content: "Chúc Lan vui vẻ hạnh phúc." },
  { id: 23, icon: "🎉", author: "Fan giấu tên", content: "Chúc Lan luôn tràn đầy năng lượng, sáng tạo thật nhiều nội dung hay và tiếp tục mang lại niềm vui cho Nal mỗi ngày." },
  { id: 24, icon: "🎂", author: "Fan giấu tên", content: "Chúc em sống lâu." },
  { id: 25, icon: "🎵", author: "Wibu cắt moi", content: "Hi Lan,\nNhững buổi karaoke và freetalk của Lan luôn mang lại cảm giác rất chill, giúp mình có động lực để bước tiếp vào mỗi hôm sau.\nNhân dịp sinh nhật Lan và Linh, chúc hai chị em thật vui vẻ và mong Lan có thể live thêm nhiều buổi như thế nữa." },
  { id: 26, icon: "🌟", author: "Linh1706", content: "Chúc Lan tuổi mới ngày càng xinh đẹp, nữ tính, stream lúc nào cũng cháy và nhận được thật nhiều yêu thương từ mọi người." },
  { id: 27, icon: "🎈", author: "Fan giấu tên", content: "Dù giờ bận hơn trước nhưng vẫn chúc Lan tiếp tục cố gắng trên con đường VTuber này nhé." },
  { id: 28, icon: "🌷", author: "Fan giấu tên", content: "Theo dõi Lan cũng khá lâu rồi, dù chưa có điều kiện donate hay comment, mà stream vẫn xem đều đều. Chúc Lan với Linh tuổi mới vui vẻ, nhớ giữ gìn sức khỏe và tiếp tục lan truyền năng lượng tích cực." },
  { id: 29, icon: "👑", author: "Fan giấu tên", content: "Sinh nhật vui vẻ nhé công chúa." },
  { id: 30, icon: "🍀", author: "Fan giấu tên", content: "Chúc Lan sinh nhật vui vẻ, luôn xinh đẹp và làm việc gì cũng suôn sẻ." },
  { id: 31, icon: "🎤", author: "Fan giấu tên", content: "Chúc gái tuổi mới hát hay hơn tuổi cũ, khỏe mạnh hơn và vui vẻ hơn nha." },
  { id: 32, icon: "🐸", author: "Fan giấu tên", content: "Chúc Lan sinh nhật năm nay tràn đầy niềm vui, đỡ stress hơn năm trước và stream nhiều hơn cho các Nal xem." },
  { id: 33, icon: "💖", author: "Fan giấu tên", content: "Chúc chị có một buổi sinh nhật thật bùng nổ, vui vẻ và hạnh phúc. Nếu có lúc khó khăn thì vẫn mong chị cố lên nhé." },
  { id: 34, icon: "🎊", author: "Fan giấu tên", content: "Chúc Lan tuổi mới càng ngày càng xinh đẹp, hát hay, hài hước và giàu hơn nhé." },
  { id: 35, icon: "💎", author: "Fan giấu tên", content: "Chúc Lan sinh nhật vui vẻ, tuổi mới thành công và rực rỡ hơn nữa, có thêm nhiều content thú vị hơn." },
  { id: 36, icon: "🎂", author: "Fan giấu tên", content: "Sinh nhật vui vẻ nhen." },
  { id: 37, icon: "🫶", author: "Demi", content: "Chúc Lan tuổi mới thật nhiều sức khỏe, vui vẻ và stream nhiều hơn nha." },
  { id: 38, icon: "🍀", author: "Fan giấu tên", content: "Chúc Lan nhiều điều may mắn và niềm vui xảy đến." },
  { id: 39, icon: "🌸", author: "Fan giấu tên", content: "Dù bản thân mình gần như rất ít xem hay tương tác trên stream của Lan, mình vẫn hi vọng rằng quý cô đây sẽ gặp được nhiều thành công hơn trong tương lai." },
];

const reactionTypes = ["❤️", "✨", "🔥"];
const WISHES_AFFINITY_AMOUNT = 2;
const WISHES_AFFINITY_CAP = 8;

type AffinityFeedback = {
  id: number;
  wishId: number;
  message: string;
};

export const Wishes = ({
  state,
  setState,
  increaseAffinity,
  isActive,
  isCompleted,
  completePart,
  requestDialogue,
  hasSeenDialogue,
  markDialogueSeen,
}: SectionProps) => {
  const hasQueuedIntroRef = useRef(false);
  const wishModalRef = useRef<HTMLDivElement | null>(null);
  const affinityFeedbackTimeoutRef = useRef<number | null>(null);
  const grantedWishIdsRef = useRef(new Set(state.wishAffinityGrantedIds));
  const [activeTab, setActiveTab] = useState<"kani" | "nal">("kani");
  const [visibleKaniCount, setVisibleKaniCount] = useState(10);
  const [visibleNalCount, setVisibleNalCount] = useState(10);
  const [selectedWish, setSelectedWish] = useState<typeof wishesData[0] | null>(null);
  const [affinityFeedback, setAffinityFeedback] = useState<AffinityFeedback | null>(null);
  const [reactions, setReactions] = useState<Record<number, Record<string, number>>>({});
  const readWishIds = state.readWishIds;
  const wishAffinityGrantedIds = state.wishAffinityGrantedIds;

  const kaniWishes = wishesData.filter((wish) => wish.id <= 21);
  const nalWishes = wishesData.filter((wish) => wish.id > 21);

  const filteredWishes = activeTab === "kani" ? kaniWishes : nalWishes;
  const visibleCount = activeTab === "kani" ? visibleKaniCount : visibleNalCount;

  useEffect(() => {
    grantedWishIdsRef.current = new Set(wishAffinityGrantedIds);
  }, [wishAffinityGrantedIds]);

  useEffect(() => {
    return () => {
      if (affinityFeedbackTimeoutRef.current) {
        window.clearTimeout(affinityFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const dialogueId = "dialogue:wishes:intro";
    if (!isActive || hasSeenDialogue(dialogueId) || hasQueuedIntroRef.current) {
      return;
    }

    hasQueuedIntroRef.current = true;
    markDialogueSeen(dialogueId);

    requestDialogue({
      speaker: guides.kagura,
      lines: ["Ở đây là những lời chúc từ rất nhiều người đã nhớ đến hai cậu trong ngày đặc biệt này."],
      mood: "soft",
    });
    requestDialogue({
      speaker: guides.anChi,
      lines: ["Cứ chạm vào từng ngôi sao một chút thôi. Mỗi lời ở đây đều là thật."],
      mood: "soft",
    });
  }, [hasSeenDialogue, isActive, markDialogueSeen, requestDialogue]);

  const handleReadWish = (wish: (typeof wishesData)[0]) => {
    setSelectedWish(wish);
    if (!readWishIds.includes(wish.id)) {
      const newRead = Array.from(new Set([...readWishIds, wish.id]));
      setState((previous) => ({
        ...previous,
        readWishIds: Array.from(new Set([...previous.readWishIds, wish.id])),
      }));
      if (newRead.length >= 10 && !isCompleted) {
        setTimeout(() => {
          const cards = document.querySelectorAll(`.${styles.read}`);
          cards.forEach((card) => card.classList.add(styles.floatUpLight));

          requestDialogue({
            speaker: guides.anChi,
            lines: ["Mỗi lời chúc ở đây đều đã đến nơi rồi."],
            mood: "soft",
            onComplete: () => {
              completePart("wishes");
            },
          });
        }, 500);
      }
    }
  };

  const closeModal = useCallback(() => setSelectedWish(null), []);

  useModalA11y({
    isOpen: Boolean(selectedWish),
    onClose: closeModal,
    id: "wish-detail",
    containerRef: wishModalRef,
  });

  const loadMore = () => {
    if (activeTab === "kani") {
      setVisibleKaniCount(kaniWishes.length);
    } else {
      setVisibleNalCount(nalWishes.length);
    }
  };

  const showAffinityFeedback = useCallback((wishId: number, guideName: string) => {
    if (affinityFeedbackTimeoutRef.current) {
      window.clearTimeout(affinityFeedbackTimeoutRef.current);
    }

    const feedback = {
      id: Date.now(),
      wishId,
      message: `+${WISHES_AFFINITY_AMOUNT} thân thiết với ${guideName} 💫`,
    };

    setAffinityFeedback(feedback);
    affinityFeedbackTimeoutRef.current = window.setTimeout(() => {
      setAffinityFeedback((current) => (current?.id === feedback.id ? null : current));
    }, 2200);
  }, []);

  const grantWishAffinity = useCallback((wishId: number) => {
    if (!increaseAffinity) {
      return;
    }

    const grantedIds = grantedWishIdsRef.current;
    if (grantedIds.has(wishId) || grantedIds.size >= WISHES_AFFINITY_CAP) {
      return;
    }

    const guide = guideList[Math.floor(Math.random() * guideList.length)];
    if (!guide) {
      return;
    }

    const nextGrantedIds = new Set(grantedIds);
    nextGrantedIds.add(wishId);
    grantedWishIdsRef.current = nextGrantedIds;

    setState((previous) => {
      if (previous.wishAffinityGrantedIds.includes(wishId) || previous.wishAffinityGrantedIds.length >= WISHES_AFFINITY_CAP) {
        grantedWishIdsRef.current = new Set(previous.wishAffinityGrantedIds);
        return previous;
      }

      return {
        ...previous,
        wishAffinityGrantedIds: [...previous.wishAffinityGrantedIds, wishId],
      };
    });

    increaseAffinity(guide.id, WISHES_AFFINITY_AMOUNT);
    showAffinityFeedback(wishId, guide.name);
  }, [increaseAffinity, setState, showAffinityFeedback]);

  const handleReaction = (event: React.MouseEvent, wishId: number, type: string) => {
    event.stopPropagation();
    setReactions((previous) => {
      const currentCounts = previous[wishId] || {};
      const newCount = (currentCounts[type] || 0) + 1;
      return {
        ...previous,
        [wishId]: {
          ...currentCounts,
          [type]: newCount,
        },
      };
    });
    grantWishAffinity(wishId);
  };

  return (
    <div className={`${styles.wishesContainer} ${styles.royalPanel} ${activeTab === "kani" ? styles.activeKani : styles.activeNal}`}>
      <div className={styles.wishesContent} aria-hidden={selectedWish ? true : undefined}>
        <h2 className={styles.royalTitle}>LỜI CHÚC TỪ NHỮNG VÌ SAO</h2>
        <div className={styles.royalDivider} />

        <div className={styles.tabContainer}>
          <button
            type="button"
            className={`${styles.tabBtn} ${styles.tabKani} ${activeTab === "kani" ? styles.active : ""}`}
            onClick={() => setActiveTab("kani")}
          >
            Kani
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${styles.tabNal} ${activeTab === "nal" ? styles.active : ""}`}
            onClick={() => setActiveTab("nal")}
          >
            Nal
          </button>
        </div>

        <div className={styles.wishesGrid}>
          {filteredWishes.slice(0, visibleCount).map((wish) => (
            <article key={wish.id} className={`${styles.wishCard} ${readWishIds.includes(wish.id) ? styles.read : ""}`}>
              <button type="button" className={styles.wishOpenButton} onClick={() => handleReadWish(wish)}>
                <div className={styles.wishHead}>
                  <span className={styles.wishIcon}>{wish.icon}</span>
                  <span className={styles.wishAuthor}>{wish.author}</span>
                </div>
                <div className={styles.wishContent}>{wish.content}</div>
              </button>
              <div className={styles.reactionsContainer}>
                {reactionTypes.map((type) => {
                  const count = reactions[wish.id]?.[type] || 0;
                  return (
                    <button
                      type="button"
                      key={type}
                      className={styles.reactionBtn}
                      onClick={(event) => handleReaction(event, wish.id, type)}
                      aria-label={`Thả ${type} cho lời chúc này`}
                    >
                      {type} {count > 0 ? <span className={styles.reactionCount}>{count}</span> : null}
                    </button>
                  );
                })}
              </div>
              {affinityFeedback?.wishId === wish.id ? (
                <span key={affinityFeedback.id} className={styles.affinityFeedback} role="status">
                  {affinityFeedback.message}
                </span>
              ) : null}
            </article>
          ))}
        </div>

        {visibleCount < filteredWishes.length ? (
          <button className={styles.loadMoreBtn} onClick={loadMore} type="button">
            Xem thêm
          </button>
        ) : null}
      </div>

      {selectedWish ? (
        <div className={styles.modalOverlay} onMouseDown={closeModal}>
          <div
            ref={wishModalRef}
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wish-detail-title"
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className={styles.closeBtn} onClick={closeModal} aria-label="Đóng lời chúc">
              &times;
            </button>
            <div className={styles.modalHead}>
              <div className={styles.modalIcon}>{selectedWish.icon}</div>
              <div id="wish-detail-title" className={styles.modalAuthor}>
                {selectedWish.author}
              </div>
            </div>
            <div className={styles.modalText}>{selectedWish.content}</div>
            <div className={styles.modalReactions}>
              {reactionTypes.map((type) => {
                const count = reactions[selectedWish.id]?.[type] || 0;
                return (
                  <button
                    type="button"
                    key={type}
                    className={styles.reactionBtn}
                    onClick={(event) => handleReaction(event, selectedWish.id, type)}
                    aria-label={`Thả ${type} cho lời chúc này`}
                  >
                    {type} {count > 0 ? <span className={styles.reactionCount}>{count}</span> : null}
                  </button>
                );
              })}
            </div>
            {affinityFeedback?.wishId === selectedWish.id ? (
              <span key={affinityFeedback.id} className={`${styles.affinityFeedback} ${styles.modalAffinityFeedback}`} role="status">
                {affinityFeedback.message}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {isCompleted ? (
        <div className={styles.completedMessage} aria-hidden={selectedWish ? true : undefined}>
          Những lời chúc đã sáng lên đầy đủ. Hãy bước sang kỷ niệm tiếp theo.
        </div>
      ) : null}

      {!isCompleted ? (
        <div aria-hidden={selectedWish ? true : undefined} style={{ marginTop: "2rem", textAlign: "center", position: "relative", zIndex: 10 }}>
          <button
            className="primaryAction"
            type="button"
            onClick={() => completePart("wishes", { awardAchievement: readWishIds.length >= 10 })}
          >
            Tiếp tục hành trình
          </button>
        </div>
      ) : null}
    </div>
  );
};
