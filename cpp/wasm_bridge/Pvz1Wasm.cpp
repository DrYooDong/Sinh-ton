#include "WasmBridge.hpp"
#include <algorithm>

extern "C" {

WASM_EXPORT
int pvz1_calculate_projectile_impact(int projDmg, int projType, int helmHp, int bodyHp) {
    int totalHp = helmHp + bodyHp;
    int dmg = projDmg;
    
    // Ice damage multiplier vs unshielded
    if (projType == 1 && helmHp <= 0) {
        dmg = static_cast<int>(dmg * 1.15f);
    }
    
    return std::max(0, totalHp - dmg);
}

WASM_EXPORT
int pvz1_calculate_cherry_bomb_explosion(int centerRow, int centerCol, int targetRow, int targetCol, int baseDmg) {
    if (std::abs(centerRow - targetRow) <= 1 && std::abs(centerCol - targetCol) <= 1) {
        return baseDmg; // Full 1800 damage in 3x3
    }
    return 0;
}

WASM_EXPORT
float pvz1_calculate_national_life_expectancy(int wavesCompleted) {
    return 1.0f + (wavesCompleted * 1.5f);
}

} // extern "C"
