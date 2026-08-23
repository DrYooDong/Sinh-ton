import { RandomEncounter } from '../types';

export const RANDOM_HIGHWAY_ENCOUNTERS: RandomEncounter[] = [
  // 1. Stranded Traveler
  {
    id: 'enc_stranded_traveler',
    title: 'Người Sống Sót Kêu Cứu Giữa Sa Mạc',
    subtitle: 'Km 18.4 • Xe bán tải hỏng lốp • Nhiệt độ 54°C',
    category: 'traveler',
    dangerLevel: 1,
    imageIcon: '🙋‍♂️',
    bgGradient: 'from-amber-950/80 via-zinc-900 to-black',
    narrative:
      'Dưới cái nắng thiêu đốt 54°C, một người đàn ông mặc áo khoác sờn rách đang ra sức vẫy một dải vải đỏ bên cạnh chiếc xe bán tải lủng cả 2 lốp sau. Bình nước của anh ta đã cạn khô và môi nứt nẻ vì mất nước nghiêm trọng.',
    choices: [
      {
        id: 'c_give_water',
        label: 'Tặng 1 Chai Nước Tinh Khiết 500ml',
        description: 'Cứu mạng người đàn ông. Đổi lại, anh ta sẽ tặng bạn một Bản Thiết Kế quý giá nhặt được.',
        icon: '💧',
        requiredItemId: 'purified_water_500ml',
        requiredItemName: 'Nước tinh khiết 500ml',
        requiredItemQty: 1,
        riskLevel: 'safe',
        action: 'give_item',
        outcome: {
          title: 'CẢM KÍCH CHÂN THÀNH!',
          description:
            'Người đàn ông uống cạn chai nước trong nước mắt cảm kích. Anh ta cúi đầu cảm ơn và trao cho bạn Bản Thiết Kế Nỏ Gia Cường cùng 6 Huy Hiệu Dũng Khí!',
          rewardBadges: 6,
          rewardBlueprintId: 'bp_reinforced_crossbow',
          rewardBlueprintName: 'Bản Thiết Kế: Nỏ Gia Cường',
          rewardItems: [{ itemId: 'iron_plate', name: 'Tấm sắt', quantity: 3, icon: '🛡️' }],
        },
      },
      {
        id: 'c_help_repair',
        label: 'Giúp Thay Lốp & Kéo Xe (Tiêu hao 1 Cao Su + 10L Xăng)',
        description: 'Giúp người sống sót tiếp tục hành trình đến Trạm Tiếp Tế kế tiếp.',
        icon: '🔧',
        requiredItemId: 'rubber',
        requiredItemName: 'Cao su',
        requiredItemQty: 1,
        riskLevel: 'safe',
        action: 'give_item',
        outcome: {
          title: 'TÌNH ĐỒNG ĐỘI XA LỘ!',
          description:
            'Cùng nhau thay lốp và nối dây cáp kéo xe thành công. Người đàn ông tặng bạn 1 Tinh Thể Không Gian và 10 Huy Hiệu Dũng Khí!',
          rewardBadges: 10,
          rewardItems: [
            { itemId: 'space_crystal', name: 'Tinh thể không gian', quantity: 1, icon: '🔮', rarity: 'epic' },
            { itemId: 'copper_plate', name: 'Tấm đồng', quantity: 2, icon: '🪙', rarity: 'superior' },
          ],
        },
      },
      {
        id: 'c_drive_past',
        label: 'Lạnh Lùng Nhấn Ga Đi Qua',
        description: 'Tài nguyên sa mạc quá khan hiếm, bạn không muốn mạo hiểm dừng lại.',
        icon: '🚗💨',
        riskLevel: 'safe',
        action: 'leave',
        outcome: {
          title: 'LƯỚT QUA AN TOÀN',
          description:
            'Bạn tiếp tục tăng tốc trên đường cao tốc, bảo toàn tuyệt đối toàn bộ nước và tài nguyên hiện có.',
        },
      },
    ],
  },

  // 2. Abandoned Military Armored Cache
  {
    id: 'enc_military_cache',
    title: 'Xe Thiết Giáp Quân Dụng Bị Lật Nghiêng',
    subtitle: 'Km 27.2 • Hầm hàng chống đạn còn khóa mã • Bụi phóng xạ nhẹ',
    category: 'cache',
    dangerLevel: 2,
    imageIcon: '🚚',
    bgGradient: 'from-emerald-950/80 via-zinc-900 to-black',
    narrative:
      'Một chiếc xe bọc thép 6 bánh của quân đoàn hộ tống nằm lật nghiêng bên taluy đường cao tốc. Lớp giáp dày chống đạn vẫn còn nguyên vẹn, và đèn báo màu xanh của hầm hàng quân sự vẫn nhấp nháy yếu ớt.',
    choices: [
      {
        id: 'c_pry_open',
        label: 'Dùng Kìm Cắt & Tấm Sắt Cạy Khóa Cơ Khí',
        description: 'Cẩn thận nạy chốt cửa an toàn mà không làm kích hoạt báo động.',
        icon: '🪛',
        requiredItemId: 'iron_plate',
        requiredItemName: 'Tấm sắt',
        requiredItemQty: 1,
        riskLevel: 'moderate',
        action: 'explore',
        outcome: {
          title: 'MỞ KHÓA KHO QUÂN SỰ THÀNH CÔNG!',
          description:
            'Cửa hầm hàng bật mở! Bên trong là 1 Hộp Đạn Xuyên Giáp AP, 15L Xăng Quân Sự và 8 Huy Hiệu Dũng Khí!',
          rewardBadges: 8,
          rewardFuel: 15,
          rewardItems: [
            { itemId: 'ammo_ap', name: 'Đạn Xuyên Giáp AP', quantity: 25, icon: '💥', rarity: 'superior' },
            { itemId: 'gunpowder', name: 'Thuốc súng tiêu chuẩn', quantity: 8, icon: '💣' },
          ],
        },
      },
      {
        id: 'c_blast_door',
        label: 'Dùng Súng Bắn Phá Ổ Khóa (Gây tiếng nổ lớn thu hút quái)',
        description: 'Bắn phá nhanh ổ khóa điện tử, nhưng tiếng nổ sẽ làm bạn bị thương nhẹ khi mảnh đạn văng.',
        icon: '💥',
        riskLevel: 'dangerous',
        action: 'fight',
        outcome: {
          title: 'PHÁ CỬA THU HOẠCH LỚN!',
          description:
            'Cửa hầm nổ tung! Bạn nhặt được Bản Thiết Kế Áo Chống Đạn Kevlar và 5 Tấm Đồng, chịu tổn thất 10 HP do mảnh vỡ.',
          damageHp: 10,
          rewardBadges: 12,
          rewardBlueprintId: 'bp_kevlar_vest',
          rewardBlueprintName: 'Bản Thiết Kế: Áo Giáp Kevlar',
          rewardItems: [
            { itemId: 'copper_plate', name: 'Tấm đồng', quantity: 4, icon: '🪙', rarity: 'superior' },
          ],
        },
      },
      {
        id: 'c_leave_cache',
        label: 'Rời Đi Để Tránh Bẫy Bom Tự Hủy',
        description: 'Xe quân sự thường cài mìn chống trộm, tốt nhất là không mạo hiểm.',
        icon: '⚠️',
        riskLevel: 'safe',
        action: 'leave',
        outcome: {
          title: 'TRÁNH XA NGUY HIỂM',
          description: 'Bạn giữ an toàn cho bản thân và chiếc xe, tiếp tục lăn bánh theo lộ trình.',
        },
      },
    ],
  },

  // 3. Highway Bandit Ambush
  {
    id: 'enc_bandit_ambush',
    title: 'Ổ Phục Kích Của Toán Cướp Xa Lộ',
    subtitle: 'Km 34.8 • Rào chắn đinh thép • 3 Tên cướp mang nỏ & mã tấu',
    category: 'bandits',
    dangerLevel: 4,
    imageIcon: '🥷',
    bgGradient: 'from-rose-950/80 via-zinc-900 to-black',
    narrative:
      'Phía trước đường xuất hiện rào chắn làm từ thân cây khô và đinh sắt. Ba tên cướp đeo mặt nạ xương thú nhảy ra từ bụi gai ven đường, chĩa nỏ tự chế vào kính xe đòi nộp 6 Huy Hiệu hoặc 20L Xăng làm lộ phí!',
    choices: [
      {
        id: 'c_ram_barricade',
        label: 'Đạp Hết Ga Tông Thẳng Vào Rào Chắn!',
        description: 'Tận dụng quán tính xe đâm xuyên qua hàng rào, húc bay bọn cướp cản đường!',
        icon: '🏎️💨',
        minVehicleSpeed: 50,
        riskLevel: 'moderate',
        action: 'ram_vehicle',
        outcome: {
          title: 'CÚ ĐÂM ĐỘT PHÁ NGOẠN MỤC!',
          description:
            'Chiếc xe gầm rú lao thẳng qua rào chắn gỗ! Bọn cướp hoảng loạn nhảy dạt sang hai bên, xe nhận 8 sát thương mòn vỏ nhưng cướp được 1 túi đồ rơi rớt chứa 12 Huy Hiệu Dũng Khí và 4 Tấm Sắt!',
          rewardBadges: 12,
          vehicleDurabilityDelta: -8,
          rewardItems: [
            { itemId: 'iron_plate', name: 'Tấm sắt', quantity: 4, icon: '🛡️' },
            { itemId: 'gunpowder', name: 'Thuốc súng', quantity: 6, icon: '💣' },
          ],
        },
      },
      {
        id: 'c_fight_bandits',
        label: 'Rút Súng Nổ Phát Đầu Tiên Tiêu Diệt Thủ Lĩnh',
        description: 'Đấu súng trực diện tiêu diệt toàn bộ băng cướp để đoạt sạch vũ khí.',
        icon: '🎯',
        riskLevel: 'dangerous',
        action: 'fight',
        outcome: {
          title: 'QUÉT SẠCH TOÁN CƯỚP ĐƯỜNG!',
          description:
            'Đòn phản công chính xác hạ gục tên đầu sỏ! Hai tên còn lại vứt vũ khí bỏ chạy. Bạn thu được Bản Thiết Kế Súng Lục Desert Eagle cùng 15 Huy Hiệu Dũng Khí!',
          rewardBadges: 15,
          rewardBlueprintId: 'bp_desert_eagle',
          rewardBlueprintName: 'Bản Thiết Kế: Súng Lục Desert Eagle',
          rewardItems: [
            { itemId: 'ammo_ap', name: 'Đạn AP', quantity: 30, icon: '💥', rarity: 'superior' },
            { itemId: 'space_crystal', name: 'Tinh thể không gian', quantity: 1, icon: '🔮', rarity: 'epic' },
          ],
        },
      },
      {
        id: 'c_pay_toll',
        label: 'Nộp Phí 5 Huy Hiệu Dũng Khí Đi Qua Hòa Bình',
        description: 'Không muốn làm tổn hại xe cộ và đổ máu.',
        icon: '🪙',
        requiredBadges: 5,
        riskLevel: 'safe',
        action: 'pay_badges',
        outcome: {
          title: 'QUA ĐƯỜNG BÌNH AN',
          description:
            'Bọn cướp nhận Huy Hiệu và mở đường cho bạn đi qua. Không có thương vong xảy ra.',
          rewardBadges: -5,
        },
      },
    ],
  },

  // 4. Mysterious Nomad Merchant
  {
    id: 'enc_nomad_merchant',
    title: 'Thương Nhân Du Mục Huyền Bí Cưỡi Cơ Giáp',
    subtitle: 'Km 42.1 • Cỗ xe lạc đà kim loại • Đèn lồng phát sáng',
    category: 'merchant',
    dangerLevel: 1,
    imageIcon: '🧙‍♂️',
    bgGradient: 'from-purple-950/80 via-zinc-900 to-black',
    narrative:
      'Một ông lão mang kính bảo hộ cổ điển đang dừng cỗ xe kéo lạc đà cơ khí bên cạnh biển báo km. Trên lưng xe chất đầy những chiếc hòm phát quang và các cuộn da dê chứa bí quyết sinh tồn cổ xưa.',
    choices: [
      {
        id: 'c_buy_secret_bp',
        label: 'Đổi 8 Huy Hiệu Mua Bản Thiết Kế Tủ Lạnh RV Mini',
        description: 'Mua bản thiết kế nâng cấp xe gia đình từ thương nhân du mục.',
        icon: '📜',
        requiredBadges: 8,
        riskLevel: 'safe',
        action: 'barter',
        outcome: {
          title: 'GIAO DỊCH THÀNH CÔNG VỚI THƯƠNG NHÂN!',
          description:
            'Ông lão vuốt râu hài lòng và trao cho bạn Bản Thiết Kế Tủ Lạnh Xe RV cùng 2 Khối Gỗ nhóm lửa!',
          rewardBadges: -8,
          rewardBlueprintId: 'bp_car_fridge',
          rewardBlueprintName: 'Bản Thiết Kế: Tủ Lạnh Xe RV',
          rewardItems: [
            { itemId: 'wood', name: 'Khối gỗ tiêu chuẩn', quantity: 4, icon: '🪵' },
            { itemId: 'rubber', name: 'Cao su', quantity: 3, icon: '⚫' },
          ],
        },
      },
      {
        id: 'c_learn_tips',
        label: 'Uống Trà Đàm Đạo Học Mẹo Chế Tạo (+300 EXP Bàn Rèn)',
        description: 'Trao đổi kinh nghiệm sinh tồn trên đường cao tốc với lão nhân du mục.',
        icon: '🍵',
        riskLevel: 'safe',
        action: 'explore',
        outcome: {
          title: 'LĨNH HỘI BÍ QUYẾT BÀN RÈN!',
          description:
            'Những lời khuyên về kết cấu hợp kim giúp bạn đột phá kỹ nghệ! Nhận ngay +300 EXP Bàn Rèn và 4 Huy Hiệu Dũng Khí!',
          rewardBadges: 4,
          craftExpReward: 300,
        },
      },
      {
        id: 'c_wave_goodbye',
        label: 'Cúi Đầu Chào Rồi Tiếp Tục Lên Đường',
        description: 'Gìn giữ sự tôn trọng với người bạn đồng hành hiếm hoi trên sa mạc.',
        icon: '👋',
        riskLevel: 'safe',
        action: 'leave',
        outcome: {
          title: 'LỜI CHÚC PHÚC CỦA LÃO NHÂN',
          description:
            'Ông lão vẫy tay chúc bạn vững tay lái trên đoạn đường bão cát phía trước!',
        },
      },
    ],
  },

  // 5. Miraculous Desert Oasis
  {
    id: 'enc_miraculous_oasis',
    title: 'Ốc Đảo Nước Ngọt Thần Kỳ Giữa Hoang Mạc',
    subtitle: 'Km 51.5 • Hồ nước xanh trong vắt • Rừng chà là râm mát',
    category: 'oasis',
    dangerLevel: 1,
    imageIcon: '🌴',
    bgGradient: 'from-cyan-950/80 via-zinc-900 to-black',
    narrative:
      'Một hồ nước ngầm mát lạnh bất ngờ hiện ra bên cạnh đường cao tốc, rợp bóng mát của những cây chà là trĩu quả. Hơi ẩm mát lành xua tan hoàn toàn cái nóng như thiêu đốt của trưa hè sa mạc.',
    choices: [
      {
        id: 'c_drink_rest',
        label: 'Uống Nước, Tắm Mát & Nghỉ Ngơi (Hồi Phục Toàn Diện)',
        description: 'Lấy lại 100% Máu, giải tỏa hoàn toàn độ khát và hạ thân nhiệt về mức hoàn hảo 37°C.',
        icon: '🏊‍♂️',
        riskLevel: 'safe',
        action: 'explore',
        outcome: {
          title: 'HỒI PHỤC HOÀN TOÀN THỂ LỰC!',
          description:
            'Dòng nước mát lành thẩm thấu khắp cơ thể! Bạn hồi phục đầy máu, thân nhiệt hạ mát và nhận thêm 5 chai Nước Tinh Khiết múc từ hồ!',
          rewardHp: 100,
          rewardItems: [
            { itemId: 'purified_water_500ml', name: 'Nước tinh khiết 500ml', quantity: 5, icon: '💧' },
            { itemId: 'bread', name: 'Bánh mì sinh tồn', quantity: 2, icon: '🍞' },
          ],
        },
      },
      {
        id: 'c_fill_rv_tank',
        label: 'Bơm Đầy Bình Nước Xe RV Nóc Xe',
        description: 'Dùng bơm múc đầy khoang nước sinh hoạt trên xe RV cho các chặng đường dài.',
        icon: '🚰',
        riskLevel: 'safe',
        action: 'explore',
        outcome: {
          title: 'KHOANG NƯỚC XE RV ĐÃ ĐẦY!',
          description:
            'Bình chứa nước trên nóc xe đã được nạp đầy 100%! Bạn còn nhặt được 2 Khối Gỗ và 5 Huy Hiệu Dũng Khí!',
          rewardBadges: 5,
          rewardItems: [
            { itemId: 'wood', name: 'Khối gỗ tiêu chuẩn', quantity: 5, icon: '🪵' },
            { itemId: 'purified_water_500ml', name: 'Nước tinh khiết', quantity: 3, icon: '💧' },
          ],
        },
      },
    ],
  },
];
