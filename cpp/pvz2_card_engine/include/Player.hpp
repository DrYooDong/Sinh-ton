#pragma once
#include "Types.hpp"
#include "Card.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>

namespace PvZ2 {

struct CampUpgrades {
    int laQuanHeadquarters = 1;
    int tuyetTinhScouts = 1;
    int yosukeDojo = 1;
    int goldenGarden = 1;
};

class Player {
public:
    Player(std::string name = "Tuyết Mộc");

    // Getters
    const std::string& getName() const { return m_name; }
    int getLevel() const { return m_level; }
    int getExp() const { return m_exp; }
    int getMaxExp() const { return m_maxExp; }
    int getSunlight() const { return m_sunlight; }
    int getSpiritSouls() const { return m_spiritSouls; }
    int getDiamonds() const { return m_diamonds; }
    int getPlantFood() const { return m_plantFood; }
    int getGoldenWateringCharges() const { return m_goldenWateringCharges; }
    int getCurrentArcId() const { return m_currentArcId; }
    const std::string& getEquippedFusion() const { return m_equippedFusion; }
    const std::vector<std::string>& getActiveDeck() const { return m_activeDeck; }
    const std::vector<std::string>& getUnlockedCards() const { return m_unlockedCards; }
    const CampUpgrades& getCampUpgrades() const { return m_campUpgrades; }

    // Currency Operations
    void addSunlight(int amount) { m_sunlight += amount; }
    bool spendSunlight(int amount);
    void addSpiritSouls(int amount) { m_spiritSouls += amount; }
    bool spendSpiritSouls(int amount);
    void addDiamonds(int amount) { m_diamonds += amount; }
    bool spendDiamonds(int amount);

    // Progression
    void addExp(int amount);
    void completeArc(int arcId);
    void unlockCard(const std::string& cardId);
    bool setDeck(const std::vector<std::string>& deck);
    void setEquippedFusion(const std::string& fusionId) { m_equippedFusion = fusionId; }
    void setCurrentArcId(int arcId) { m_currentArcId = arcId; }

    // Camp Upgrades
    bool upgradeCampBuilding(const std::string& building);

    // Card Upgrading
    int getCardLevel(const std::string& cardId) const;
    bool upgradeCard(const std::string& cardId);

private:
    std::string m_name;
    int m_level = 1;
    int m_exp = 0;
    int m_maxExp = 100;
    int m_sunlight = 400;
    int m_spiritSouls = 350;
    int m_diamonds = 150;
    int m_plantFood = 3;
    int m_goldenWateringCharges = 3;
    int m_currentArcId = 1;
    std::string m_equippedFusion = "balloon_zombie";

    std::vector<int> m_completedArcs;
    std::vector<std::string> m_unlockedCards;
    std::vector<std::string> m_activeDeck;
    std::unordered_map<std::string, int> m_cardLevels;
    CampUpgrades m_campUpgrades;
};

} // namespace PvZ2
