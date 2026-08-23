#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <iostream>

namespace Ktx {

enum class SkillTier {
    F, E, D, C, B, A, S, SS, SSS, EX
};

inline std::string tierToString(SkillTier t) {
    switch (t) {
        case SkillTier::F: return "F";
        case SkillTier::E: return "E";
        case SkillTier::D: return "D";
        case SkillTier::C: return "C";
        case SkillTier::B: return "B";
        case SkillTier::A: return "A";
        case SkillTier::S: return "S";
        case SkillTier::SS: return "SS";
        case SkillTier::SSS: return "SSS";
        case SkillTier::EX: return "EX (Chúa Tể)";
        default: return "Unknown";
    }
}

enum class ItemRarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Mythic,
    Divine
};

inline std::string rarityToString(ItemRarity r) {
    switch (r) {
        case ItemRarity::Common: return "Thường (Trắng)";
        case ItemRarity::Uncommon: return "Ưu Tú (Lục)";
        case ItemRarity::Rare: return "Hiếm (Lam)";
        case ItemRarity::Epic: return "Sử Thi (Tím)";
        case ItemRarity::Legendary: return "Huyền Thoại (Cam)";
        case ItemRarity::Mythic: return "Thần Thoại (Đỏ)";
        case ItemRarity::Divine: return "Chí Tôn (Hoàng Kim)";
        default: return "Unknown";
    }
}

enum class ItemCategory {
    Weapon,
    Armor,
    Accessory,
    Consumable,
    Material,
    Blueprint,
    Special
};

enum class WeatherType {
    Clear,
    AcidRain,
    BloodMoon,
    ToxicFog,
    RadiationStorm,
    BlizzardExtreme // Đêm Cực Hàn -40°C
};

} // namespace Ktx
