#include "WasmBridge.hpp"
#include <iostream>

extern "C" {

WASM_EXPORT
const char* wasm_get_engine_version() {
    return "SURVIVAL_WASM_ENGINE_v3.0.0_HIGH_PERFORMANCE";
}

WASM_EXPORT
int wasm_ping(int value) {
    return value * 2 + 7;
}

} // extern "C"
