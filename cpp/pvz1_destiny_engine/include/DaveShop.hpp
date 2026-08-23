#pragma once
#include <string>
#include <vector>
#include <unordered_map>

namespace PvZ1 {

struct DaveUpgrade {
    std::string id;
    std::string name;
    std::string desc;
    int costEnergy;
    int level;
    int maxLevel;
};

class DaveShop {
public:
    DaveShop();
    bool buyUpgrade(const std::string& id, int& playerEnergy);
    const std::vector<DaveUpgrade>& getUpgrades() const { return m_upgrades; }
    
    // Shovel brigade stats
    int getShovelSquadCapacity() const { return m_shovelSquadCapacity; }
    void expandShovelSquad() { m_shovelSquadCapacity += 5; }

    // Pathology Decryption
    float getDecryptionProgress() const { return m_decryptionProgress; }
    void addBeastCores(int amount);

private:
    std::vector<DaveUpgrade> m_upgrades;
    int m_shovelSquadCapacity = 10;
    float m_decryptionProgress = 0.0f;
};

} // namespace PvZ1
