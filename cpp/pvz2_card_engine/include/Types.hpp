#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <iostream>
#include <chrono>
#include <cmath>

namespace PvZ2 {

enum class CardRarity {
    C,
    B,
    A,
    S,
    SS,
    Pi
};

inline std::string rarityToString(CardRarity rarity) {
    switch (rarity) {
        case CardRarity::C: return "C";
        case CardRarity::B: return "B";
        case CardRarity::A: return "A";
        case CardRarity::S: return "S";
        case CardRarity::SS: return "SS";
        case CardRarity::Pi: return "Pi (Đặc Biệt)";
        default: return "Unknown";
    }
}

enum class CardCategory {
    Plant,
    Zombie,
    PiSpecial,
    Fusion
};

inline std::string categoryToString(CardCategory cat) {
    switch (cat) {
        case CardCategory::Plant: return "Thực Vật";
        case CardCategory::Zombie: return "Thây Ma";
        case CardCategory::PiSpecial: return "Thẻ Pi (Số 0)";
        case CardCategory::Fusion: return "Nhập Thể";
        default: return "Khác";
    }
}

enum class ProjectileType {
    Pea,
    FirePea,
    Melon,
    Lightning,
    KelpTentacle,
    Bullet,
    RpgRocket
};

struct Buffs {
    bool fireBoost = false;
    bool speedBoost = false;
    int shield = 0;
};

struct StatusEffects {
    float slowUntil = 0.0f;
    float stunUntil = 0.0f;
    float burnUntil = 0.0f;
    float entangledUntil = 0.0f;
};

} // namespace PvZ2
