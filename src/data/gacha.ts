export type GiftRarity = "common" | "rare" | "legendary";

export type Gift = {
  id: string;
  title: string;
  description: string;
  rarity: GiftRarity;
  weight: number;
  guideId?: string;
};

export const LEGENDARY_GUARANTEE_INTERVAL = 5;
export const LEGENDARY_GUARANTEE_LIMIT = 30;

export const GIFT_AFFINITY_GAIN: Record<GiftRarity, number> = {
  common: 3,
  rare: 5,
  legendary: 8,
};

export const gifts: Gift[] = [
  {
    id: "warm-evening",
    title: "Một buổi tối dịu sáng",
    description: "Một mảnh đêm giữ lại tiếng chào, tiếng cười và ánh sao còn vương trên màn hình.",
    rarity: "common",
    weight: 18,
  },
  {
    id: "laugh-track",
    title: "Tiếng cười giữ sóng",
    description: "Một dấu nhạc nhỏ nhắc rằng hôm ấy vui thật, kể cả khi tín hiệu hơi lag.",
    rarity: "common",
    weight: 18,
  },
  {
    id: "bright-frame",
    title: "Khung hình còn sáng",
    description: "Một khoảnh khắc đứng yên nhưng mỗi lần nhìn lại vẫn thấy hành trình đang chạy tiếp.",
    rarity: "common",
    weight: 16,
  },
  {
    id: "soft-pause",
    title: "Khoảng lặng mềm",
    description: "Một nhịp nghỉ nhỏ để nhớ rằng tỏa sáng không phải lúc nào cũng cần ồn ào.",
    rarity: "common",
    weight: 16,
  },
  {
    id: "unsent-line",
    title: "Một câu chưa nói",
    description: "Một lời cảm ơn được gấp lại đúng hôm nay để gửi đến Linh Lan và Lan Linh.",
    rarity: "common",
    weight: 15,
  },
  {
    id: "two-star-color",
    title: "Màu của hai vì sao",
    description: "Một mảng màu nhỏ từ những ngày hai cậu làm bầu trời này rực hơn.",
    rarity: "common",
    weight: 15,
  },
  {
    id: "chat-sticker",
    title: "Sticker nửa đêm",
    description: "Một chiếc sticker vừa hiện lên là cả phòng biết người gửi đang cười.",
    rarity: "common",
    weight: 14,
  },
  {
    id: "tiny-checkpoint",
    title: "Checkpoint nhỏ",
    description: "Một dấu mốc bé xíu cho ngày đã đi qua ổn hơn mong đợi.",
    rarity: "common",
    weight: 14,
  },
  {
    id: "saved-screenshot",
    title: "Ảnh chụp được giữ lại",
    description: "Không phải tấm nào cũng hoàn hảo, nhưng có tấm chỉ cần nhìn là nhớ được lúc đó mình đã vui.",
    rarity: "rare",
    weight: 8,
  },
  {
    id: "echo-playlist",
    title: "Playlist vọng âm",
    description: "Một danh sách bài hát gom những đoạn đường cũ, mở lên là bốn năm chậm rãi chạy lại.",
    rarity: "rare",
    weight: 8,
  },
  {
    id: "silver-ticket",
    title: "Vé bạc quay lại khoảnh khắc",
    description: "Một chiếc vé không đổi được thời gian, nhưng đổi được quyền ngồi xuống và nhớ thật lâu.",
    rarity: "rare",
    weight: 7,
  },
  {
    id: "night-signal",
    title: "Tín hiệu đêm khuya",
    description: "Một ánh sáng nhỏ vẫn nhấp nháy sau cùng, như có ai đó đang nói: tụi tớ vẫn ở đây.",
    rarity: "rare",
    weight: 7,
  },
  {
    id: "backstage-tape",
    title: "Cuộn băng hậu trường",
    description: "Một đoạn băng lưu lại những lần chỉnh sửa, thử lại và bật cười trước khi món quà sẵn sàng.",
    rarity: "rare",
    weight: 7,
  },
  {
    id: "team-postcard",
    title: "Postcard từ LL Team",
    description: "Một tấm postcard nhỏ có chữ ký của cả đội, gửi kèm lời nhắn: cảm ơn vì đã ở đây.",
    rarity: "rare",
    weight: 7,
  },
  {
    id: "nhien-anh-keepsake",
    title: "La bàn dịu sáng của Nhiên Anh",
    description: "Một chiếc la bàn nhỏ chỉ về nơi cả đội đã chọn ở lại để chuẩn bị món quà này.",
    rarity: "legendary",
    weight: 2,
    guideId: "kagura",
  },
  {
    id: "demi-keepsake",
    title: "Bản nháp giữ sóng của Demi",
    description: "Những dòng chữ được viết lại nhiều lần, cuối cùng giữ nguyên vì đủ thật để gửi đi.",
    rarity: "legendary",
    weight: 2,
    guideId: "imed",
  },
  {
    id: "lil-wayne-keepsake",
    title: "Nút turbo của Lil' Wayne",
    description: "Một nút bấm hơi ồn nhưng mỗi lần sáng lên là kéo hành trình chạy thêm một đoạn vui hơn.",
    rarity: "legendary",
    weight: 2,
    guideId: "lil-wayne",
  },
  {
    id: "ren-pham-keepsake",
    title: "Kính ngắm của Ren Phạm",
    description: "Một thấu kính nhìn thẳng vào phần còn lệch rồi chỉnh lại để món quà chạm đúng cảm xúc hơn.",
    rarity: "legendary",
    weight: 2,
    guideId: "nova",
  },
  {
    id: "akatsuki-keepsake",
    title: "Khung chuyển động của Akatsuki",
    description: "Một khung hình biết thở, giữ những chuyển động nhỏ để khi credit khép lại cảm xúc vẫn còn ngân.",
    rarity: "legendary",
    weight: 2,
    guideId: "stone",
  },
];

export const legendaryGifts = gifts.filter((gift) => gift.rarity === "legendary");
