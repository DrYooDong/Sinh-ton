#include "../include/Item.hpp"

namespace Ktx {

ItemRegistry::ItemRegistry() {
    initItems();
}

ItemRegistry& ItemRegistry::getInstance() {
    static ItemRegistry instance;
    return instance;
}

const Item* ItemRegistry::getItem(const std::string& id) const {
    auto it = m_items.find(id);
    if (it != m_items.end()) {
        return it->second.get();
    }
    return nullptr;
}

const std::unordered_map<std::string, std::shared_ptr<Item>>& ItemRegistry::getAllItems() const {
    return m_items;
}

void ItemRegistry::initItems() {
    // 1. Weapon: Ánh Bạc Lôi Đình (Glock-17 Cấp 3)
    ItemStats glockStats;
    glockStats.atk = 85;
    glockStats.critRate = 25;
    m_items["wpn_glock_lightning"] = std::make_shared<Item>(
        "wpn_glock_lightning", "Súng Lục Ánh Bạc Lôi Đình (Cấp 3)",
        "Cường hóa từ Glock-17 bằng Tiền Chúa Tể, phát ra điện tích bạc tự bẻ cong đường đạn.",
        ItemRarity::Epic, ItemCategory::Weapon, "🔫", 1, false, 800, glockStats
    );

    // 2. Weapon: Huyết Thệ Trảm Hồn Đao
    ItemStats daoStats;
    daoStats.atk = 180;
    daoStats.critRate = 35;
    daoStats.lifeSteal = 15;
    m_items["wpn_blood_blade"] = std::make_shared<Item>(
        "wpn_blood_blade", "Huyết Thệ Trảm Hồn Đao",
        "Thanh trường đao hợp kim phủ thi độc và minh hỏa, chém nát ma quỷ và hút máu đối phương.",
        ItemRarity::Legendary, ItemCategory::Weapon, "🗡️", 1, false, 2500, daoStats
    );

    // 3. Armor: Kim Tiêu Ngọc Y (Giáp Cấp 4)
    ItemStats giapStats;
    giapStats.def = 140;
    giapStats.hp = 600;
    m_items["arm_golden_jade"] = std::make_shared<Item>(
        "arm_golden_jade", "Kim Tiêu Ngọc Y (Giáp Cấp 4)",
        "Rơi ra từ Thi Khôi Tầng 10, đan từ sợi vàng và ngọc bích, giảm 40% sát thương nhận vào.",
        ItemRarity::Legendary, ItemCategory::Armor, "🥋", 1, false, 3000, giapStats
    );

    // 4. Consumable: Huyết Thanh Hoàng Kim
    ItemStats serumStats;
    serumStats.hp = 200;
    serumStats.mp = 100;
    m_items["item_golden_serum"] = std::make_shared<Item>(
        "item_golden_serum", "Huyết Thanh Cải Tạo Hoàng Kim",
        "Thuốc kích hoạt gen tối thượng, tăng vĩnh viễn +25 điểm cho toàn bộ thuộc tính cơ thể.",
        ItemRarity::Divine, ItemCategory::Consumable, "💉", 1, true, 5000, serumStats
    );

    // 5. Special: Thư Mời Minh Phủ
    m_items["item_underworld_invitation"] = std::make_shared<Item>(
        "item_underworld_invitation", "Thư Mời Minh Phủ (Tấm Thiệp Đen)",
        "Đạo cụ thần bí do Âm Sai trao tặng, mở cánh cổng dẫn vào phó bản Ký Túc Xá Bóng Tối.",
        ItemRarity::Divine, ItemCategory::Special, "📜", 1, false, 10000
    );

    // 6. Consumable: Nước Khoáng Bổ Thể Lực
    m_items["item_mineral_water"] = std::make_shared<Item>(
        "item_mineral_water", "Nước Tinh Khiết Nguyên Sinh (1L)",
        "Ngưng tụ từ Máy Lọc Nước Cấp 2, khôi phục 50 Thể Lực và 30 Độ Khát.",
        ItemRarity::Common, ItemCategory::Consumable, "💧", 5, true, 20
    );
}

} // namespace Ktx
