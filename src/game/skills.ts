import { SurvivalSkillCategory, SurvivalSkillNode } from '../types';

export const SURVIVAL_SKILL_TREE: SurvivalSkillNode[] = [
  // ==========================================
  // BRANCH 1: SINH TỒN CĂN BẢN (SURVIVAL)
  // ==========================================
  {
    id: 'iron_stomach',
    name: 'Bao Tử Thép',
    category: 'survival',
    maxLevel: 3,
    costPerLevel: [4, 8, 15],
    icon: '🍖',
    description: 'Rèn luyện khả năng hấp thu năng lượng tối đa, giảm mạnh tốc độ tiêu hao độ no và độ khát.',
    effectDescription: (lvl) =>
      `Giảm ${lvl * 20}% tốc độ tụt thanh đói và khát trên đường cao tốc.`,
  },
  {
    id: 'expanded_pockets',
    name: 'Túi Đồ Sinh Tồn',
    category: 'survival',
    maxLevel: 3,
    costPerLevel: [5, 10, 18],
    icon: '🎒',
    description: 'Gia cố dây đai và các ngăn phụ kiện, giúp mang vác thêm nhiều đồ đạc và xếp chồng vật phẩm cao hơn.',
    effectDescription: (lvl) =>
      `Tăng giới hạn sức chứa túi đồ thêm +${lvl * 12} ô và tăng 50% giới hạn ngăn đồ.`,
    requiredParentId: 'iron_stomach',
    requiredParentLevel: 1,
  },
  {
    id: 'thermal_regulation',
    name: 'Điều Hòa Thân Nhiệt',
    category: 'survival',
    maxLevel: 3,
    costPerLevel: [6, 12, 20],
    icon: '🌡️',
    description: 'Thích nghi hoàn hảo với môi trường khắc nghiệt, chống chọi đợt nắng gắt 60°C và đêm băng giá sa mạc.',
    effectDescription: (lvl) =>
      `Giảm ${lvl * 30}% ảnh hưởng của nhiệt độ cực đoan và chống mất nước do sốc nhiệt.`,
    requiredParentId: 'iron_stomach',
    requiredParentLevel: 1,
  },
  {
    id: 'vitality_surge',
    name: 'Sinh Lực Bền Bỉ',
    category: 'survival',
    maxLevel: 3,
    costPerLevel: [8, 16, 28],
    icon: '💖',
    description: 'Tăng lượng sinh mệnh tối đa và kích hoạt khả năng tự chữa lành khi cơ thể được ăn uống no đủ.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 40} Máu tối đa (Max HP) và tự động hồi máu khi độ no > 70%.`,
    requiredParentId: 'expanded_pockets',
    requiredParentLevel: 2,
  },

  // ==========================================
  // BRANCH 2: CƠ KHÍ & XE RV (ENGINEERING)
  // ==========================================
  {
    id: 'fuel_optimizer',
    name: 'Tối Ưu Buồng Đốt',
    category: 'engineering',
    maxLevel: 3,
    costPerLevel: [5, 10, 18],
    icon: '⛽',
    description: 'Hiệu chỉnh kim phun xăng và hệ thống truyền động xe RV giúp tiết kiệm nhiên liệu tối đa.',
    effectDescription: (lvl) =>
      `Giảm ${lvl * 15}% lượng xăng tiêu thụ trên mỗi km di chuyển.`,
  },
  {
    id: 'heavy_ram_bumper',
    name: 'Cản Thép Húc Quái',
    category: 'engineering',
    maxLevel: 3,
    costPerLevel: [6, 12, 22],
    icon: '🛡️',
    description: 'Gia cố khung gầm và cản trước, biến chiếc xe thành cỗ máy càn quét các đàn thú trên xa lộ.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 40}% sát thương va chạm khi lái xe húc dã thú và giảm ${lvl * 30}% độ hao mòn xe.`,
    requiredParentId: 'fuel_optimizer',
    requiredParentLevel: 1,
  },
  {
    id: 'overcharged_headlights',
    name: 'Đèn Pha Cao Áp',
    category: 'engineering',
    maxLevel: 3,
    costPerLevel: [5, 10, 16],
    icon: '💡',
    description: 'Khuếch đại quang phổ đèn xe, làm mù dã thú săn đêm và phát hiện bẫy cướp từ xa.',
    effectDescription: (lvl) =>
      `Tăng tầm chiếu sáng đèn pha thêm +${lvl * 250}m và làm chậm dã thú săn đêm 30% khi bị rọi đèn.`,
    requiredParentId: 'fuel_optimizer',
    requiredParentLevel: 1,
  },
  {
    id: 'solar_recharger',
    name: 'Hấp Thu Năng Lượng',
    category: 'engineering',
    maxLevel: 3,
    costPerLevel: [8, 16, 26],
    icon: '☀️',
    description: 'Trang bị tế bào quang điện nóc xe, tự động làm mát khoang lái và sạc ắc quy ban ngày.',
    effectDescription: (lvl) =>
      `Tự động giảm nhiệt độ cabin xe -${lvl * 4}°C vào ban ngày và tăng 25% hiệu suất máy lọc nước.`,
    requiredParentId: 'heavy_ram_bumper',
    requiredParentLevel: 2,
  },

  // ==========================================
  // BRANCH 3: SĂN BẮN & CHIẾN ĐẤU (COMBAT)
  // ==========================================
  {
    id: 'beast_slayer',
    name: 'Thợ Săn Dã Thú',
    category: 'combat',
    maxLevel: 3,
    costPerLevel: [5, 10, 20],
    icon: '🏹',
    description: 'Nắm rõ yếu huyệt của các loài dã thú thường như Rắn, Sói, Báo, Trâu rừng sa mạc.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 25}% sát thương vũ khí lên tất cả dã thú sa mạc.`,
  },
  {
    id: 'night_hunter_bane',
    name: 'Trảm Hồn Đêm Tối',
    category: 'combat',
    maxLevel: 3,
    costPerLevel: [7, 14, 25],
    icon: '⚔️',
    description: 'Gia trì thần niệm vào đòn đánh, khắc chế dã thú săn đêm và quỷ hồn dị giới xuất hiện lúc nửa đêm.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 40}% sát thương lên Dã Thú Đêm, Quỷ Hồn và Cướp Xa Lộ.`,
    requiredParentId: 'beast_slayer',
    requiredParentLevel: 1,
  },
  {
    id: 'deadly_precision',
    name: 'Đòn Đánh Trọng Yếu',
    category: 'combat',
    maxLevel: 3,
    costPerLevel: [6, 12, 22],
    icon: '🎯',
    description: 'Tập trung cao độ nhắm vào tim hoặc đầu mục tiêu để tung ra đòn bạo kích gây sát thương chí mạng.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 15}% tỉ lệ Bạo Kích (Gây x2.5 sát thương và âm thanh nổ uy lực).`,
    requiredParentId: 'beast_slayer',
    requiredParentLevel: 1,
  },
  {
    id: 'quick_draw',
    name: 'Xạ Kích Thần Tốc',
    category: 'combat',
    maxLevel: 3,
    costPerLevel: [8, 16, 28],
    icon: '⚡',
    description: 'Rút ngắn thời gian nạp tên nỏ, lên đạn súng lục và tăng tốc độ vung đao cận chiến.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 25}% tốc độ bắn vũ khí tầm xa và tốc độ đánh cận chiến.`,
    requiredParentId: 'deadly_precision',
    requiredParentLevel: 2,
  },

  // ==========================================
  // BRANCH 4: THU THẬP & TRINH SÁT (SCAVENGING)
  // ==========================================
  {
    id: 'fortune_seeker',
    name: 'Vận May Thám Hiểm',
    category: 'scavenging',
    maxLevel: 3,
    costPerLevel: [5, 10, 18],
    icon: '💎',
    description: 'Trực giác nhạy bén giúp tìm thấy các rương chất lượng cao và tài nguyên quý hiếm hơn.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 25}% tỉ lệ mở ra Bản Thiết Kế hiếm, Đá Quý hoặc Xăng cao cấp từ rương tài nguyên.`,
  },
  {
    id: 'sharp_radar',
    name: 'Radar Định Vị Cao Cấp',
    category: 'scavenging',
    maxLevel: 3,
    costPerLevel: [5, 10, 16],
    icon: '📡',
    description: 'Nâng cấp phần mềm radar mini-map, hiển thị chính xác vị trí rương báu, trạm tiếp tế và quái thú.',
    effectDescription: (lvl) =>
      `Tăng bán kính quét Radar thêm +${lvl * 350}m và cảnh báo sớm các vùng hiểm họa xa lộ.`,
    requiredParentId: 'fortune_seeker',
    requiredParentLevel: 1,
  },
  {
    id: 'master_barterer',
    name: 'Mặc Cả Cao Tay',
    category: 'scavenging',
    maxLevel: 3,
    costPerLevel: [6, 12, 22],
    icon: '💰',
    description: 'Kỹ năng thương thuyết với các NPC trạm tiếp tế và thương nhân du mục trên sàn thế giới.',
    effectDescription: (lvl) =>
      `Giảm ${lvl * 15}% giá mua tại Trạm Tiếp Tế và tăng thêm +${lvl * 2} Huy Hiệu Dũng Khí từ nhiệm vụ.`,
    requiredParentId: 'fortune_seeker',
    requiredParentLevel: 1,
  },
  {
    id: 'butcher_master',
    name: 'Đồ Tể Lão Luyện',
    category: 'scavenging',
    maxLevel: 3,
    costPerLevel: [7, 14, 25],
    icon: '🥩',
    description: 'Kỹ thuật mổ xẻ hoàn hảo giúp thu hoạch triệt để thịt tươi, da lông và nguyên liệu quý từ xác quái.',
    effectDescription: (lvl) =>
      `Tăng +${lvl * 40}% lượng thịt và vật phẩm rơi ra khi thu hoạch xác dã thú.`,
    requiredParentId: 'master_barterer',
    requiredParentLevel: 2,
  },
];

export const SURVIVAL_SKILL_NODES = SURVIVAL_SKILL_TREE;

