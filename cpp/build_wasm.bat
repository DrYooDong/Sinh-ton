@echo off
echo =======================================================
echo Compiling C++ Survival Engines to WebAssembly (Wasm)...
echo =======================================================

where emcc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Emscripten (emcc) is not found in PATH.
    echo Please install Emscripten SDK or use the integrated dual-mode TS Wasm bridge fallback.
    exit /b 1
)

emcc -O3 -std=c++17 wasm_bridge/*.cpp ^
    -s WASM=1 ^
    -s EXPORTED_FUNCTIONS="['_wasm_get_engine_version', '_wasm_ping', '_ktx_calculate_hourly_coins', '_ktx_calculate_combat_damage', '_ktx_calculate_door_defense', '_pvz1_calculate_projectile_impact', '_pvz1_calculate_cherry_bomb_explosion', '_pvz1_calculate_national_life_expectancy', '_pvz2_roll_gacha_rarity', '_pvz2_calculate_fusion_stat_multiplier', '_pvz2_calculate_plant_food_gatling_total_damage']" ^
    -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" ^
    -s ALLOW_MEMORY_GROWTH=1 ^
    -o ../public/survival_engine.js

echo [SUCCESS] WebAssembly build completed! Output saved to public/survival_engine.js and public/survival_engine.wasm
