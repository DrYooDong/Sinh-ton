#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <iostream>
#include <chrono>

namespace PvZ1 {

enum class PlantCategory {
    Normal,
    InstantPi,
    SummonZombie
};

enum class ProjectileType {
    Pea,
    IcePea,
    FumeWave,
    Gatling,
    MelonIce,
    Fireball,
    Butter,
    Laser,
    Lightning,
    BonkPunch,
    None
};

enum class HelmType {
    None,
    Cone,
    Bucket,
    Football,
    SporeScale
};

enum class ShieldType {
    None,
    Newspaper,
    ScreenDoor,
    Ladder
};

enum class WeatherCondition {
    Clear,
    Fog,
    Night,
    AcidRain
};

struct NationalStats {
    float lifeExpectancyMonths = 0.0f;
    float virusResistancePct = 0.0f;
    int nationalTerritoryBonusKm2 = 0;
    int globalRank = 1;
    long long liveViewers = 10500000000LL; // 10.5 billion viewers
};

struct LiveComment {
    std::string author;
    std::string content;
    std::string flag;
    std::string tag; // MC, Fan, Hater, Expert
};

} // namespace PvZ1
