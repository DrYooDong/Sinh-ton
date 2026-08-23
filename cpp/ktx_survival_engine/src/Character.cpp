#include "../include/Character.hpp"
#include <iostream>
#include <algorithm>

namespace Ktx {

Character::Character(std::string name) : name(std::move(name)) {
    // Starter skills
    learnedSkills = {
        "skill_lord_fusion",
        "skill_silver_lightning",
        "skill_super_intuition",
        "skill_ghost_stun"
    };

    // Starter inventory
    inventory.push_back(*ItemRegistry::getInstance().getItem("item_mineral_water"));
    inventory.push_back(*ItemRegistry::getInstance().getItem("item_golden_serum"));

    // Equip Glock-17
    const Item* glock = ItemRegistry::getInstance().getItem("wpn_glock_lightning");
    if (glock) {
        equippedWeapon = std::make_shared<Item>(*glock);
    }
    const Item* jade = ItemRegistry::getInstance().getItem("arm_golden_jade");
    if (jade) {
        equippedArmor = std::make_shared<Item>(*jade);
    }
}

bool Character::spendLordCoins(int amount) {
    if (lordCoins >= amount) {
        lordCoins -= amount;
        return true;
    }
    return false;
}

bool Character::spendMutationPoints(int amount) {
    if (mutationPoints >= amount) {
        mutationPoints -= amount;
        return true;
    }
    return false;
}

void Character::addExp(int amount) {
    exp += amount;
    while (exp >= maxExp) {
        exp -= maxExp;
        level++;
        maxExp = static_cast<int>(maxExp * 1.6f);
        maxHp += 150;
        hp = maxHp;
        maxMp += 40;
        mp = maxMp;
        unspentStatPoints += 5;
        lordCoins += 100;
        std::cout << "🎉 [THĂNG CẤP!] Tuyết Mộc đạt Cấp " << level << "! Nhận +5 Điểm Thuộc Tính & +100 Tiền Chúa Tể 👑\n";
    }
}

int Character::calculateTotalAtk() const {
    int baseAtk = str * 4;
    if (equippedWeapon) {
        baseAtk += equippedWeapon->stats.atk + (equippedWeapon->enhanceLevel * 15);
    }
    return baseAtk;
}

int Character::calculateTotalDef() const {
    int baseDef = vit * 3;
    if (equippedArmor) {
        baseDef += equippedArmor->stats.def + (equippedArmor->enhanceLevel * 10);
    }
    return baseDef;
}

int Character::calculateCritRate() const {
    int baseCrit = agi / 2;
    if (equippedWeapon) {
        baseCrit += equippedWeapon->stats.critRate;
    }
    return std::min(80, baseCrit);
}

void Character::allocateStat(const std::string& statName, int points) {
    if (unspentStatPoints < points) return;
    unspentStatPoints -= points;

    if (statName == "str") str += points;
    else if (statName == "agi") agi += points;
    else if (statName == "vit") {
        vit += points;
        maxHp += points * 20;
        hp = maxHp;
    } else if (statName == "int") {
        intel += points;
        maxMp += points * 10;
        mp = maxMp;
    } else if (statName == "lck") lck += points;
}

void Character::restAndGenerateCoins(int hours, int hourlyRate) {
    int gained = hours * hourlyRate;
    lordCoins += gained;
    stamina = std::min(maxStamina, stamina + (hours * 20));
    hunger = std::max(0, hunger - (hours * 5));
    thirst = std::max(0, thirst - (hours * 8));
    sanity = std::min(100, sanity + (hours * 10));

    std::cout << "🛌 [NGHỈ NGƠI HOÀN TẤT] Sau " << hours << " giờ ngủ, căn phòng 200 đã sản sinh +" << gained << " Tiền Chúa Tể 👑!\n";
}

} // namespace Ktx
