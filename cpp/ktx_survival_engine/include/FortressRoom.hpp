#pragma once
#include <string>
#include <vector>

namespace Ktx {

struct TurretDevice {
    std::string name;
    int level;
    int damage;
    int ammoCost;
    bool autoAttack;
};

class FortressRoom {
public:
    FortressRoom();

    // Facility levels and stats
    int bedLevel = 1;
    int bedHourlyCoins = 40;

    int doorLevel = 1;
    std::string doorName = "Cửa Hợp Kim Nguyên Khối Cấp 1";
    int doorHp = 1500;
    int doorMaxHp = 1500;
    int doorDef = 80;

    TurretDevice turretLeft{"Hắc Thiết Liên Nỗ Tả", 1, 65, 5, true};
    TurretDevice turretRight{"Pháo Đài Kẻ Phân Tách Không Gian Hữu", 1, 150, 15, true};

    int waterFilterLevel = 2;
    int dailyWaterLiters = 18;

    int radioLevel = 1;
    float currentFreq = 107.5f;

    int guardianSpiritLevel = 3;
    std::string guardianSpiritName = "Quỷ Đồng Hộ Mệnh Thần Khám";

    // Operations
    bool upgradeBed(int& lordCoins);
    bool upgradeDoor(int& lordCoins);
    bool upgradeTurrets(int& lordCoins);
    bool upgradeWaterFilter(int& lordCoins);
    void repairDoor(int amount);

    int calculateHourlyCoinRate(int roommateBonusPct) const;
};

} // namespace Ktx
