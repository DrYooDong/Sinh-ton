#pragma once

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/bind.h>
#define WASM_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define WASM_EXPORT
#endif

#include <string>
#include <vector>
#include <cstdint>

namespace WasmBridge {

// KTX System Exports
struct KtxCombatResult {
    int damageDealt;
    bool isCrit;
    bool isShieldBroken;
    int remainingHp;
};

// PvZ 1 System Exports
struct Pvz1ImpactResult {
    int finalDamage;
    int remainingHelmHp;
    int remainingBodyHp;
    bool isDefeated;
    float slowDuration;
};

// PvZ 2 System Exports
struct Pvz2GachaResult {
    int rarityCode; // 0=C, 1=B, 2=A, 3=S, 4=SS, 5=Pi
    bool isGuaranteedPity;
    int convertedSouls;
};

} // namespace WasmBridge
