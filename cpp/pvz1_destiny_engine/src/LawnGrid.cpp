#include "../include/LawnGrid.hpp"
#include <algorithm>
#include <iomanip>

namespace PvZ1 {

LawnGrid::LawnGrid() {
    reset();
}

void LawnGrid::reset(int startingSun) {
    m_gameTime = 0.0f;
    m_sunlight = startingSun;
    m_energy = 50;
    m_beastCores = 0;
    m_zombiesKilled = 0;
    m_isGameOver = false;
    m_isVictory = false;
    m_naturalSunTimer = 0.0f;

    for (int r = 0; r < ROWS; ++r) {
        m_lawnMowers[r] = true;
    }

    m_plants.clear();
    m_zombies.clear();
    m_projectiles.clear();
    m_sunDrops.clear();
    m_logs.clear();

    addLog("[HỆ THỐNG QUỐC VẬN] Sân Vườn Bác Sĩ kích hoạt thành công! 10.5 tỷ khán giả đang theo dõi trực tiếp.");
}

void LawnGrid::addLog(const std::string& log) {
    m_logs.push_back(log);
    if (m_logs.size() > 40) {
        m_logs.erase(m_logs.begin());
    }
}

PlacedPlantEntity* LawnGrid::getPlantAt(int row, int col) {
    for (auto& p : m_plants) {
        if (p.row == row && p.col == col) {
            return &p;
        }
    }
    return nullptr;
}

bool LawnGrid::plantAt(const std::string& plantId, int row, int col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
    if (getPlantAt(row, col) != nullptr) {
        addLog("[CẢNH BÁO] Vị trí ô (" + std::to_string(row + 1) + ", " + std::to_string(col + 1) + ") đã được trồng cây!");
        return false;
    }

    const PlantDefinition* def = PlantRegistry::getInstance().getPlant(plantId);
    if (!def) return false;

    if (m_sunlight < def->sunCost) {
        addLog("[THIẾU MẶT TRỜI] Cần " + std::to_string(def->sunCost) + " ☀️ để trồng " + def->name);
        return false;
    }

    m_sunlight -= def->sunCost;

    // Instant Pi Plant Check
    if (def->id == "plant_cherry_bomb") {
        addLog("💥 [BOM ANH ĐÀO] Phát nổ 3x3 hủy diệt quái vật xung quanh!");
        for (auto& z : m_zombies) {
            if (std::abs(z.row - row) <= 1 && std::abs(z.x - (col * 11.0f + 5.0f)) <= 25.0f) {
                z.bodyHp -= def->attackDmg;
            }
        }
        return true;
    } else if (def->id == "plant_jalapeno") {
        addLog("🌶️ [ỚT LỬA] Thiêu rụi toàn bộ làn hàng " + std::to_string(row + 1) + " thành tro tàn!");
        for (auto& z : m_zombies) {
            if (z.row == row) {
                z.bodyHp -= def->attackDmg;
            }
        }
        return true;
    } else if (def->id == "plant_doom_shroom") {
        addLog("🍄 [NẤM HẠT NHÂN] BÙMMM! Vụ nổ hủy diệt xóa sổ toàn bộ chiến trường!");
        for (auto& z : m_zombies) {
            z.bodyHp -= def->attackDmg;
        }
        return true;
    }

    PlacedPlantEntity p;
    p.id = "plant_" + std::to_string(m_nextPlantId++);
    p.plantId = plantId;
    p.row = row;
    p.col = col;
    p.hp = def->maxHp;
    p.maxHp = def->maxHp;
    p.lastAttackTime = m_gameTime;
    p.lastSunTime = m_gameTime;

    m_plants.push_back(p);
    addLog(def->icon + " [TRỒNG CÂY] Tuyết Mộc đã gieo trồng [" + def->name + "] tại Hàng " + std::to_string(row + 1) + ", Cột " + std::to_string(col + 1));
    return true;
}

bool LawnGrid::removePlant(int row, int col) {
    auto it = std::remove_if(m_plants.begin(), m_plants.end(), [row, col](const PlacedPlantEntity& p) {
        return p.row == row && p.col == col;
    });
    if (it != m_plants.end()) {
        m_plants.erase(it, m_plants.end());
        addLog("⛏️ [DÙNG XẺNG] Đã bứng cây tại ô Hàng " + std::to_string(row + 1) + ", Cột " + std::to_string(col + 1));
        return true;
    }
    return false;
}

bool LawnGrid::usePlantFood(int row, int col) {
    PlacedPlantEntity* p = getPlantAt(row, col);
    if (!p) return false;

    const PlantDefinition* def = PlantRegistry::getInstance().getPlant(p->plantId);
    if (!def) return false;

    p->isOvercharged = true;
    p->overchargeEndTime = m_gameTime + 4.0f;
    addLog("🍃 [CHIÊU CUỐI BÁC SĨ DAVE] " + def->name + " kích hoạt: " + def->ult.name + " (" + def->ult.description + ")");

    if (def->id == "plant_sunflower") {
        m_sunlight += 150;
    } else if (def->id == "plant_peashooter") {
        for (int i = 0; i < 20; ++i) {
            LawnProjectile proj;
            proj.id = "proj_gat_" + std::to_string(m_nextProjId++);
            proj.type = ProjectileType::Pea;
            proj.row = p->row;
            proj.x = p->col * 11.0f + 6.0f + (i * 1.5f);
            proj.speed = 65.0f;
            proj.damage = 35;
            m_projectiles.push_back(proj);
        }
    }

    return true;
}

void LawnGrid::spawnZombie(const std::string& zombieId, int row) {
    const ZombieDefinition* def = ZombieRegistry::getInstance().getZombie(zombieId);
    if (!def) return;

    ActiveZombieEntity z;
    z.id = "zombie_" + std::to_string(m_nextZombieId++);
    z.zombieId = zombieId;
    z.row = std::clamp(row, 0, ROWS - 1);
    z.x = 100.0f;
    z.bodyHp = def->bodyHp;
    z.helmHp = def->helmHp;
    z.helmType = def->helmType;
    z.shieldHp = def->shieldHp;
    z.shieldType = def->shieldType;
    z.speed = def->speed * 12.0f; // Scale to % per second
    z.attackDmg = def->attackDmg;
    z.lastAttackTime = m_gameTime;
    z.isBoss = def->isBoss;
    z.hasMetalArmor = def->hasMetalArmor;

    m_zombies.push_back(z);
    if (def->isBoss) {
        addLog("🚨 [BÁO ĐỘNG QUỐC GIA] SIÊU BOSS " + def->name + " ĐÃ TIẾN VÀO CHIẾN TRƯỜNG!");
    }
}

void LawnGrid::spawnSun(float x, float y, int value) {
    FallingSun sun;
    sun.id = "sun_" + std::to_string(m_nextSunId++);
    sun.x = x;
    sun.y = y;
    sun.value = value;
    sun.lifetime = 10.0f;
    m_sunDrops.push_back(sun);
}

void LawnGrid::collectAllSun() {
    int total = 0;
    for (const auto& s : m_sunDrops) {
        total += s.value;
    }
    m_sunlight += total;
    m_sunDrops.clear();
}

void LawnGrid::update(float dt) {
    if (m_isGameOver || m_isVictory) return;

    m_gameTime += dt;

    // 1. Natural sunlight drop
    m_naturalSunTimer += dt;
    if (m_naturalSunTimer >= 6.0f) {
        m_naturalSunTimer = 0.0f;
        spawnSun(20.0f + (std::rand() % 60), 20.0f + (std::rand() % 60), 25);
    }

    // 2. Plants action
    for (auto& p : m_plants) {
        const PlantDefinition* def = PlantRegistry::getInstance().getPlant(p.plantId);
        if (!def) continue;

        if (p.isOvercharged && m_gameTime > p.overchargeEndTime) {
            p.isOvercharged = false;
        }

        // Sunflower produce
        if (def->id == "plant_sunflower") {
            if (m_gameTime - p.lastSunTime >= 6.0f) {
                p.lastSunTime = m_gameTime;
                spawnSun(p.col * 11.0f + 5.0f, p.row * 18.0f + 10.0f, 25);
            }
        }

        // Magnet Shroom disarming
        if (def->id == "plant_magnet_shroom") {
            if (m_gameTime - p.lastAttackTime >= 4.0f) {
                for (auto& z : m_zombies) {
                    if (z.hasMetalArmor || z.helmType == HelmType::Bucket) {
                        p.lastAttackTime = m_gameTime;
                        z.helmHp = 0;
                        z.helmType = HelmType::None;
                        z.hasMetalArmor = false;
                        addLog("🧲 [NẤM NAM CHÂM] Hút bay thùng sắt và vũ khí kim loại của quái vật!");
                        break;
                    }
                }
            }
        }

        // Attackers
        if (def->attackDmg > 0 && def->attackIntervalSec > 0) {
            float interval = p.isOvercharged ? (def->attackIntervalSec * 0.3f) : def->attackIntervalSec;
            if (m_gameTime - p.lastAttackTime >= interval) {
                // Check zombie in lane
                bool zombieInLane = false;
                for (const auto& z : m_zombies) {
                    if (z.row == p.row && z.x > (p.col * 11.0f)) {
                        zombieInLane = true;
                        break;
                    }
                }

                if (zombieInLane) {
                    p.lastAttackTime = m_gameTime;
                    LawnProjectile proj;
                    proj.id = "proj_" + std::to_string(m_nextProjId++);
                    proj.type = def->projType;
                    proj.row = p.row;
                    proj.x = p.col * 11.0f + 8.0f;
                    proj.speed = 35.0f;
                    proj.damage = def->attackDmg;
                    proj.isSplash = (def->projType == ProjectileType::MelonIce);
                    m_projectiles.push_back(proj);
                }
            }
        }
    }

    // 3. Projectile Movement and Collision
    for (auto it = m_projectiles.begin(); it != m_projectiles.end();) {
        it->x += it->speed * dt;

        bool hit = false;
        for (auto& z : m_zombies) {
            if (z.row == it->row && std::abs(z.x - it->x) < 4.0f) {
                hit = true;
                
                // Ice slowdown
                if (it->type == ProjectileType::IcePea || it->type == ProjectileType::MelonIce) {
                    z.isSlowed = true;
                    z.slowTimer = 3.5f;
                }

                // Helmet / Shield damage priority
                if (z.helmHp > 0) {
                    z.helmHp -= it->damage;
                    if (z.helmHp < 0) {
                        z.bodyHp += z.helmHp;
                        z.helmHp = 0;
                    }
                } else {
                    z.bodyHp -= it->damage;
                }

                // Splash
                if (it->isSplash) {
                    for (auto& other : m_zombies) {
                        if (std::abs(other.row - it->row) <= 1 && std::abs(other.x - z.x) <= 12.0f) {
                            other.bodyHp -= (it->damage / 2);
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

    // 4. Zombie Movement, Attack and Lawnmowers
    for (auto& z : m_zombies) {
        if (z.isSlowed) {
            z.slowTimer -= dt;
            if (z.slowTimer <= 0.0f) z.isSlowed = false;
        }

        float curSpeed = z.isSlowed ? (z.speed * 0.5f) : z.speed;

        PlacedPlantEntity* blocker = nullptr;
        for (auto& p : m_plants) {
            if (p.row == z.row) {
                float plantX = p.col * 11.0f + 5.0f;
                if (z.x > plantX && z.x - plantX < 5.0f) {
                    blocker = &p;
                    break;
                }
            }
        }

        if (blocker) {
            if (m_gameTime - z.lastAttackTime >= 1.0f) {
                z.lastAttackTime = m_gameTime;
                blocker->hp -= z.attackDmg;
            }
        } else {
            z.x -= curSpeed * dt;
        }

        // Lawnmower trigger when reaches base (x <= 0)
        if (z.x <= 0.0f) {
            if (m_lawnMowers[z.row]) {
                m_lawnMowers[z.row] = false;
                addLog("🚜 [MÁY CẮT CỎ KÍCH HOẠT!] Quét sạch toàn bộ quái vật trên làn Hàng " + std::to_string(z.row + 1) + "!");
                for (auto& target : m_zombies) {
                    if (target.row == z.row) {
                        target.bodyHp = 0;
                    }
                }
            } else {
                m_isGameOver = true;
                addLog("☠️ [TỬ TRẬN] Zombie đã vượt qua phòng tuyến xâm nhập nhà dân! Trò chơi kết thúc.");
                return;
            }
        }
    }

    // 5. Cleanup dead plants and zombies
    for (auto it = m_plants.begin(); it != m_plants.end();) {
        if (it->hp <= 0) {
            const PlantDefinition* def = PlantRegistry::getInstance().getPlant(it->plantId);
            addLog("🥀 [" + (def ? def->name : it->plantId) + "] đã bị zombie cắn nát tại Hàng " + std::to_string(it->row + 1));
            it = m_plants.erase(it);
        } else {
            ++it;
        }
    }

    for (auto it = m_zombies.begin(); it != m_zombies.end();) {
        if (it->bodyHp <= 0) {
            m_zombiesKilled++;
            const ZombieDefinition* def = ZombieRegistry::getInstance().getZombie(it->zombieId);
            int rSun = def ? def->rewardSun : 25;
            int rEnergy = def ? def->rewardEnergy : 2;
            int rCore = def ? def->rewardBeastCore : 0;

            m_sunlight += rSun;
            m_energy += rEnergy;
            m_beastCores += rCore;
            
            addLog("⚔️ Tiêu diệt [" + (def ? def->name : it->zombieId) + "]! Thu hoạch +" + std::to_string(rSun) + " ☀️, +" + std::to_string(rEnergy) + " ⚡ Năng Lượng.");
            it = m_zombies.erase(it);
        } else {
            ++it;
        }
    }
}

std::string LawnGrid::renderAsciiLawn() const {
    std::ostringstream ss;
    ss << "\n============================= SÂN VƯỜN BÁC SĨ DAVE (PvZ 1) =============================\n";
    ss << "☀️ Mặt Trời: " << m_sunlight << " | ⚡ Năng Lượng: " << m_energy << " | 💎 Tinh Hạch: " << m_beastCores << " | 💀 Diệt Quái: " << m_zombiesKilled << "\n";
    ss << "----------------------------------------------------------------------------------------\n";

    for (int r = 0; r < ROWS; ++r) {
        ss << (m_lawnMowers[r] ? "🚜" : "❌") << " H" << (r + 1) << " |";
        for (int c = 0; c < COLS; ++c) {
            const PlacedPlantEntity* p = nullptr;
            for (const auto& plant : m_plants) {
                if (plant.row == r && plant.col == c) {
                    p = &plant;
                    break;
                }
            }

            if (p) {
                const PlantDefinition* def = PlantRegistry::getInstance().getPlant(p->plantId);
                ss << " [" << (def ? def->icon : "🌱") << "] ";
            } else {
                ss << "  .   ";
            }
        }

        ss << " | ";
        for (const auto& proj : m_projectiles) {
            if (proj.row == r) ss << "•";
        }
        ss << " ";
        for (const auto& z : m_zombies) {
            if (z.row == r) {
                const ZombieDefinition* def = ZombieRegistry::getInstance().getZombie(z.zombieId);
                ss << (z.isBoss ? " [🦁BOSS:" : " [🧟") << (def ? def->name : z.zombieId) << "(" << z.bodyHp << "HP," << (int)z.x << "%)]";
            }
        }
        ss << "\n";
    }
    ss << "========================================================================================\n";
    return ss.str();
}

} // namespace PvZ1
