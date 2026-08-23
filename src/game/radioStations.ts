import { RadioStation, RadioBroadcast } from '../types';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'highway_emergency',
    name: 'Đài Khẩn Cấp Xa Lộ Vô Tận',
    frequency: 104.5,
    category: 'emergency',
    icon: '📡',
    color: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
    description: 'Kênh thông tin khẩn cấp phát sóng toàn cầu. Cập nhật số người sống sót và quy luật sinh tồn.',
  },
  {
    id: 'weather_radar',
    name: 'Bản Tin Khí Tượng & Bão Cát',
    frequency: 98.2,
    category: 'weather',
    icon: '🌪️',
    color: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
    description: 'Radar vi ba đo nhiệt độ mặt đường, cảnh báo bão cát dị giới và đợt nắng nóng 65°C.',
  },
  {
    id: 'beast_lore',
    name: 'Thám Hiểm Dị Thú Sa Mạc',
    frequency: 88.7,
    category: 'beast',
    icon: '🐺',
    color: 'text-rose-400 border-rose-500/50 bg-rose-500/10',
    description: 'Hồ sơ nghiên cứu sinh vật biến dị: Bọ Cạp Sa Mạc, Tê Giác Thiết Giáp, Quái Đêm Dạ Ma.',
  },
  {
    id: 'distress_beacon',
    name: 'Tín Hiệu Cứu Hộ SOS',
    frequency: 107.9,
    category: 'distress',
    icon: '🚨',
    color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
    description: 'Tọa độ trạm tiếp tế bị bỏ hoang, nhật ký người đi trước và những rương kho báu chưa khai phá.',
  },
  {
    id: 'lofi_synth',
    name: 'FM Nhạc Lofi Xa Lộ Đêm',
    frequency: 92.4,
    category: 'music',
    icon: '📻',
    color: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    description: 'Bản ghi âm băng từ của kỷ nguyên văn minh cũ. Giúp xoa dịu tinh thần và giảm căng thẳng sau vô lăng.',
  },
];

