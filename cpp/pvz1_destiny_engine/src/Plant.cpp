#include "../include/Plant.hpp"

namespace PvZ1 {

PlantRegistry::PlantRegistry() {
    registerAllPlants();
}

PlantRegistry& PlantRegistry::getInstance() {
    static PlantRegistry instance;
    return instance;
}

const PlantDefinition* PlantRegistry::getPlant(const std::string& id) const {
    auto it = m_plants.find(id);
    if (it != m_plants.end()) {
        return it->second.get();
    }
    return nullptr;
}

const std::unordered_map<std::string, std::shared_ptr<PlantDefinition>>& PlantRegistry::getAllPlants() const {
    return m_plants;
}

void PlantRegistry::registerAllPlants() {
    // 1. Sunflower
    m_plants["plant_sunflower"] = std::make_shared<PlantDefinition>(
        "plant_sunflower", "Hoa Hướng Dương", 50, 5.0f, 300, 0, 0.0f,
        "🌻", "Sản sinh 25 Mặt Trời định kỳ mỗi 6 giây.", "#f59e0b",
        ProjectileType::None, "Tạo tài nguyên cơ bản cho khu vườn",
        PlantCategory::Normal,
        PlantFoodUlt{"Bão Quang Năng", "Sản xuất tức thì 150 Mặt Trời rực rỡ", "☀️"}
    );

    // 2. Peashooter (Đậu Pháo)
    m_plants["plant_peashooter"] = std::make_shared<PlantDefinition>(
        "plant_peashooter", "Đậu Pháo", 100, 4.0f, 350, 30, 1.4f,
        "🌱", "Bắn đậu sát thương ổn định vào quái vật cùng hàng.", "#10b981",
        ProjectileType::Pea, "Vũ khí phòng thủ chủ lực của Tuyết Mộc",
        PlantCategory::Normal,
        PlantFoodUlt{"Súng Máy Bão Đạn", "Xả liên hoàn 60 viên đậu xuyên thấu hàng", "💥"}
    );

    // 3. Snow Pea (Đậu Băng)
    m_plants["plant_snow_pea"] = std::make_shared<PlantDefinition>(
        "plant_snow_pea", "Đậu Băng Giá", 175, 6.0f, 350, 30, 1.5f,
        "❄️", "Bắn đậu băng làm chậm 50% tốc độ di chuyển và tốc đánh của Zombie.", "#06b6d4",
        ProjectileType::IcePea, "Khắc chế zombie tốc độ và biến dị",
        PlantCategory::Normal,
        PlantFoodUlt{"Đóng Băng Tuyệt Đối", "Tạo con đường băng tuyết làm đông cứng kẻ địch", "🧊"}
    );

    // 4. Chomper (Hoa Ngoạm)
    m_plants["plant_chomper"] = std::make_shared<PlantDefinition>(
        "plant_chomper", "Hoa Ngoạm Tinh Hồn", 150, 7.5f, 500, 300, 5.0f,
        "🌺", "Nuốt chửng ngay lập tức quái thường và lưu trữ Tinh Hồn.", "#8b5cf6",
        ProjectileType::None, "Tiêu diệt nhanh quái giáp dày",
        PlantCategory::Normal,
        PlantFoodUlt{"Ngoạm Không Gian", "Nuốt 3 mục tiêu mạnh nhất trên sân", "👄"}
    );

    // 5. Cherry Bomb (Bom Anh Đào)
    m_plants["plant_cherry_bomb"] = std::make_shared<PlantDefinition>(
        "plant_cherry_bomb", "Bom Anh Đào", 150, 20.0f, 100, 1800, 0.0f,
        "🍒", "Nổ diện rộng 3x3 gây sát thương hủy diệt.", "#ef4444",
        ProjectileType::None, "Thẻ tiêu hao cứu nguy khẩn cấp",
        PlantCategory::InstantPi,
        PlantFoodUlt{"Hạt Nhân Anh Đào", "Vụ nổ kép thiêu rụi toàn màn hình", "🌋"}
    );

    // 6. Jalapeno (Ớt Lửa)
    m_plants["plant_jalapeno"] = std::make_shared<PlantDefinition>(
        "plant_jalapeno", "Ớt Lửa Cuồng Nộ", 125, 20.0f, 100, 1800, 0.0f,
        "🌶️", "Thiêu rụi toàn bộ một hàng đường thành tro bụi.", "#dc2626",
        ProjectileType::None, "Dọn sạch làn xe trượt và quái vật đông đúc",
        PlantCategory::InstantPi,
        PlantFoodUlt{"Biển Lửa Tận Thế", "Phun trào lửa địa ngục quét sạch hàng", "🔥"}
    );

    // 7. Magnet Shroom (Nấm Nam Châm)
    m_plants["plant_magnet_shroom"] = std::make_shared<PlantDefinition>(
        "plant_magnet_shroom", "Nấm Từ Lực", 100, 10.0f, 450, 15, 3.0f,
        "🧲", "Hút mũ sắt, xô kim loại và vô hiệu hóa súng đạn cơ giới của địch.", "#6366f1",
        ProjectileType::None, "Khắc chế zombie thiết giáp",
        PlantCategory::Normal,
        PlantFoodUlt{"Siêu Bão Từ", "Tước toàn bộ vũ khí kim loại của kẻ địch trên sân", "⚡"}
    );

    // 8. Zombie Wall (Thây Ma Cầm Xẻng / 40 Thây Ma)
    m_plants["plant_zombie_wall"] = std::make_shared<PlantDefinition>(
        "plant_zombie_wall", "Quân Đoàn Thây Ma Cầm Xẻng", 125, 8.0f, 1600, 45, 1.2f,
        "🧟‍♂️", "Triệu hồi Thây Ma mang xẻng đào đất do Tuyết Mộc thuần hóa chắn đòn và phản công.", "#14b8a6",
        ProjectileType::BonkPunch, "Binh đoàn cảm tử càn quét tận thế",
        PlantCategory::SummonZombie,
        PlantFoodUlt{"Quân Đoàn Đột Kích", "Triệu hồi thêm 3 Thây Ma Đội Trưởng giáp xương", "🛡️"}
    );

    // 9. Winter Melon (Dưa Hấu Băng)
    m_plants["plant_winter_melon"] = std::make_shared<PlantDefinition>(
        "plant_winter_melon", "Máy Bắn Dưa Hấu Băng", 300, 10.0f, 600, 180, 2.8f,
        "🍉", "Ném dưa băng nổ lan 3x3 gây sát thương cực lớn và làm chậm diện rộng.", "#0284c7",
        ProjectileType::MelonIce, "Hỏa lực pháo binh khống chế tối thượng",
        PlantCategory::Normal,
        PlantFoodUlt{"Mưa Bão Dưa Băng", "Nã 10 quả đại bác dưa băng xuống toàn chiến trường", "🌨️"}
    );

    // 10. Doom Shroom (Nấm Hủy Diệt)
    m_plants["plant_doom_shroom"] = std::make_shared<PlantDefinition>(
        "plant_doom_shroom", "Nấm Hạt Nhân Hủy Diệt", 250, 30.0f, 100, 3500, 0.0f,
        "🍄", "Vụ nổ nguyên tử hủy diệt mọi quái vật và để lại hố phóng xạ.", "#1e1b4b",
        ProjectileType::None, "Tuyệt chiêu kết liễu Zombie Sức Mạnh Cấp 3 và Vua Sư Tử",
        PlantCategory::InstantPi,
        PlantFoodUlt{"Tận Thế Diệt Tuyệt", "Nổ xóa sổ mọi kẻ địch", "☣️"}
    );
}

} // namespace PvZ1
