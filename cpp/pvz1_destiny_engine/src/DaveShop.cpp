#include "../include/DaveShop.hpp"
#include <algorithm>

namespace PvZ1 {

DaveShop::DaveShop() {
    m_upgrades = {
        {"golden_shovel", "Xẻng Vàng Cường Hóa", "Tăng 50% tốc độ đào và thu hồi 50% Mặt Trời khi bứng cây", 20, 1, 5},
        {"golden_watering_can", "Bình Tưới Vàng Bất Tử", "Thanh tẩy virus và phục hồi 100% sinh lực toàn bộ cây trồng", 50, 1, 3},
        {"garden_expansion", "Mở Rộng Khu Đất Sân Vườn (+10m²)", "Tăng thêm diện tích trồng cây và chứa xác zombie tái chế", 100, 1, 10},
        {"shovel_corpse_brigade", "Mở Rộng Binh Đoàn 40 Thây Ma", "Tăng số lượng thây ma cầm xẻng có thể triệu hồi đồng thời", 80, 1, 8},
        {"gene_decoder", "Bộ Giải Mã Chuỗi Gen Virus Dave", "Phân tích điểm yếu quái vật, tăng 25% sát thương toàn quân", 150, 1, 5}
    };
}

bool DaveShop::buyUpgrade(const std::string& id, int& playerEnergy) {
    for (auto& up : m_upgrades) {
        if (up.id == id && up.level < up.maxLevel) {
            if (playerEnergy >= up.costEnergy) {
                playerEnergy -= up.costEnergy;
                up.level++;
                up.costEnergy = static_cast<int>(up.costEnergy * 1.6f);
                if (id == "shovel_corpse_brigade") {
                    expandShovelSquad();
                }
                return true;
            }
        }
    }
    return false;
}

void DaveShop::addBeastCores(int amount) {
    m_decryptionProgress = std::min(100.0f, m_decryptionProgress + (amount * 2.5f));
}

} // namespace PvZ1
