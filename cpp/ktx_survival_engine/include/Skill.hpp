#pragma once
#include "KtxTypes.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

namespace Ktx {

enum class SkillEffectType {
    Damage,
    Heal,
    Buff,
    Control,
    Extract,
    Shield,
    Passive
};

class Skill {
public:
    std::string id;
    std::string name;
    SkillTier tier;
    std::string description;
    std::string icon;
    int mpCost;
    int cooldownTurns;
    SkillEffectType effectType;
    int power; // Base dmg / heal / buff %
    int level;
    int maxLevel;
    std::string flavor;

    Skill(
        std::string id,
        std::string name,
        SkillTier tier,
        std::string description,
        std::string icon,
        int mpCost,
        int cooldownTurns,
        SkillEffectType effectType,
        int power,
        int level,
        int maxLevel,
        std::string flavor
    ) : id(std::move(id)),
        name(std::move(name)),
        tier(tier),
        description(std::move(description)),
        icon(std::move(icon)),
        mpCost(mpCost),
        cooldownTurns(cooldownTurns),
        effectType(effectType),
        power(power),
        level(level),
        maxLevel(maxLevel),
        flavor(std::move(flavor)) {}
};

class SkillRegistry {
public:
    static SkillRegistry& getInstance();
    const Skill* getSkill(const std::string& id) const;
    const std::unordered_map<std::string, std::shared_ptr<Skill>>& getAllSkills() const;

private:
    SkillRegistry();
    void initSkills();
    std::unordered_map<std::string, std::shared_ptr<Skill>> m_skills;
};

} // namespace Ktx