// Procedural broadcast generator based on current game state
export function generateProceduralBroadcast(
  stationId: string,
  context: {
    mileage: number;
    stageName: string;
    temperature: number;
    hour: number;
    isNight: boolean;
    courageBadges: number;
  }
): RadioBroadcast {
  const timeStr = `${context.hour.toString().padStart(2, '0')}:00`;
  const km = Math.round(context.mileage);

  switch (stationId) {
    case 'highway_emergency': {
      const emergencyLogs = [
        {
          title: `[THÔNG CÁO KHẨN] Quy luật sinh tồn tại KM ${km + 5}`,
          speaker: 'Ban Điều Hành Xa Lộ Toàn Cầu',
          tag: 'QUY TẮC SỐNG CÒN',
          isImportant: true,
          content: `Toàn bộ người chơi chú ý! Tuyệt đối không dừng xe quá 15 phút tại lòng đường ban đêm. Nếu nhiệt độ trong cabin vượt quá 40°C, hãy kích hoạt ngay Điều Hòa hoặc uống Nước Muối Khoáng để tránh đột quỵ do nhiệt.`,
        },
        {
          title: `[TÌNH HÌNH TỔNG THỂ] Thống kê số lượng người còn sống sót`,
          speaker: 'Hệ Thống Giám Sát Trung Tâm',
          tag: 'THỐNG KÊ',
          content: `Sau nhiều đợt thử thách tại ${context.stageName}, chỉ còn khoảng 6.420 người chơi giữ vững tay lái. Những ai sở hữu Xe Nhà RV và Bàn Rèn Thần Cấp đang có tỷ lệ sinh tồn cao hơn 85%!`,
        },
        {
          title: `[CẢNH BÁO TRẠM TIẾP TẾ] Bí ẩn Trạm Dịch Phía Trước`,
          speaker: 'Đội Tuần Tra Xa Lộ',
          tag: 'TRẠM TIẾP TẾ',
          content: `Cách tọa độ hiện tại khoảng 15km có một Trạm Tiếp Tế tự động. Các kho nhiên liệu và quầy đổi đồ bằng Huy Hiệu Dũng Khí vẫn hoạt động tốt. Hãy ghé vào tiếp nhiên liệu trước khi bước vào sa mạc sâu.`,
        },
      ];
      const selected = emergencyLogs[Math.floor(Math.random() * emergencyLogs.length)];
      return {
        id: `bc_em_${Date.now()}`,
        stationId,
        title: selected.title,
        speaker: selected.speaker,
        content: selected.content,
        timestamp: timeStr,
        tag: selected.tag,
        isImportant: selected.isImportant,
      };
    }

    case 'weather_radar': {
      const weatherReports = [
        {
          title: `Dự báo nhiệt độ mặt đường: ${context.temperature + 4}°C`,
          speaker: 'Cục Khí Tượng Sa Mạc Dị Giới',
          tag: 'NHIỆT ĐỘ CỰC HẠN',
          content: `Cảnh báo nắng nóng gay gắt trên diện rộng! Bức xạ nhiệt mặt đường có thể gây nổ lốp đối với xe cấp thấp. Hãy trang bị Lốp Xe Cấp Cao và kiểm tra bồn nước làm mát động cơ thường xuyên.`,
        },
        {
          title: `[RADAR] Phát hiện bão cát dị từ trường di chuyển hướng Đông`,
          speaker: 'Trạm Quan Trắc Radar Vi Ba',
          tag: 'BÃO CÁT',
          isImportant: true,
          content: `Cơn bão cát mang theo mảnh vụn thiên thạch đang quét qua khu vực ${context.stageName}. Tầm nhìn giảm xuống dưới 50m. Khuyến cáo bật Đèn Pha [H] và giảm tốc độ dưới 40 km/h để tránh va quẹt.`,
        },
        {
          title: `[ĐÊM LẠNH] Chênh lệch nhiệt độ ngày và đêm`,
          speaker: 'Chuyên Viên Khí Hậu Dã Ngoại',
          tag: 'THỜI TIẾT ĐÊM',
          content: `Nhiệt độ dự kiến sẽ tụt dốc không phanh về đêm. Nếu không có đệm sưởi hoặc Chó Vàng ủ ấm, thân nhiệt người chơi có thể giảm sâu gây hôn mê lạnh.`,
        },
      ];
      const selected = weatherReports[Math.floor(Math.random() * weatherReports.length)];
      return {
        id: `bc_we_${Date.now()}`,
        stationId,
        title: selected.title,
        speaker: selected.speaker,
        content: selected.content,
        timestamp: timeStr,
        tag: selected.tag,
        isImportant: selected.isImportant,
      };
    }

    case 'beast_lore': {
      const beastGuides = [
        {
          title: `Hồ sơ Dã Thú: Tê Giác Thiết Giáp & Bọ Cạp Độc`,
          speaker: 'Thợ Săn Dã Sinh Tinh Anh',
          tag: 'BÁCH KHOA DÃ THÚ',
          content: `Tê Giác Thiết Giáp có lớp da dày tương đương thép cán nguội. Nếu không có Súng Bắn Đinh hoặc Nỏ Săn Thần Cấp, hãy tăng tốc xe van tông thẳng để làm choáng trước khi dứt điểm bằng đao kiếm!`,
        },
        {
          title: `Quái Đêm Dạ Ma (Night Stalker) và nỗi sợ Ánh Sáng`,
          speaker: 'Nhật Ký Thợ Săn Đêm',
          tag: 'DÃ THÚ ĐÊM',
          isImportant: true,
          content: `Dạ Ma chỉ xuất hiện khi trời tối hoàn toàn. Chúng di chuyển với tốc độ cực nhanh và tấn công kính chắn gió. Bật Đèn Pha Xe và dùng Thuốc Thất Tình Lục Dục có thể vô hiệu hóa chúng trong chớp mắt.`,
        },
        {
          title: `Cơ chế bảo vệ rương của Thú Chúa Sa Mạc`,
          speaker: 'Nhóm Thám Hiểm Rương Báu',
          tag: 'KHO BÁU',
          content: `Các rương cấp Rực Rỡ và Thần Cấp luôn được canh giữ bởi bầy thú đầu đàn. Tiêu diệt chúng sẽ nhận được lượng lớn Huy Hiệu Dũng Khí và Tinh Hoa Dã Thú để bồi bổ cho Chó Cưng!`,
        },
      ];
      const selected = beastGuides[Math.floor(Math.random() * beastGuides.length)];
      return {
        id: `bc_be_${Date.now()}`,
        stationId,
        title: selected.title,
        speaker: selected.speaker,
        content: selected.content,
        timestamp: timeStr,
        tag: selected.tag,
        isImportant: selected.isImportant,
      };
    }

    case 'distress_beacon': {
      const sosLogs = [
        {
          title: `[TỌA ĐỘ SOS] Tín hiệu cầu cứu từ đoàn xe thương nhân bị lật`,
          speaker: 'Tín Hiệu Radio Băng Tần 107.9',
          tag: 'TỌA ĐỘ KHO BÁU',
          isImportant: true,
          content: `...Rè... rè... "Chúng tôi bị bầy sói phục kích tại mốc Km ${km + 8}... ai đi ngang qua xin hãy lấy hòm dụng cụ và bản thiết kế trong cốp xe... đừng để rơi vào tay đám cướp đường..."`,
        },
        {
          title: `Nhật ký thất lạc của Người Tiên Phong #007`,
          speaker: 'Băng Từ Cứu Hộ Tự Động',
          tag: 'NHẬT KÝ',
          content: `"Nếu bạn nghe được đoạn ghi âm này, chứng tỏ bạn đã đi qua hơn 50km xa lộ. Hãy nhớ rằng, nâng cấp toàn bộ 8 bộ phận của xe để hợp nhất Lõi Xe Nhà RV là chìa khóa duy nhất để tới được Miền Đất Hứa."`,
        },
      ];
      const selected = sosLogs[Math.floor(Math.random() * sosLogs.length)];
      return {
        id: `bc_sos_${Date.now()}`,
        stationId,
        title: selected.title,
        speaker: selected.speaker,
        content: selected.content,
        timestamp: timeStr,
        tag: selected.tag,
        isImportant: selected.isImportant,
      };
    }

    case 'lofi_synth':
    default: {
      const musicTracks = [
        {
          title: `[GIAI ĐIỆU] "Đường Về Phía Chân Trời" - Lofi Synthwave 8-bit`,
          speaker: 'DJ Xa Lộ Vô Tận',
          tag: 'LOFI SYNTH',
          content: `Tiếng đàn synth ấm áp vang lên giữa hoang mạc tĩnh lặng. Hãy hít một hơi thật sâu, thưởng thức một tách nước mát từ máy lọc và tiếp tục chặng đường sinh tồn kiên cường phía trước.`,
        },
        {
          title: `[RADIO CHILL] Đêm Dưới Ánh Sao Băng Sa Mạc`,
          speaker: 'Đài Phát Thanh Hoài Niệm',
          tag: 'THƯ GIÃN',
          content: `Những nhịp beat thư thái giúp giảm căng thẳng tinh thần. Độ tỉnh táo của bạn đang dần hồi phục khi ngồi trong cabin xe nhà ấm cúng.`,
        },
      ];
      const selected = musicTracks[Math.floor(Math.random() * musicTracks.length)];
      return {
        id: `bc_lofi_${Date.now()}`,
        stationId,
        title: selected.title,
        speaker: selected.speaker,
        content: selected.content,
        timestamp: timeStr,
        tag: selected.tag,
      };
    }
  }
}
