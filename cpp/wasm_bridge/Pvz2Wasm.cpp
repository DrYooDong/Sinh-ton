#include "WasmBridge.hpp"
#include <cstdlib>

extern "C" {

WASM_EXPORT
int pvz2_roll_gacha_rarity(int pityCount) {
    // 0=C, 1=B, 2=A, 3=S, 4=SS
    if (pityCount >= 9) {
        // Guaranteed S or SS
        return ((std::rand() % 100) < 30) ? 4 : 3;
    }

    int roll = std::rand() % 100;
    if (roll < 3) return 4;        // 3% SS
    else if (roll < 15) return 3;  // 12% S
    else if (roll < 45) return 2;  // 30% A
    else if (roll < 80) return 1;  // 35% B
    else return 0;                 // 20% C
}

WASM_EXPORT
int pvz2_calculate_fusion_stat_multiplier(int baseStat, int fusionTier) {
    float mult = 1.0f + (fusionTier * 0.25f);
    return static_cast<int>(baseStat * mult);
}

WASM_EXPORT
int pvz2_calculate_plant_food_gatling_total_damage(int bulletsCount, int bulletDmg, int laneZombiesCount) {
    return bulletsCount * bulletDmg * (laneZombiesCount > 0 ? 1 : 0);
}

} // extern "C"
