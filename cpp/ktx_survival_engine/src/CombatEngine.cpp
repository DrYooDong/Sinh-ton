#include "../include/CombatEngine.hpp"
#include <algorithm>
#include <iomanip>

namespace Ktx {

CombatEngine::CombatEngine() {}

void CombatEngine::addLog(const std::string& msg) {
    m_logs.push_back(msg);
    if (m_logs.size() > 40) {
        m_logs.erase(m_logs.begin());
    }
}

void CombatEngine::startEncounter(Character& /*player*/, FortressRoom& /*room*/, const std::vector<KtxEnemy>& enemies) {
    m_enemies = enemies;
    m_logs.clear();
    m_battleOver = false;
    m_victory = false;
    m_turn = 1;

    addLog("⚔️ [BẮT ĐẦU GIAO TRANH] Quái vật hành lang KTX đang áp sát phòng 200!");
}

bool CombatEngine::executePlayerAttack(Character& player, FortressRoom& room, int targetIndex) {
    if (targetIndex < 0 || targetIndex >= (int)m_enemies.size()) return false;
    KtxEnemy& enemy = m_enemies[targetIndex];

    int dmg = std::max(10, player.calculateTotalAtk() - enemy.def);
    bool isCrit = (std::rand() % 100) < player.calculateCritRate();
    if (isCrit) {
        dmg = static_cast<int>(dmg * 1.8f);
        addLog("💥 [CHÍ MẠNG!] Tuyết Mộc vung vũ khí chém rực lửa!");
    }

    if (enemy.isStealth) {
        addLog("👁️ [SIÊU TRỰC GIÁC] Tuyết Mộc phát hiện quỹ đạo vô hình của " + enemy.name + "!");
        enemy.isStealth = false;
    }

    enemy.hp -= dmg;
    addLog("🗡️ Tuyết Mộc tấn công [" + enemy.name + "] gây " + std::to_string(dmg) + " sát thương!");

    executeTurn(player, room);
    return true;
}

bool CombatEngine::executePlayerSkill(Character& player, FortressRoom& room, const std::string& skillId, int targetIndex) {
    const Skill* skill = SkillRegistry::getInstance().getSkill(skillId);
    if (!skill) return false;

    if (player.mp < skill->mpCost) {
        addLog("❌ [THIẾU MANA] Không đủ MP để thi triển " + skill->name);
        return false;
    }

    player.mp -= skill->mpCost;

    if (skill->id == "skill_ghost_stun") {
        addLog("👻 [QUỶ ĐỒNG] Há miệng gầm thét, khóa cứng toàn bộ kẻ địch trong 2 lượt!");
        for (auto& e : m_enemies) {
            e.isStunned = true;
            e.stunTurns = 2;
        }
    } else if (skill->id == "skill_silver_lightning") {
        if (targetIndex >= 0 && targetIndex < (int)m_enemies.size()) {
            KtxEnemy& target = m_enemies[targetIndex];
            int dmg = static_cast<int>(player.calculateTotalAtk() * (skill->power / 100.0f));
            target.hp -= dmg;
            target.isStealth = false;
            addLog("⚡ [ÁNH BẠC LÔI ĐÌNH] Bắn xuyên thấu [" + target.name + "] gây " + std::to_string(dmg) + " sát thương điện cực mạnh!");
        }
    } else if (skill->id == "skill_hundred_ghosts") {
        addLog("🔮 [BÁCH QUỶ HUYẾT KHẾ] Bão ma thuật quét sạch chiến trường!");
        for (auto& e : m_enemies) {
            e.hp -= (skill->power + player.intel * 5);
        }
    }

    executeTurn(player, room);
    return true;
}

void CombatEngine::executeTurn(Character& player, FortressRoom& room) {
    // 1. Turrets Auto Attack
    if (room.turretLeft.autoAttack && !m_enemies.empty()) {
        KtxEnemy& target = m_enemies[0];
        target.hp -= room.turretLeft.damage;
        addLog("🏹 [HẮC THIẾT NỎ] Tự động bắn nát giáp [" + target.name + "] -" + std::to_string(room.turretLeft.damage) + " HP");
    }
    if (room.turretRight.autoAttack && !m_enemies.empty()) {
        KtxEnemy& target = m_enemies.back();
        target.hp -= room.turretRight.damage;
        addLog("🚀 [PHÁO KẺ PHÂN TÁCH] Pháo tử khí nổ tung diện rộng -" + std::to_string(room.turretRight.damage) + " HP");
    }

    // 2. Roommates Assist
    const auto& roommates = RoommateManager::getInstance().getAllRoommates();
    for (const auto& r : roommates) {
        if (r.isRecruited && !m_enemies.empty()) {
            KtxEnemy& target = m_enemies[std::rand() % m_enemies.size()];
            int assistDmg = 40 + (r.level * 20);
            target.hp -= assistDmg;
            addLog("🤝 [" + r.name + "] tung " + r.signatureSkill + " yểm trợ -" + std::to_string(assistDmg) + " HP");
        }
    }

    // 3. Enemy Cleanup
    for (auto it = m_enemies.begin(); it != m_enemies.end();) {
        if (it->hp <= 0) {
            player.addLordCoins(it->rewardCoins);
            player.addExp(it->rewardExp);
            player.addMutationPoints(it->rewardMutations);
            addLog("☠️ Đã tiêu diệt [" + it->name + "]! Thưởng +" + std::to_string(it->rewardCoins) + " 👑 Tiền Chúa Tể, +" + std::to_string(it->rewardExp) + " EXP");
            it = m_enemies.erase(it);
        } else {
            ++it;
        }
    }

    if (m_enemies.empty()) {
        m_battleOver = true;
        m_victory = true;
        addLog("🏆 [CHIẾN THẮNG!] Phòng 200 an toàn tuyệt đối!");
        return;
    }

    // 4. Enemy Attacks Player / Fortress Door
    for (auto& e : m_enemies) {
        if (e.isStunned) {
            e.stunTurns--;
            if (e.stunTurns <= 0) e.isStunned = false;
            addLog("💫 [" + e.name + "] đang bị Quỷ Đồng khống chế cứng, không thể tấn công!");
            continue;
        }

        // Damage Door first if closed
        if (room.doorHp > 0) {
            int netDmg = std::max(5, e.atk - room.doorDef);
            room.doorHp -= netDmg;
            addLog("🚪 [" + e.name + "] cào cấu cửa phòng! Cửa hợp kim nhận " + std::to_string(netDmg) + " sát thương (Còn " + std::to_string(room.doorHp) + "/" + std::to_string(room.doorMaxHp) + " HP)");
        } else {
            int playerNetDmg = std::max(10, e.atk - player.calculateTotalDef());
            player.hp -= playerNetDmg;
            addLog("🩸 [" + e.name + "] tấn công Tuyết Mộc! Mất -" + std::to_string(playerNetDmg) + " HP!");
            if (player.hp <= 0) {
                m_battleOver = true;
                m_victory = false;
                addLog("☠️ [TỬ TRẬN] Tuyết Mộc đã gục ngã! Căn phòng 200 thất thủ.");
                return;
            }
        }
    }

    m_turn++;
}

std::string CombatEngine::renderAsciiBattleHUD(const Character& player, const FortressRoom& room) const {
    std::ostringstream ss;
    ss << "\n============================== PHÒNG THỦ KTX PHÒNG 200 (LƯỢT " << m_turn << ") ==============================\n";
    ss << "👤 Tuyết Mộc: " << player.hp << "/" << player.maxHp << " HP | MP: " << player.mp << "/" << player.maxMp
       << " | ATK: " << player.calculateTotalAtk() << " | DEF: " << player.calculateTotalDef()
       << " | 👑 Xu: " << player.lordCoins << "\n";
    ss << "🚪 Độ Bền Cửa Hợp Kim: [" << room.doorHp << "/" << room.doorMaxHp << " HP] (DEF: " << room.doorDef << ")\n";
    ss << "----------------------------------------------------------------------------------------------------\n";
    ss << "👹 [KẺ ĐỊCH NGOÀI HÀNH LANG]:\n";
    for (size_t i = 0; i < m_enemies.size(); ++i) {
        const auto& e = m_enemies[i];
        ss << "  [" << (i + 1) << "] " << (e.isBoss ? "👑 BOSS: " : "🧟 ") << e.name << " (" << e.title << ")"
           << " - HP: " << e.hp << "/" << e.maxHp << " | ATK: " << e.atk << " | DEF: " << e.def
           << (e.isStealth ? " [TÀNG HÌNH 👻]" : "") << (e.isStunned ? " [TÊ LIỆT 💫]" : "") << "\n";
    }
    ss << "====================================================================================================\n";
    return ss.str();
}

} // namespace Ktx
