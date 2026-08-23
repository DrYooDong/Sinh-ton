#include "../include/FortressRoom.hpp"
#include <algorithm>

namespace Ktx {

FortressRoom::FortressRoom() {
}

int FortressRoom::calculateHourlyCoinRate(int roommateBonusPct) const {
    int base = bedHourlyCoins;
    float mult = 1.0f + (roommateBonusPct / 100.0f);
    return static_cast<int>(base * mult);
}

bool FortressRoom::upgradeBed(int& lordCoins) {
    int cost = bedLevel * 100;
    if (lordCoins >= cost) {
        lordCoins -= cost;
        bedLevel++;
        bedHourlyCoins += 30;
        return true;
    }
    return false;
}

bool FortressRoom::upgradeDoor(int& lordCoins) {
    int cost = doorLevel * 150;
    if (lordCoins >= cost) {
        lordCoins -= cost;
        doorLevel++;
        doorMaxHp += 800;
        doorHp = doorMaxHp;
        doorDef += 40;
        doorName = "Cửa Siêu Hợp Kim Hộ Vệ Cấp " + std::to_string(doorLevel);
        return true;
    }
    return false;
}

bool FortressRoom::upgradeTurrets(int& lordCoins) {
    int cost = (turretLeft.level + turretRight.level) * 120;
    if (lordCoins >= cost) {
        lordCoins -= cost;
        turretLeft.level++;
        turretLeft.damage += 40;
        turretRight.level++;
        turretRight.damage += 80;
        return true;
    }
    return false;
}

bool FortressRoom::upgradeWaterFilter(int& lordCoins) {
    int cost = waterFilterLevel * 80;
    if (lordCoins >= cost) {
        lordCoins -= cost;
        waterFilterLevel++;
        dailyWaterLiters += 10;
        return true;
    }
    return false;
}

void FortressRoom::repairDoor(int amount) {
    doorHp = std::min(doorMaxHp, doorHp + amount);
}

} // namespace Ktx
