import { PetAbility } from '../types';

export const PET_ABILITIES: PetAbility[] = [
  {
    id: 'pet_scent',
    name: 'Khứu Giác Linh Mẫn',
    minLevel: 1,
    icon: '👃',
    description: 'Đánh hơi từ xa các rương tài nguyên và rương ngọc quý ẩn giấu ven đường.',
    effectValue: '+100m tầm nhìn radar rương báu',
  },
  {
    id: 'pet_warning_bark',
    name: 'Tiếng Sủa Cảnh Báo Sớm',
    minLevel: 2,
    icon: '⚡',
    description: 'Tự động sủa inh ỏi báo động khi dã thú biến dị hoặc toán cướp có súng tiến lại gần xe.',
    effectValue: '+200m cảnh giới nguy hiểm',
  },
  {
    id: 'pet_sharp_fangs',
    name: 'Nanh Vuốt Sắc Bén',
    minLevel: 3,
    icon: '🦷',
    description: 'Nanh vuốt được tôi luyện sắc bén, lao vào cắn xé hỗ trợ chủ nhân trong giao tranh dã thú.',
    effectValue: '+25 Sát thương công kích',
  },
  {
    id: 'pet_iron_pelt',
    name: 'Da Đồng Xương Sắt',
    minLevel: 4,
    icon: '🛡️',
    description: 'Bộ lông dày dặn biến đổi cấu trúc, chống chịu va đập và giảm sát thương khi bị quái tấn công.',
    effectValue: '+60 Máu tối đa & +8 Giáp',
  },
  {
    id: 'pet_scavenger_fetch',
    name: 'Tự Động Nhặt Đồ (Loot Fetcher)',
    minLevel: 5,
    icon: '🎒',
    description: 'Chạy ra ngoài xe tha về các túi tài nguyên, gỗ vụn và tấm sắt nhỏ nhặt ven xa lộ.',
    effectValue: 'Tự động nhặt vật phẩm rơi gần xe',
  },
  {
    id: 'pet_warmth_guardian',
    name: 'Hơi Ấm Hộ Thể',
    minLevel: 7,
    icon: '🔥',
    description: 'Nằm cuộn tròn bên cạnh chủ nhân, tỏa nhiệt độ ấm áp chống lại cái lạnh thấu xương ban đêm.',
    effectValue: '+2.0°C thân nhiệt khi đêm lạnh',
  },
  {
    id: 'pet_golden_beast_awakening',
    name: 'Hóa Thân Chiến Khuyển Hoàng Kim',
    minLevel: 10,
    icon: '👑',
    description: 'Thức tỉnh huyết mạch thần thú thượng cổ. Toàn thân phát sáng ánh hoàng kim chói lọi.',
    effectValue: '+100% Sát thương, 100% Bạo kích & Hồi 15 HP/phút cho chủ nhân',
  },
];

// Feeding EXP and Stat bonuses per food type
export interface FoodFeedInfo {
  exp: number;
  hunger: number;
  hp: number;
  specialText?: string;
}

export function getFoodFeedBonus(itemId: string, itemName: string): FoodFeedInfo {
  const lower = itemName.toLowerCase();
  const idLower = itemId.toLowerCase();

  if (lower.includes('hổ') || lower.includes('sư tử') || lower.includes('thần thú') || lower.includes('tinh hoa')) {
    return { exp: 120, hunger: 50, hp: 80, specialText: '⭐ Thức ăn thượng phẩm: +120 EXP!' };
  }
  if (lower.includes('thịt nướng') || lower.includes('bò') || lower.includes('thịt lợn rừng') || lower.includes('thịt sói')) {
    return { exp: 65, hunger: 45, hp: 50, specialText: '🥩 Thịt dã thú giàu đạm: +65 EXP!' };
  }
  if (lower.includes('thịt') || lower.includes('cá') || lower.includes('xúc xích')) {
    return { exp: 40, hunger: 35, hp: 30, specialText: '🍖 Thịt tươi ngon: +40 EXP!' };
  }
  if (lower.includes('bánh mì') || lower.includes('lương khô') || lower.includes('nước') || lower.includes('mì')) {
    return { exp: 25, hunger: 25, hp: 20, specialText: '🍞 Lương thực sinh tồn: +25 EXP!' };
  }
  return { exp: 20, hunger: 20, hp: 15 };
}

// Calculate Pet EXP required for next level
export function getRequiredPetExp(level: number): number {
  return level * 100;
}
