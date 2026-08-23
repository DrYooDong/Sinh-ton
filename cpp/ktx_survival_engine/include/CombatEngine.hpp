#pragma once
#include "KtxTypes.hpp"
#include "Character.hpp"
#include "Skill.hpp"
#include "FortressRoom.hpp"
#include "Roommate.hpp"

#include <string>
#include <vector>
#include <sstream>

namespace Ktx {

struct KtxEnemy {
    std::string id;
    std::string name;
    std::string title;
    int hp;
    int maxHp;
    int atk;
    int def;
    bool isBoss = false;
    bool isStealth = false;
    bool isStunned = false;
    int stunTurns = 0;
    int rewardCoins = 50;
    int rewardExp = 80;
    int rewardMutations = 10;
};

class CombatEngine {
public:
    CombatEngine();

    void startEncounter(Character& player, FortressRoom& room, const std::vector<KtxEnemy>& enemies);
    bool executePlayerAttack(Character& player, FortressRoom& room, int targetIndex);
    bool executePlayerSkill(Character& player, FortressRoom& room, const std::string& skillId, int targetIndex);
    void executeTurn(Character& player, FortressRoom& room);

    bool isBattleOver() const { return m_battleOver; }
    bool isVictory() const { return m_victory; }
    const std::vector<KtxEnemy>& getEnemies() const { return m_enemies; }
    const std::vector<std::string>& getLogs() const { return m_logs; }

    void addLog(const std::string& msg);
    std::string renderAsciiBattleHUD(const Character& player, const FortressRoom& room) const;

private:
    std::vector<KtxEnemy> m_enemies;
    std::vector<std::string> m_logs;
    bool m_battleOver = false;
    bool m_victory = false;
    int m_turn = 1;
};

} // namespace Ktx
