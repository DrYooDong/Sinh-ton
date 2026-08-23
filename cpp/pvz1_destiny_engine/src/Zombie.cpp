#include "../include/Zombie.hpp"

namespace PvZ1 {

ZombieRegistry::ZombieRegistry() {
    registerAllZombies();
}

ZombieRegistry& ZombieRegistry::getInstance() {
    static ZombieRegistry instance;
    return instance;
}

const ZombieDefinition* ZombieRegistry::getZombie(const std::string& id) const {
    auto it = m_zombies.find(id);
    if (it != m_zombies.end()) {
        return it->second.get();
    }
    return nullptr;
}

const std::unordered_map<std::string, std::shared_ptr<ZombieDefinition>>& ZombieRegistry::getAllZombies() const {
    return m_zombies;
}

void ZombieRegistry::registerAllZombies() {
    // 1. Zombie Normal
    m_zombies["zombie_normal"] = std::make_shared<ZombieDefinition>(
        "zombie_normal", "Zombie Thường", "Thây Ma Đường Phố",
        270, 0, HelmType::None, 0, ShieldType::None,
        0.28f, 20, 1.0f, "🧟",
        15, 1, 0, "Zombie cơ bản xuất hiện trên đường phố sau khi hết thời gian dừng thời gian tân thủ."
    );

    // 2. Zombie Buckethead
    m_zombies["zombie_bucket"] = std::make_shared<ZombieDefinition>(
        "zombie_bucket", "Zombie Đầu Thùng Sắt", "Thây Ma Thiết Giáp",
        270, 1100, HelmType::Bucket, 0, ShieldType::None,
        0.26f, 25, 1.0f, "🪣",
        35, 3, 1, "Đội thùng sắt chịu đạn siêu trâu, có thể bị Nấm Nam Châm hút bay nón.",
        false, true
    );

    // 3. Zombie Armored Spore
    m_zombies["zombie_armored_spore"] = std::make_shared<ZombieDefinition>(
        "zombie_armored_spore", "Zombie Bào Tử Giáp Vảy", "Biến Dị Tiến Hóa Cấp 2",
        600, 800, HelmType::SporeScale, 0, ShieldType::None,
        0.35f, 35, 0.9f, "🛡️",
        45, 5, 3, "Tiến hóa sinh ra lớp vảy sừng kháng đạn đậu pháo do Tuyết Mộc lạm dụng đậu nhiều."
    );

    // 4. Zombie Strength Lv2 (Ga Tàu Điện Ngầm)
    m_zombies["zombie_strong_2"] = std::make_shared<ZombieDefinition>(
        "zombie_strong_2", "Zombie Sức Mạnh Cấp 2", "Hung Thần Tàu Điện Ngầm",
        1500, 500, HelmType::None, 0, ShieldType::None,
        0.20f, 60, 1.2f, "🦍",
        80, 10, 5, "Khổng lồ, dùng cả xác đồng loại làm vũ khí quật ngã cây trồng."
    );

    // 5. Boss Lion King (Vua Sư Tử & Zombie Cấp 3 Sân Vận Động)
    m_zombies["zombie_boss_lion_king"] = std::make_shared<ZombieDefinition>(
        "zombie_boss_lion_king", "Vua Sư Tử & Zombie Cấp 3", "Bá Chủ Đại Học Nông Nghiệp",
        4500, 2000, HelmType::Football, 1000, ShieldType::ScreenDoor,
        0.18f, 150, 1.5f, "🦁",
        500, 100, 20, "Trùm cuối sân vận động, cai trị hàng vạn zombie, chỉ bị tiêu diệt bởi Nấm Hạt Nhân và Đường Tướng Quân!",
        true, true
    );
}

} // namespace PvZ1
