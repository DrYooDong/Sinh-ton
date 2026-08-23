#include "WasmBridge.hpp"
#include <algorithm>
#include <cstdlib>

extern "C" {

WASM_EXPORT
int ktx_calculate_hourly_coins(int baseBedRate, int roommateBonusPct) {
    float mult = 1.0f + (roommateBonusPct / 100.0f);
    return static_cast<int>(baseBedRate * mult);
}

WASM_EXPORT
int ktx_calculate_combat_damage(int attackerStr, int weaponAtk, int weaponEnhance, int defenderDef, int critRate) {
    int totalAtk = (attackerStr * 4) + weaponAtk + (weaponEnhance * 15);
    int rawDmg = std::max(10, totalAtk - defenderDef);
    
    // Check crit
    bool isCrit = (std::rand() % 100) < critRate;
    if (isCrit) {
        rawDmg = static_cast<int>(rawDmg * 1.8f);
    }
    return rawDmg;
}

WASM_EXPORT
int ktx_calculate_door_defense(int baseDoorHp, int doorLevel, int incomingDmg) {
    int doorDef = doorLevel * 40;
    int netDmg = std::max(5, incomingDmg - doorDef);
    return std::max(0, baseDoorHp - netDmg);
}

} // extern "C"
