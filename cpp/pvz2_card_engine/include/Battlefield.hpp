#pragma once
#include "Types.hpp"
#include "Card.hpp"
#include <string>
#include <vector>
#include <memory>
#include <functional>
#include <sstream>

namespace PvZ2 {

struct PlacedEntity {
    std::string id;
    std::string cardId;
    int row;
    int col;
    int health;
    int maxHealth;
    float lastAttackTime;
    bool isPlantFoodActive = false;
    float plantFoodEndTime = 0.0f;
    bool isArmorIntact = true;
    Buffs buffs;
};

struct Enemy {
    std::string id;
    std::string typeId;
    std::string name;
    int row;
    float x; // 0.0 (left/base) to 100.0 (right/spawn)
    int health;
    int maxHealth;
    float speed; // % per second
    int damage;
    float attackSpeedSec;
    float lastAttackTime;
    bool isBoss = false;
    bool isHypnotized = false;
    bool hasMetalWeapon = false;
    int rewardSun = 25;
    int rewardSouls = 15;
    StatusEffects statusEffects;
};

struct Projectile {
    std::string id;
    ProjectileType type;
    int row;
    float x; // % along lane
    float speed; // % per second
    int damage;
    bool isSplash = false;
    bool fromPlayer = true;
};

struct SunDrop {
    std::string id;
    float x;
    float y;
    int value;
    float lifetime;
};

class Battlefield {
public:
    static constexpr int ROWS = 5;
    static constexpr int COLS = 9;

    Battlefield();
    void reset(int startingSun = 300, int plantFoodCharges = 3);
    
    // Core Game Loop
    void update(float dt);
    
    // Player Actions
    bool placeCard(const std::string& cardId, int row, int col);
    bool removeEntity(int row, int col);
    bool triggerPlantFood(int row, int col);
    void collectSun(const std::string& sunId);
    void collectAllSun();
    
    // Spawns
    void spawnEnemy(const std::string& typeId, const std::string& name, int row, int health, int damage, float speed, bool isBoss = false, bool hasMetal = false);
    void spawnSun(float x, float y, int value);

    // Queries
    int getSun() const { return m_sunlight; }
    int getPlantFood() const { return m_plantFood; }
    int getSoulsCollected() const { return m_soulsCollected; }
    int getZombiesKilled() const { return m_zombiesKilled; }
    bool isGameOver() const { return m_isGameOver; }
    bool isVictory() const { return m_isVictory; }
    
    const std::vector<PlacedEntity>& getPlacedEntities() const { return m_entities; }
    const std::vector<Enemy>& getEnemies() const { return m_enemies; }
    const std::vector<Projectile>& getProjectiles() const { return m_projectiles; }
    const std::vector<SunDrop>& getSunDrops() const { return m_sunDrops; }
    const std::vector<std::string>& getCombatLogs() const { return m_combatLogs; }

    void addLog(const std::string& message);
    std::string renderAsciiGrid() const;

private:
    float m_gameTime = 0.0f;
    int m_sunlight = 300;
    int m_plantFood = 3;
    int m_soulsCollected = 0;
    int m_zombiesKilled = 0;
    bool m_isGameOver = false;
    bool m_isVictory = false;

    float m_naturalSunTimer = 0.0f;
    int m_nextEntityId = 1;
    int m_nextEnemyId = 1;
    int m_nextProjId = 1;
    int m_nextSunId = 1;

    std::vector<PlacedEntity> m_entities;
    std::vector<Enemy> m_enemies;
    std::vector<Projectile> m_projectiles;
    std::vector<SunDrop> m_sunDrops;
    std::vector<std::string> m_combatLogs;

    PlacedEntity* getEntityAt(int row, int col);
};

} // namespace PvZ2
