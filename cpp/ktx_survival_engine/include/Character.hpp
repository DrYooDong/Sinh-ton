#pragma once
#include "KtxTypes.hpp"
#include "Item.hpp"
#include "Skill.hpp"
#include <string>
#include <vector>
#include <memory>

namespace Ktx {

class Character {
public:
    Character(std::string name = "Tuyết Mộc");

    std::string name;
    int level = 1;
    int exp = 0;
    int maxExp = 100;

    int hp = 1200;
    int maxHp = 1200;
    int mp = 350;
    int maxMp = 350;
    int stamina = 100;
    int maxStamina = 100;

    int hunger = 100; // 0-100
    int thirst = 100; // 0-100
    int sanity = 100; // 0-100

    // Core Attributes
    int str = 25; // Sức mạnh
    int agi = 25; // Nhanh nhẹn
    int vit = 25; // Thể lực
    int intel = 25; // Trí tuệ
    int lck = 25; // May mắn
    int unspentStatPoints = 10;

    // Lord Currency
    int lordCoins = 500;
    int mutationPoints = 50;
    int aggroScore = 10;
    int pioneerRankPoints = 1500;

    // Equipped Gear
    std::shared_ptr<Item> equippedWeapon;
    std::shared_ptr<Item> equippedArmor;

    // Inventory & Skills
    std::vector<Item> inventory;
    std::vector<std::string> learnedSkills;

    // Operations
    void addExp(int amount);
    void addLordCoins(int amount) { lordCoins += amount; }
    bool spendLordCoins(int amount);
    void addMutationPoints(int amount) { mutationPoints += amount; }
    bool spendMutationPoints(int amount);

    int calculateTotalAtk() const;
    int calculateTotalDef() const;
    int calculateCritRate() const;

    void allocateStat(const std::string& statName, int points = 1);
    void restAndGenerateCoins(int hours, int hourlyRate);
};

} // namespace Ktx
