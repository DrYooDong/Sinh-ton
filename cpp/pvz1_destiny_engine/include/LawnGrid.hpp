#pragma once
#include "Pvz1Types.hpp"
#include "Plant.hpp"
#include "Zombie.hpp"
#include <string>
#include <vector>
#include <memory>
#include <sstream>

namespace PvZ1 {

struct PlacedPlantEntity {
    std::string id;
    std::string plantId;
    int row;
    int col;
    int hp;
    int maxHp;
    float lastAttackTime;
    float lastSunTime;
    bool isOvercharged = false;
    float overchargeEndTime = 0.0f;
};

struct ActiveZombieEntity {
    std::string id;
    std::string zombieId;
    int row;
    float x; // 0.0 (house) to 100.0 (spawn)
    int bodyHp;
    int helmHp;
    HelmType helmType;
    int shieldHp;
    ShieldType shieldType;
    float speed;
    int attackDmg;
    float lastAttackTime;
    bool isBoss = false;
    bool isSlowed = false;
    float slowTimer = 0.0f;
    bool hasMetalArmor = false;
};

struct LawnProjectile {
    std::string id;
    ProjectileType type;
    int row;
    float x;
    float speed;
    int damage;
    bool isSplash = false;
};

struct FallingSun {
    std::string id;
    float x;
    float y;
    int value;
    float lifetime;
};

class LawnGrid {
public:
    static constexpr int ROWS = 5;
    static constexpr int COLS = 9;

    LawnGrid();
    void reset(int startingSun = 250);

    // Update
    void update(float dt);

    // Player Actions
    bool plantAt(const std::string& plantId, int row, int col);
    bool removePlant(int row, int col);
    bool usePlantFood(int row, int col);
    void collectAllSun();

    // Spawns
    void spawnZombie(const std::string& zombieId, int row);
    void spawnSun(float x, float y, int value);

    // Getters
    int getSunlight() const { return m_sunlight; }
    int getEnergy() const { return m_energy; }
    int getBeastCores() const { return m_beastCores; }
    int getZombiesKilled() const { return m_zombiesKilled; }
    bool isGameOver() const { return m_isGameOver; }
    bool isVictory() const { return m_isVictory; }
    
    void addSunlight(int val) { m_sunlight += val; }
    void addEnergy(int val) { m_energy += val; }

    const std::vector<PlacedPlantEntity>& getPlants() const { return m_plants; }
    const std::vector<ActiveZombieEntity>& getZombies() const { return m_zombies; }
    const std::vector<std::string>& getLogs() const { return m_logs; }

    void addLog(const std::string& log);
    std::string renderAsciiLawn() const;

private:
    float m_gameTime = 0.0f;
    int m_sunlight = 250;
    int m_energy = 50;
    int m_beastCores = 0;
    int m_zombiesKilled = 0;
    bool m_isGameOver = false;
    bool m_isVictory = false;
    float m_naturalSunTimer = 0.0f;

    bool m_lawnMowers[ROWS] = {true, true, true, true, true};

    int m_nextPlantId = 1;
    int m_nextZombieId = 1;
    int m_nextProjId = 1;
    int m_nextSunId = 1;

    std::vector<PlacedPlantEntity> m_plants;
    std::vector<ActiveZombieEntity> m_zombies;
    std::vector<LawnProjectile> m_projectiles;
    std::vector<FallingSun> m_sunDrops;
    std::vector<std::string> m_logs;

    PlacedPlantEntity* getPlantAt(int row, int col);
};

} // namespace PvZ1
