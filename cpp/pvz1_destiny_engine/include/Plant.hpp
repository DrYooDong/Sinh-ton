#pragma once
#include "Pvz1Types.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

namespace PvZ1 {

struct PlantFoodUlt {
    std::string name;
    std::string description;
    std::string icon;
};

class PlantDefinition {
public:
    std::string id;
    std::string name;
    int sunCost;
    float cooldownSec;
    int maxHp;
    int attackDmg;
    float attackIntervalSec;
    std::string icon;
    std::string description;
    std::string color;
    ProjectileType projType;
    std::string specialTrait;
    PlantCategory category;
    PlantFoodUlt ult;

    PlantDefinition(
        std::string id,
        std::string name,
        int sunCost,
        float cooldownSec,
        int maxHp,
        int attackDmg,
        float attackIntervalSec,
        std::string icon,
        std::string description,
        std::string color,
        ProjectileType projType,
        std::string specialTrait,
        PlantCategory category,
        PlantFoodUlt ult
    ) : id(std::move(id)),
        name(std::move(name)),
        sunCost(sunCost),
        cooldownSec(cooldownSec),
        maxHp(maxHp),
        attackDmg(attackDmg),
        attackIntervalSec(attackIntervalSec),
        icon(std::move(icon)),
        description(std::move(description)),
        color(std::move(color)),
        projType(projType),
        specialTrait(std::move(specialTrait)),
        category(category),
        ult(std::move(ult)) {}
};

class PlantRegistry {
public:
    static PlantRegistry& getInstance();
    const PlantDefinition* getPlant(const std::string& id) const;
    const std::unordered_map<std::string, std::shared_ptr<PlantDefinition>>& getAllPlants() const;

private:
    PlantRegistry();
    void registerAllPlants();
    std::unordered_map<std::string, std::shared_ptr<PlantDefinition>> m_plants;
};

} // namespace PvZ1
