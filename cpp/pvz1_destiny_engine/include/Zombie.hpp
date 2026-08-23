#pragma once
#include "Pvz1Types.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

namespace PvZ1 {

class ZombieDefinition {
public:
    std::string id;
    std::string name;
    std::string title;
    int bodyHp;
    int helmHp;
    HelmType helmType;
    int shieldHp;
    ShieldType shieldType;
    int maxHp;
    float speed;
    int attackDmg;
    float attackIntervalSec;
    std::string icon;
    int rewardSun;
    int rewardEnergy;
    int rewardBeastCore;
    std::string description;
    bool isBoss;
    bool hasMetalArmor;

    ZombieDefinition(
        std::string id,
        std::string name,
        std::string title,
        int bodyHp,
        int helmHp,
        HelmType helmType,
        int shieldHp,
        ShieldType shieldType,
        float speed,
        int attackDmg,
        float attackIntervalSec,
        std::string icon,
        int rewardSun,
        int rewardEnergy,
        int rewardBeastCore,
        std::string description,
        bool isBoss = false,
        bool hasMetalArmor = false
    ) : id(std::move(id)),
        name(std::move(name)),
        title(std::move(title)),
        bodyHp(bodyHp),
        helmHp(helmHp),
        helmType(helmType),
        shieldHp(shieldHp),
        shieldType(shieldType),
        maxHp(bodyHp + helmHp + shieldHp),
        speed(speed),
        attackDmg(attackDmg),
        attackIntervalSec(attackIntervalSec),
        icon(std::move(icon)),
        rewardSun(rewardSun),
        rewardEnergy(rewardEnergy),
        rewardBeastCore(rewardBeastCore),
        description(std::move(description)),
        isBoss(isBoss),
        hasMetalArmor(hasMetalArmor) {}
};

class ZombieRegistry {
public:
    static ZombieRegistry& getInstance();
    const ZombieDefinition* getZombie(const std::string& id) const;
    const std::unordered_map<std::string, std::shared_ptr<ZombieDefinition>>& getAllZombies() const;

private:
    ZombieRegistry();
    void registerAllZombies();
    std::unordered_map<std::string, std::shared_ptr<ZombieDefinition>> m_zombies;
};

} // namespace PvZ1
