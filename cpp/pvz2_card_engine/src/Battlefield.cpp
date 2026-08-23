#include "../include/Battlefield.hpp"
#include <algorithm>
#include <iomanip>

namespace PvZ2 {

Battlefield::Battlefield() {
    reset();
}

void Battlefield::reset(int startingSun, int plantFoodCharges) {
    m_gameTime = 0.0f;
    m_sunlight = startingSun;
    m_plantFood = plantFoodCharges;
    m_soulsCollected = 0;
    m_zombiesKilled = 0;
    m_isGameOver = false;
    m_isVictory = false;
    m_naturalSunTimer = 0.0f;

    m_entities.clear();
    m_enemies.clear();
    m_projectiles.clear();
    m_sunDrops.clear();
    m_combatLogs.clear();

    addLog("[HỆ THỐNG] Chiến trường Sân Vườn Bác Sĩ khởi động! Chúc Card Master Tuyết Mộc may mắn.");
}

void Battlefield::addLog(const std::string& message) {
    m_combatLogs.push_back(message);
    if (m_combatLogs.size() > 50) {
        m_combatLogs.erase(m_combatLogs.begin());
    }
}

PlacedEntity* Battlefield::getEntityAt(int row, int col) {
    for (auto& entity : m_entities) {
        if (entity.row == row && entity.col == col) {
            return &entity;
        }
    }
    return nullptr;
}

bool Battlefield::placeCard(const std::string& cardId, int row, int col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
    
    // Check if slot occupied
    if (getEntityAt(row, col) != nullptr) {
        addLog("[CẢNH BÁO] Ô (" + std::to_string(row) + ", " + std::to_string(col) + ") đã có thực thể!");
        return false;
    }

    const CardDefinition* def = CardDatabase::getInstance().getCard(cardId);
    if (!def) return false;

    if (m_sunlight < def->sunCost) {
        addLog("[THIẾU NĂNG LƯỢNG] Cần " + std::to_string(def->sunCost) + " Mặt Trời để triệu hồi " + def->name);
        return false;
    }

    m_sunlight -= def->sunCost;

    // Special instant Pi Card (Cherry Bomb)
    if (def->id == "cherry_bomb") {
        addLog("💥 [BOM ANH ĐÀO] Tuyết Mộc kích hoạt Thẻ Pi! Phát nổ 3x3 hủy diệt quái vật!");
        // Explode in 3x3
        for (auto& enemy : m_enemies) {
            if (std::abs(enemy.row - row) <= 1 && std::abs(enemy.x - (col * 11.0f + 5.0f)) <= 25.0f) {
                enemy.health -= def->damage;
            }
        }
        return true;
    }

    PlacedEntity entity;
    entity.id = "ent_" + std::to_string(m_nextEntityId++);
    entity.cardId = cardId;
    entity.row = row;
    entity.col = col;
    entity.health = def->health;
    entity.maxHealth = def->health;
    entity.lastAttackTime = m_gameTime;
    entity.isPlantFoodActive = false;

    m_entities.push_back(entity);
    addLog("🌱 [TRIỆU HỒI] Tuyết Mộc đã đặt [" + def->name + "] tại hàng " + std::to_string(row + 1) + ", cột " + std::to_string(col + 1));
    return true;
}

bool Battlefield::removeEntity(int row, int col) {
    auto it = std::remove_if(m_entities.begin(), m_entities.end(), [row, col](const PlacedEntity& e) {
        return e.row == row && e.col == col;
    });
    if (it != m_entities.end()) {
        m_entities.erase(it, m_entities.end());
        addLog("⛏️ [THU HỒI] Đã dọn dẹp ô hàng " + std::to_string(row + 1) + ", cột " + std::to_string(col + 1));
        return true;
    }
    return false;
}

bool Battlefield::triggerPlantFood(int row, int col) {
    PlacedEntity* entity = getEntityAt(row, col);
    if (!entity) return false;
    if (m_plantFood <= 0) {
        addLog("[HẾT HẠT NĂNG LƯỢNG] Không đủ Plant Food để kích hoạt Chiêu Cuối!");
        return false;
    }

    const CardDefinition* def = CardDatabase::getInstance().getCard(entity->cardId);
    if (!def) return false;

    m_plantFood--;
    entity->isPlantFoodActive = true;
    entity->plantFoodEndTime = m_gameTime + 4.0f;

    addLog("✨ [CHIÊU CUỐI] " + def->name + " bộc phát Năng Lượng Thần Bí: " + def->plantFoodEffect);

    if (def->id == "sunflower") {
        m_sunlight += 150;
        addLog("☀️ [QUANG NĂNG] Thu hoạch +150 Mặt Trời cực đại!");
    } else if (def->id == "peashooter_devourer") {
        // Gatling barrage on lane
        for (int i = 0; i < 20; ++i) {
            Projectile p;
            p.id = "proj_gatling_" + std::to_string(m_nextProjId++);
            p.type = ProjectileType::Pea;
            p.row = entity->row;
            p.x = entity->col * 11.0f + 6.0f + (i * 1.5f);
            p.speed = 70.0f;
            p.damage = 35;
            p.fromPlayer = true;
            m_projectiles.push_back(p);
        }
    } else if (def->id == "giant_walnut") {
        entity->health = entity->maxHealth + 1000;
        entity->buffs.shield = 1500;
    }

    return true;
}

void Battlefield::spawnEnemy(const std::string& typeId, const std::string& name, int row, int health, int damage, float speed, bool isBoss, bool hasMetal) {
    Enemy e;
    e.id = "enemy_" + std::to_string(m_nextEnemyId++);
    e.typeId = typeId;
    e.name = name;
    e.row = std::clamp(row, 0, ROWS - 1);
    e.x = 100.0f;
    e.health = health;
    e.maxHealth = health;
    e.damage = damage;
    e.speed = speed;
    e.attackSpeedSec = 1.0f;
    e.lastAttackTime = m_gameTime;
    e.isBoss = isBoss;
    e.hasMetalWeapon = hasMetal;
    e.rewardSun = isBoss ? 200 : 35;
    e.rewardSouls = isBoss ? 250 : 20;

    m_enemies.push_back(e);
    if (isBoss) {
        addLog("🚨 [BÁO ĐỘNG ĐỎ] SIÊU BOSS " + name + " (HP: " + std::to_string(health) + ") ĐÃ XUẤT HIỆN Ở HÀNG " + std::to_string(row + 1) + "!");
    }
}

void Battlefield::spawnSun(float x, float y, int value) {
    SunDrop sun;
    sun.id = "sun_" + std::to_string(m_nextSunId++);
    sun.x = x;
    sun.y = y;
    sun.value = value;
    sun.lifetime = 12.0f;
    m_sunDrops.push_back(sun);
}

void Battlefield::collectSun(const std::string& sunId) {
    auto it = std::find_if(m_sunDrops.begin(), m_sunDrops.end(), [&sunId](const SunDrop& s) {
        return s.id == sunId;
    });
    if (it != m_sunDrops.end()) {
        m_sunlight += it->value;
        m_sunDrops.erase(it);
    }
}

void Battlefield::collectAllSun() {
    int total = 0;
    for (const auto& s : m_sunDrops) {
        total += s.value;
    }
    m_sunlight += total;
    m_sunDrops.clear();
    if (total > 0) {
        addLog("☀️ Đã thu gom toàn bộ +" + std::to_string(total) + " Mặt Trời.");
    }
}

void Battlefield::update(float dt) {
    if (m_isGameOver || m_isVictory) return;

    m_gameTime += dt;

    // 1. Natural sunlight generation
    m_naturalSunTimer += dt;
    if (m_naturalSunTimer >= 7.0f) {
        m_naturalSunTimer = 0.0f;
        spawnSun(20.0f + (std::rand() % 60), 20.0f + (std::rand() % 60), 25);
    }

    // 2. Entity actions (Sunflower, Peashooter, etc.)
    for (auto& entity : m_entities) {
        const CardDefinition* def = CardDatabase::getInstance().getCard(entity.cardId);
        if (!def) continue;

        // Check Plant Food expiry
        if (entity.isPlantFoodActive && m_gameTime > entity.plantFoodEndTime) {
            entity.isPlantFoodActive = false;
        }

        // Sunflower production
        if (def->id == "sunflower") {
            if (m_gameTime - entity.lastAttackTime >= 5.0f) {
                entity.lastAttackTime = m_gameTime;
                spawnSun(entity.col * 11.0f + 5.0f, entity.row * 18.0f + 10.0f, 50);
            }
        }

        // Attackers (Peashooter, Devourer, Chomper, Melon, etc.)
        if (def->damage > 0 && def->attackSpeedSec > 0) {
            float interval = entity.isPlantFoodActive ? (def->attackSpeedSec * 0.25f) : def->attackSpeedSec;
            if (m_gameTime - entity.lastAttackTime >= interval) {
                // Check if any enemy is in front in this lane
                bool enemyInLane = false;
                for (const auto& e : m_enemies) {
                    if (e.row == entity.row && e.x > (entity.col * 11.0f)) {
                        enemyInLane = true;
                        break;
                    }
                }

                if (enemyInLane) {
                    entity.lastAttackTime = m_gameTime;
                    Projectile p;
                    p.id = "proj_" + std::to_string(m_nextProjId++);
                    p.type = (def->id == "watermelon_pult") ? ProjectileType::Melon : ProjectileType::Pea;
                    p.row = entity.row;
                    p.x = entity.col * 11.0f + 8.0f;
                    p.speed = 35.0f;
                    p.damage = def->damage;
                    p.isSplash = (def->id == "watermelon_pult");
                    p.fromPlayer = true;
                    m_projectiles.push_back(p);
                }
            }
        }
    }

    // 3. Projectile Movement and Collision
    for (auto it = m_projectiles.begin(); it != m_projectiles.end();) {
        it->x += it->speed * dt;

        bool hit = false;
        for (auto& enemy : m_enemies) {
            if (enemy.row == it->row && std::abs(enemy.x - it->x) < 4.0f) {
                enemy.health -= it->damage;
                hit = true;
                
                // Splash damage for melon
                if (it->isSplash) {
                    for (auto& other : m_enemies) {
                        if (std::abs(other.row - it->row) <= 1 && std::abs(other.x - enemy.x) <= 12.0f) {
                            other.health -= (it->damage / 2);
                        }
                    }
                }
                break;
            }
        }

        if (hit || it->x > 105.0f) {
            it = m_projectiles.erase(it);
        } else {
            ++it;
        }
    }

    // 4. Enemy Movement and Attacks
    for (auto& enemy : m_enemies) {
        // Find blocking entity in front of enemy
        PlacedEntity* blocker = nullptr;
        for (auto& entity : m_entities) {
            if (entity.row == enemy.row) {
                float entityX = entity.col * 11.0f + 5.0f;
                if (enemy.x > entityX && enemy.x - entityX < 6.0f) {
                    blocker = &entity;
                    break;
                }
            }
        }

        if (blocker) {
            // Attack entity
            if (m_gameTime - enemy.lastAttackTime >= enemy.attackSpeedSec) {
                enemy.lastAttackTime = m_gameTime;
                if (blocker->buffs.shield > 0) {
                    blocker->buffs.shield -= enemy.damage;
                    if (blocker->buffs.shield < 0) {
                        blocker->health += blocker->buffs.shield;
                        blocker->buffs.shield = 0;
                    }
                } else {
                    blocker->health -= enemy.damage;
                }
            }
        } else {
            // Move forward toward player base
            enemy.x -= enemy.speed * dt;
        }

        // Breach check
        if (enemy.x <= 0.0f) {
            m_isGameOver = true;
            addLog("☠️ [THẤT BẠI] Quái vật đã đột phá hàng phòng ngự! Trại Sinh Tồn sụp đổ.");
            return;
        }
    }

    // 5. Cleanup dead entities and enemies
    for (auto it = m_entities.begin(); it != m_entities.end();) {
        if (it->health <= 0) {
            const CardDefinition* def = CardDatabase::getInstance().getCard(it->cardId);
            addLog("🥀 [" + (def ? def->name : it->cardId) + "] đã gục ngã tại hàng " + std::to_string(it->row + 1));
            it = m_entities.erase(it);
        } else {
            ++it;
        }
    }

    for (auto it = m_enemies.begin(); it != m_enemies.end();) {
        if (it->health <= 0) {
            m_zombiesKilled++;
            m_soulsCollected += it->rewardSouls;
            m_sunlight += it->rewardSun;
            addLog("⚔️ Đã tiêu diệt [" + it->name + "]! Nhận +" + std::to_string(it->rewardSun) + " Mặt Trời, +" + std::to_string(it->rewardSouls) + " Tinh Hồn");
            it = m_enemies.erase(it);
        } else {
            ++it;
        }
    }

    // 6. Decay sun drops
    for (auto it = m_sunDrops.begin(); it != m_sunDrops.end();) {
        it->lifetime -= dt;
        if (it->lifetime <= 0.0f) {
            it = m_sunDrops.erase(it);
        } else {
            ++it;
        }
    }
}

std::string Battlefield::renderAsciiGrid() const {
    std::ostringstream ss;
    ss << "\n============================== SÂN VƯỜN BÁC SĨ (PvZ 2) ==============================\n";
    ss << "☀️ Mặt Trời: " << m_sunlight << " | 🔮 Tinh Hồn: " << m_soulsCollected << " | 🍃 Plant Food: " << m_plantFood << " | 💀 Diệt: " << m_zombiesKilled << "\n";
    ss << "--------------------------------------------------------------------------------------\n";

    for (int r = 0; r < ROWS; ++r) {
        ss << "Hàng " << (r + 1) << " |";
        for (int c = 0; c < COLS; ++c) {
            const PlacedEntity* ent = nullptr;
            for (const auto& e : m_entities) {
                if (e.row == r && e.col == c) {
                    ent = &e;
                    break;
                }
            }

            if (ent) {
                if (ent->cardId == "sunflower") ss << " [🌻] ";
                else if (ent->cardId == "peashooter_devourer") ss << " [🌱] ";
                else if (ent->cardId == "giant_walnut") ss << " [🌰] ";
                else if (ent->cardId == "newspaper_zombie") ss << " [📰] ";
                else if (ent->cardId == "watermelon_pult") ss << " [🍉] ";
                else ss << " [☘️] ";
            } else {
                ss << "  .   ";
            }
        }

        // Render projectiles and zombies on the right of lane
        ss << " | ";
        for (const auto& p : m_projectiles) {
            if (p.row == r) ss << "•";
        }
        ss << " ";
        for (const auto& e : m_enemies) {
            if (e.row == r) {
                ss << (e.isBoss ? " [👑BOSS:" : " [🧟") << e.name << "(" << e.health << "HP," << (int)e.x << "%)]";
            }
        }
        ss << "\n";
    }
    ss << "======================================================================================\n";
    return ss.str();
}

} // namespace PvZ2
