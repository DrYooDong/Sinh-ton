#include "../include/Player.hpp"
#include <iostream>

namespace PvZ2 {

Player::Player(std::string name) : m_name(std::move(name)) {
    // Initial starter unlocked cards
    m_unlockedCards = {
        "sunflower",
        "peashooter_devourer",
        "giant_walnut",
        "newspaper_zombie",
        "chomper",
        "cherry_bomb",
        "magnet_shroom"
    };

    // Initial 6-card starter deck
    m_activeDeck = {
        "sunflower",
        "peashooter_devourer",
        "giant_walnut",
        "newspaper_zombie",
        "chomper",
        "cherry_bomb"
    };

    for (const auto& cardId : m_unlockedCards) {
        m_cardLevels[cardId] = 1;
    }
}

bool Player::spendSunlight(int amount) {
    if (m_sunlight >= amount) {
        m_sunlight -= amount;
        return true;
    }
    return false;
}

bool Player::spendSpiritSouls(int amount) {
    if (m_spiritSouls >= amount) {
        m_spiritSouls -= amount;
        return true;
    }
    return false;
}

bool Player::spendDiamonds(int amount) {
    if (m_diamonds >= amount) {
        m_diamonds -= amount;
        return true;
    }
    return false;
}

void Player::addExp(int amount) {
    m_exp += amount;
    while (m_exp >= m_maxExp) {
        m_exp -= m_maxExp;
        m_level++;
        m_maxExp = static_cast<int>(m_maxExp * 1.5f);
        m_diamonds += 20;
        std::cout << "🎉 [THĂNG CẤP] Tuyết Mộc đã đạt Cấp " << m_level << "! Thưởng +20 Kim Cương 💎\n";
    }
}

void Player::completeArc(int arcId) {
    if (std::find(m_completedArcs.begin(), m_completedArcs.end(), arcId) == m_completedArcs.end()) {
        m_completedArcs.push_back(arcId);
        if (arcId < 5) {
            m_currentArcId = arcId + 1;
        }
    }
}

void Player::unlockCard(const std::string& cardId) {
    if (std::find(m_unlockedCards.begin(), m_unlockedCards.end(), cardId) == m_unlockedCards.end()) {
        m_unlockedCards.push_back(cardId);
        m_cardLevels[cardId] = 1;
        std::cout << "✨ [MỞ KHÓA THẺ BÀI MỚI] Đã thu nạp thẻ bài: " << cardId << " vào Bách Khoa Toàn Thư!\n";
    }
}

bool Player::setDeck(const std::vector<std::string>& deck) {
    if (deck.empty() || deck.size() > 8) return false;
    m_activeDeck = deck;
    return true;
}

int Player::getCardLevel(const std::string& cardId) const {
    auto it = m_cardLevels.find(cardId);
    if (it != m_cardLevels.end()) {
        return it->second;
    }
    return 1;
}

bool Player::upgradeCard(const std::string& cardId) {
    int currentLvl = getCardLevel(cardId);
    int cost = currentLvl * 100;
    if (spendSpiritSouls(cost)) {
        m_cardLevels[cardId] = currentLvl + 1;
        std::cout << "🌟 [CƯỜNG HÓA THẺ BÀI] " << cardId << " đã nâng cấp lên Cấp " << (currentLvl + 1) << "!\n";
        return true;
    }
    return false;
}

bool Player::upgradeCampBuilding(const std::string& building) {
    if (building == "laQuan") {
        if (spendSpiritSouls(m_campUpgrades.laQuanHeadquarters * 150)) {
            m_campUpgrades.laQuanHeadquarters++;
            return true;
        }
    } else if (building == "tuyetTinh") {
        if (spendSpiritSouls(m_campUpgrades.tuyetTinhScouts * 120)) {
            m_campUpgrades.tuyetTinhScouts++;
            return true;
        }
    } else if (building == "yosuke") {
        if (spendSpiritSouls(m_campUpgrades.yosukeDojo * 180)) {
            m_campUpgrades.yosukeDojo++;
            return true;
        }
    } else if (building == "goldenGarden") {
        if (spendSpiritSouls(m_campUpgrades.goldenGarden * 250)) {
            m_campUpgrades.goldenGarden++;
            return true;
        }
    }
    return false;
}

} // namespace PvZ2
