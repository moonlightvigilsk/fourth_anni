/**
 * Member Quiz — Per-character quiz questions for the affinity system.
 * 5 questions per character = 35 total. All multiple choice.
 */
export type MemberQuizQuestion = {
  id: string;
  characterId: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export const memberQuizQuestions: MemberQuizQuestion[] = [
  // ─── Nhiên Anh (kagura) ────────────────────────────────
  {
    id: "mq_kagura_1",
    characterId: "kagura",
    question: "Nhiên Anh đảm nhận vai trò gì trong team?",
    options: ["Leader", "Coder", "Animator", "Writer"],
    answer: "Leader",
    explanation: "Nhiên Anh là leader dẫn dắt cả đội qua bốn năm hành trình.",
  },
  {
    id: "mq_kagura_2",
    characterId: "kagura",
    question: "Màu đại diện của Nhiên Anh trong web là gì?",
    options: ["Vàng kim", "Xanh dương", "Đỏ san hô", "Tím lavender"],
    answer: "Vàng kim",
    explanation: "Nhiên Anh sử dụng màu vàng kim (#D8B45C) — ấm áp như ánh trăng rằm.",
  },
  {
    id: "mq_kagura_3",
    characterId: "kagura",
    question: "Phong cách nói chuyện của Nhiên Anh trong web thiên về?",
    options: ["Thơ mộng, trữ tình", "Hài hước, châm biếm", "Nghiêm túc, logic", "Ngắn gọn, lạnh lùng"],
    answer: "Thơ mộng, trữ tình",
    explanation: "Với vai trò leader, Nhiên Anh thường nói chuyện bằng giọng điệu thơ mộng và ấm áp.",
  },
  {
    id: "mq_kagura_4",
    characterId: "kagura",
    question: "Nhiên Anh thường xuất hiện ở vị trí nào trong team gallery?",
    options: ["Leader card nổi bật", "Ở cuối danh sách", "Ẩn trong hidden panel", "Không xuất hiện"],
    answer: "Leader card nổi bật",
    explanation: "Là leader, Nhiên Anh có leader card đặc biệt trong Team Gallery.",
  },
  {
    id: "mq_kagura_5",
    characterId: "kagura",
    question: "Trong phần Team Letters, Nhiên Anh gửi lời chúc gì?",
    options: ["Chúc bình an và hạnh phúc", "Chúc nhiều tiền", "Chúc code không bug", "Chúc ngủ ngon"],
    answer: "Chúc bình an và hạnh phúc",
    explanation: "Nhiên Anh gửi lời chúc ấm áp về bình an và hạnh phúc cho hai nàng tinh linh.",
  },

  // ─── Demi (imed) ───────────────────────────────────────
  {
    id: "mq_imed_1",
    characterId: "imed",
    question: "Demi phụ trách những vai trò nào?",
    options: ["Coder / Sound / Writer", "Leader / Designer", "Animator / Editor", "Evaluator / Tester"],
    answer: "Coder / Sound / Writer",
    explanation: "Demi đảm nhiệm ba vai trò: lập trình, âm thanh và viết nội dung.",
  },
  {
    id: "mq_imed_2",
    characterId: "imed",
    question: "Màu đại diện của Demi là?",
    options: ["Xanh navy đậm", "Đỏ cam", "Xanh lá", "Vàng chanh"],
    answer: "Xanh navy đậm",
    explanation: "Demi sử dụng màu xanh navy đậm (#22314D) — trầm tĩnh như một dòng code.",
  },
  {
    id: "mq_imed_3",
    characterId: "imed",
    question: "Câu thoại nào phù hợp nhất với tính cách Demi?",
    options: ["Cậu đọc hết thoại luôn hả? Siêng năng quá vậy.", "GG, gg!", "Các vì sao đang thì thầm...", "Đánh giá: Tích cực."],
    answer: "Cậu đọc hết thoại luôn hả? Siêng năng quá vậy.",
    explanation: "Demi có tính cách phân tích nhưng ấm áp, thường nhận xét một cách nhẹ nhàng.",
  },
  {
    id: "mq_imed_4",
    characterId: "imed",
    question: "Trong lá thư team, Demi nói gì về việc code game?",
    options: ["Code mệt nhưng tha thứ vì là quà", "Code dễ lắm", "Không nhắc đến code", "Code xong rồi nghỉ"],
    answer: "Code mệt nhưng tha thứ vì là quà",
    explanation: "Demi thú nhận code game rất mệt nhưng vì đây là quà cho team nên chấp nhận.",
  },
  {
    id: "mq_imed_5",
    characterId: "imed",
    question: "Tính cách của Demi trong web được mô tả là?",
    options: ["Phân tích nhưng ấm áp", "Lạnh lùng khó gần", "Hài hước vô tư", "Bí ẩn huyền bí"],
    answer: "Phân tích nhưng ấm áp",
    explanation: "Demi có vẻ ngoài analytical nhưng bên trong rất warm và quan tâm mọi người.",
  },

  // ─── An Chi (an-chi) ───────────────────────────────────
  {
    id: "mq_anchi_1",
    characterId: "an-chi",
    question: "An Chi phụ trách vai trò gì?",
    options: ["Narrative / Tarot", "Coder / Sound", "Leader", "Animator"],
    answer: "Narrative / Tarot",
    explanation: "An Chi đảm nhiệm phần kịch bản/narrative và hệ thống tarot.",
  },
  {
    id: "mq_anchi_2",
    characterId: "an-chi",
    question: "Màu đại diện của An Chi là?",
    options: ["Xanh ngọc", "Tím hoa oải hương", "Đỏ cam", "Vàng kim"],
    answer: "Xanh ngọc",
    explanation: "An Chi sử dụng màu xanh ngọc (#72C6C8) — bí ẩn và thanh thoát.",
  },
  {
    id: "mq_anchi_3",
    characterId: "an-chi",
    question: "Phong cách nói chuyện của An Chi trong web là?",
    options: ["Huyền bí, liên quan đến sao và tarot", "Hài hước, gaming", "Nghiêm túc, đánh giá", "Ngắn gọn, ít nói"],
    answer: "Huyền bí, liên quan đến sao và tarot",
    explanation: "An Chi nói chuyện với giọng điệu mystical, thường nhắc đến sao và bói bài.",
  },
  {
    id: "mq_anchi_4",
    characterId: "an-chi",
    question: "An Chi nói gì khi thân thiết level 5?",
    options: [
      "Những vì sao đang nói rằng sự kết nối mạnh mẽ hơn bao giờ hết",
      "Cậu đã dành nhiều thời gian lắng nghe tớ",
      "Debug xong rồi!",
      "Tín hiệu ổn định",
    ],
    answer: "Cậu đã dành nhiều thời gian lắng nghe tớ",
    explanation: "Khi đạt level 5, An Chi bày tỏ sự vui mừng vì được lắng nghe.",
  },
  {
    id: "mq_anchi_5",
    characterId: "an-chi",
    question: "Trong lá thư, An Chi nhắc đến điều gì?",
    options: ["Tín hiệu không ồn ào nhưng sáng mãi", "Code game mệt lắm", "Bớt tấu hài nhạt", "Nhớ giữ gìn sức khỏe"],
    answer: "Tín hiệu không ồn ào nhưng sáng mãi",
    explanation: "An Chi viết thư với phong cách thơ mộng, nói về những tín hiệu lặng lẽ nhưng bền bỉ.",
  },

  // ─── Lil' Wayne (lil-wayne) ────────────────────────────
  {
    id: "mq_lilwayne_1",
    characterId: "lil-wayne",
    question: "Lil' Wayne phụ trách vai trò gì?",
    options: ["Coder / Writer", "Leader", "Animator", "Evaluator"],
    answer: "Coder / Writer",
    explanation: "Lil' Wayne đảm nhiệm code và viết nội dung cho project.",
  },
  {
    id: "mq_lilwayne_2",
    characterId: "lil-wayne",
    question: "Màu đại diện của Lil' Wayne là?",
    options: ["Xám xanh nhẹ", "Đỏ tươi", "Vàng kim", "Xanh ngọc"],
    answer: "Xám xanh nhẹ",
    explanation: "Lil' Wayne sử dụng màu xám xanh (#7C8798) — cool và bình thản.",
  },
  {
    id: "mq_lilwayne_3",
    characterId: "lil-wayne",
    question: "Tính cách nổi bật của Lil' Wayne trong web?",
    options: ["Hài hước, hay nhắc đến game", "Trầm tĩnh, ít nói", "Bí ẩn, thơ mộng", "Nghiêm túc, chỉn chu"],
    answer: "Hài hước, hay nhắc đến game",
    explanation: "Lil' Wayne luôn hài hước và hay dùng gaming references trong đối thoại.",
  },
  {
    id: "mq_lilwayne_4",
    characterId: "lil-wayne",
    question: "Trong lá thư team, Lil' Wayne mở đầu bằng gì?",
    options: ["Lô, làm bố thì không nói nhiều", "Gửi hai nàng tinh linh", "Có những tín hiệu...", "Hệ thống ghi nhận..."],
    answer: "Lô, làm bố thì không nói nhiều",
    explanation: "Đúng phong cách Lil' Wayne — ngắn gọn, hài hước và tự nhận là 'bố'.",
  },
  {
    id: "mq_lilwayne_5",
    characterId: "lil-wayne",
    question: "Lil' Wayne nói gì khi cậu đạt thân thiết level 5?",
    options: [
      "Ê, chơi game nhiều phết đấy. Nhớ giữ gìn sức khoẻ nhé!",
      "Cảm ơn cậu đã kiên nhẫn",
      "Tín hiệu ổn định",
      "Hành trình thật trọn vẹn",
    ],
    answer: "Ê, chơi game nhiều phết đấy. Nhớ giữ gìn sức khoẻ nhé!",
    explanation: "Lil' Wayne vẫn giữ phong cách hài hước ngay cả khi bày tỏ quan tâm.",
  },


  // ─── Ren Phạm (nova) ──────────────────────────────────
  {
    id: "mq_nova_1",
    characterId: "nova",
    question: "Ren Phạm đảm nhận vai trò gì?",
    options: ["Evaluator", "Coder", "Leader", "Animator"],
    answer: "Evaluator",
    explanation: "Ren Phạm là người đánh giá và kiểm soát chất lượng cho team.",
  },
  {
    id: "mq_nova_2",
    characterId: "nova",
    question: "Màu đại diện của Ren Phạm là?",
    options: ["Đỏ cam san hô", "Xanh navy", "Vàng kim", "Xanh lá sage"],
    answer: "Đỏ cam san hô",
    explanation: "Ren Phạm sử dụng màu đỏ cam san hô (#E58D7A) — nổi bật và chính xác.",
  },
  {
    id: "mq_nova_3",
    characterId: "nova",
    question: "Phong cách nói chuyện của Ren Phạm là?",
    options: ["Nghiêm túc, phân tích, giống hệ thống", "Hài hước, gaming", "Thơ mộng, trữ tình", "Bí ẩn, huyền bí"],
    answer: "Nghiêm túc, phân tích, giống hệ thống",
    explanation: "Ren Phạm nói chuyện bằng giọng điệu analytical, thường dùng từ ngữ hệ thống.",
  },
  {
    id: "mq_nova_4",
    characterId: "nova",
    question: "Trong lá thư team, Ren Phạm viết theo phong cách gì?",
    options: ["Báo cáo hệ thống", "Thơ tình cảm", "Hài hước châm biếm", "Thư tay cảm động"],
    answer: "Báo cáo hệ thống",
    explanation: "Ren Phạm viết thư như một system report — 'Hệ thống ghi nhận... Đánh giá: Rất tốt.'",
  },
  {
    id: "mq_nova_5",
    characterId: "nova",
    question: "Ren Phạm nói gì khi thân thiết level 5?",
    options: [
      "Tín hiệu ổn định. Có vẻ cậu không bỏ sót chi tiết nào.",
      "Hành trình thật trọn vẹn",
      "Cảm ơn cậu đã kiên nhẫn",
      "Cậu cày game trâu lắm",
    ],
    answer: "Tín hiệu ổn định. Có vẻ cậu không bỏ sót chi tiết nào.",
    explanation: "Ren Phạm đánh giá cậu bằng phong cách hệ thống đặc trưng.",
  },

  // ─── Akatsuki Đập đá (stone) ──────────────────────────
  {
    id: "mq_stone_1",
    characterId: "stone",
    question: "Akatsuki Đập đá phụ trách vai trò gì?",
    options: ["Animator", "Coder", "Leader", "Writer"],
    answer: "Animator",
    explanation: "Akatsuki Đập đá là animator chính, tạo ra các hiệu ứng chuyển động.",
  },
  {
    id: "mq_stone_2",
    characterId: "stone",
    question: "Màu đại diện của Akatsuki Đập đá là?",
    options: ["Tím lavender", "Xanh dương", "Đỏ tươi", "Vàng chanh"],
    answer: "Tím lavender",
    explanation: "Akatsuki Đập đá sử dụng màu tím lavender (#A892D6) — nghệ thuật và mơ mộng.",
  },
  {
    id: "mq_stone_3",
    characterId: "stone",
    question: "Tính cách của Akatsuki Đập đá trong web là?",
    options: ["Nghệ thuật, hay nói về hình ảnh và chuyển động", "Nghiêm túc, logic", "Hài hước, gaming", "Trầm lặng, ít nói"],
    answer: "Nghệ thuật, hay nói về hình ảnh và chuyển động",
    explanation: "Akatsuki Đập đá là một visual thinker, luôn liên tưởng mọi thứ với animation và hình ảnh.",
  },
  {
    id: "mq_stone_4",
    characterId: "stone",
    question: "Akatsuki Đập đá nói gì khi thân thiết level 5?",
    options: [
      "Cậu có thấy những chuyển động tớ tạo ra không? Nhìn cậu xem, thật kỹ tính.",
      "GG, cậu chơi game giỏi lắm",
      "Tín hiệu ổn định",
      "Các vì sao đang thì thầm",
    ],
    answer: "Cậu có thấy những chuyển động tớ tạo ra không? Nhìn cậu xem, thật kỹ tính.",
    explanation: "Akatsuki Đập đá vui khi có người chú ý đến các chi tiết animation mà mình tạo ra.",
  },
  {
    id: "mq_stone_5",
    characterId: "stone",
    question: "Trong lá thư team, Akatsuki Đập đá nhắc đến điều gì?",
    options: ["Hy vọng các vì sao mang lại ánh sáng", "Code game mệt lắm", "Bớt tấu hài nhạt", "Đánh giá: Rất tốt"],
    answer: "Hy vọng các vì sao mang lại ánh sáng",
    explanation: "Akatsuki Đập đá gửi lời chúc bằng hình ảnh thơ mộng về các vì sao và ánh sáng.",
  },
];
