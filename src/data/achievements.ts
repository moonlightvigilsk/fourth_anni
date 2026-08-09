export type Achievement = {
  id: string;
  title: string;
  description: string;
  tier: "main" | "puzzle" | "hidden";
  unlockedAt?: string;
};

export const achievements: Achievement[] = [
  {
    id: "journey_started",
    title: "Băng Đã Tải",
    description: "Cuộn băng kỷ niệm cuối cùng đã sẵn sàng để phát.",
    tier: "main",
  },
  {
    id: "tape_played",
    title: "Tín Hiệu Ghi Nhận",
    description: "Cuộn băng kỷ niệm bắt đầu vang lên tiếng rè rè nhẹ.",
    tier: "main",
  },
  {
    id: "warmup_complete",
    title: "Mắt Tinh Sẵn Sàng",
    description: "Thử thách khởi động đã hoàn tất, hành trình chính thức bắt đầu.",
    tier: "puzzle",
  },
  {
    id: "constellation_touched",
    title: "Tín Hiệu Bầu Trời",
    description: "Một ngôi sao ký ức đã đáp lại cái chạm của bạn.",
    tier: "main",
  },
  {
    id: "watcher",
    title: "Người Quan Sát",
    description: "Bạn đã quan sát đủ kỹ để tìm ra ghi chú ẩn.",
    tier: "hidden",
  },
  {
    id: "sky_key_albireo",
    title: "Ngôi Sao Đa Sắc",
    description: "Albireo đã hé lộ một ngôi sao ẩn cho món quà sau này.",
    tier: "hidden",
  },
  {
    id: "sky_key_echo",
    title: "Ngôi Sao Vọng Âm",
    description: "Epsilon Lyrae đã giấu một ngôi sao vọng âm trong bầu trời mùa hè.",
    tier: "hidden",
  },
  {
    id: "scrapbook_opened",
    title: "Những Trang Giấy Ổn Định",
    description: "Bốn chương ký ức nhiễu sóng nhẹ nhàng mở ra.",
    tier: "main",
  },
  {
    id: "scrapbook:year-01-complete",
    title: "Chương Một Đã Lật",
    description: "Những trang đầu tiên của cuốn Scrapbook đã được xem qua.",
    tier: "puzzle",
  },
  {
    id: "scrapbook:year-02-complete",
    title: "Chương Hai Đã Lật",
    description: "Tín hiệu ký ức thứ hai trong Scrapbook đã được nối lại.",
    tier: "puzzle",
  },
  {
    id: "scrapbook:year-03-complete",
    title: "Chương Ba Đã Lật",
    description: "Chương ký ức thứ ba đã nhường chỗ cho những trang cuối.",
    tier: "puzzle",
  },
  {
    id: "scrapbook:all-paperclips",
    title: "Gỡ Hết Kẹp Giấy",
    description: "Tất cả ghi chú được giữ dưới những chiếc kẹp giấy đã được tìm thấy.",
    tier: "hidden",
  },
  {
    id: "scrapbook:all-margin-notes",
    title: "Đọc Hết Lề Trang",
    description: "Mọi lời nhắn nhỏ bên lề Scrapbook đều đã được đọc.",
    tier: "hidden",
  },
  {
    id: "moon_phase_seen",
    title: "Pha Mặt Trăng",
    description: "Hai pha mặt trăng của ngày 20.08 đã được đặt cạnh nhau trước khi mở Scrapbook.",
    tier: "main",
  },
  {
    id: "vtuber_art_seen",
    title: "Khung Art Đã Sáng",
    description: "Art dành cho hai VTuber đã được đặt vào khoảng trời riêng.",
    tier: "main",
  },
  {
    id: "tarot_reading",
    title: "Trải Bài Tarot",
    description: "Ba lá bài ghi nhớ lại con đường đã qua.",
    tier: "main",
  },
  {
    id: "gift_drawn",
    title: "Tín Hiệu Quà Tặng",
    description: "Một món quà nhỏ vừa rơi ra từ cỗ máy ký ức.",
    tier: "main",
  },
  {
    id: "cipher_completed",
    title: "Mật Mã Đã Mở",
    description: "Tín hiệu bí mật đã được giải mã để mở đường đến những lời chúc.",
    tier: "main",
  },
  {
    id: "wishes_read",
    title: "Lời Chúc Đã Đến",
    description: "Những ánh sao từ fan đã được đọc và giữ lại trong hành trình.",
    tier: "main",
  },
  {
    id: "letters_read",
    title: "Thư Gửi Hai Cậu",
    description: "Những lá thư từ những người chuẩn bị món quà đã được mở.",
    tier: "main",
  },
  {
    id: "team_gallery_seen",
    title: "Khung Ảnh Đã Ghim",
    description: "Những người gửi tín hiệu đã được đặt vào cùng một khung ảnh trước hồi kết.",
    tier: "main",
  },
  {
    id: "secret_gift_opened",
    title: "Hộp Quà Bí Mật",
    description: "Bảng mật mã đã mở ra khe quà tặng bí ẩn của cỗ máy.",
    tier: "hidden",
  },
  {
    id: "finale_reached",
    title: "Đến Hồi Kết",
    description: "Bầu trời lại bừng sáng cho năm thứ tư.",
    tier: "main",
  },
  {
    id: "all_stars_remembered",
    title: "All Stars Remembered",
    description: "Mỗi vì sao trên bầu trời 20.08 đều mang một ý nghĩa riêng biệt. Dù là điểm sáng mờ ảo ở rìa trời hay rực rỡ tại trung tâm, tất cả đều góp phần tạo nên bức tranh thiên văn trọn vẹn.",
    tier: "hidden",
  },
  {
    id: "comet_caught",
    title: "Sao Chổi May Mắn",
    description: "Bạn đã bắt được một ngôi sao chổi băng qua hành trình. Nguyện ước sẽ thành hiện thực.",
    tier: "hidden",
  },
  // ─── Affinity Bond Achievements ───────────────────────────────────
  {
    id: "bond_5_kagura",
    title: "Ánh Trăng Rằm",
    description: "Đạt cấp thân thiết 5 với Nhiên Anh. Ánh sáng của người dẫn đường đã chiếu rọi hành trình.",
    tier: "hidden",
  },
  {
    id: "bond_5_imed",
    title: "Mã Nguồn Cảm Xúc",
    description: "Đạt cấp thân thiết 5 với Demi. Giữa những dòng code, có một nhịp đập ấm áp.",
    tier: "hidden",
  },
  {
    id: "bond_5_anchi",
    title: "Lá Bài Định Mệnh",
    description: "Đạt cấp thân thiết 5 với An Chi. Những vì sao đã sắp xếp để hai người gặp nhau.",
    tier: "hidden",
  },
  {
    id: "bond_5_lilwayne",
    title: "Debug Tình Bạn",
    description: "Đạt cấp thân thiết 5 với Lil' Wayne. Không có bug nào phá vỡ được kết nối này.",
    tier: "hidden",
  },
  {
    id: "bond_5_nova",
    title: "Tín Hiệu Hoàn Hảo",
    description: "Đạt cấp thân thiết 5 với Ren Phạm. Mọi tín hiệu đều được đánh giá ở mức cao nhất.",
    tier: "hidden",
  },
  {
    id: "bond_5_stone",
    title: "Hoạt Hình Trái Tim",
    description: "Đạt cấp thân thiết 5 với Akatsuki Đập đá. Từng khung hình đều có hơi thở của tình bạn.",
    tier: "hidden",
  },
  {
    id: "bond_10_kagura",
    title: "Ngôi Sao Dẫn Lối",
    description: "Đạt cấp thân thiết tối đa với Nhiên Anh. Cậu là người mà leader tin tưởng nhất.",
    tier: "hidden",
  },
  {
    id: "bond_max_all",
    title: "Trọn Vẹn Tinh Tú",
    description: "Đạt cấp thân thiết tối đa với tất cả thành viên. Bầu trời đã trọn vẹn.",
    tier: "hidden",
  },
  {
    id: "first_gift",
    title: "Quà Tặng Đầu Tiên",
    description: "Tặng quà lần đầu cho một thành viên. Một cử chỉ nhỏ, một ký ức lớn.",
    tier: "hidden",
  },
];
