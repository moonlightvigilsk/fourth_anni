export type LetterReplyDialogue = {
  mood: "neutral" | "soft" | "serious" | "funny" | "mysterious" | "intimate";
  lines: string[];
};

export const letterReplyDialogues: Record<string, LetterReplyDialogue> = {
  kagura: {
    mood: "intimate",
    lines: [
      "Cậu để lại dấu sao cho tớ thật à? Cảm ơn cậu nhiều lắm.",
      "Biết tín hiệu này đã chạm tới cậu, tớ thấy yên tâm rồi.",
    ],
  },
  imed: {
    mood: "soft",
    lines: [
      "Ơ, cậu nhắn lại thật luôn à? Vậy là bức thư này đã hoàn thành nhiệm vụ rồi.",
      "Cảm ơn nha. Đọc được phản hồi thế này vui hơn cả lúc fix xong bug khó.",
    ],
  },
  "an-chi": {
    mood: "mysterious",
    lines: [
      "Tớ đã đoán sẽ có một tín hiệu quay về, chỉ không ngờ nó lại ấm đến vậy.",
      "Cảm ơn cậu vì đã để lại một dấu sao ở đây.",
    ],
  },
  "lil-wayne": {
    mood: "funny",
    lines: [
      "Ê, cậu còn nhắn lại cho tao nữa hả? Được đấy.",
      "Thôi được, tạm công nhận là cái thư này cũng có giá trị tình cảm.",
    ],
  },
  nova: {
    mood: "serious",
    lines: [
      "Phản hồi đã được ghi nhận. Đánh giá: rất ấm áp.",
      "Xác nhận kết nối hai chiều thành công. Tín hiệu ổn định.",
    ],
  },
  stone: {
    mood: "soft",
    lines: [
      "Tớ sẽ giữ lại khoảnh khắc này như một frame đẹp.",
      "Cảm ơn cậu vì đã để lại dấu sao của mình ở đây.",
    ],
  },
};
