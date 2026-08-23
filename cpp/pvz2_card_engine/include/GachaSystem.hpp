#pragma once
#include "Types.hpp"
#include "Card.hpp"
#include "Player.hpp"
#include <string>
#include <vector>
#include <random>

namespace PvZ2 {

struct SummonResult {
    std::string cardId;
    std::string cardName;
    CardRarity rarity;
    bool isNew;
    int convertedSouls;
};

class GachaSystem {
public:
    GachaSystem();
    std::vector<SummonResult> performSummon(Player& player, int times = 1);
    int getPityCount() const { return m_pityCount; }

private:
    int m_pityCount = 0;
    std::mt19937 m_rng;
    CardRarity rollRarity();
    std::string getRandomCardOfRarity(CardRarity rarity);
};

} // namespace PvZ2
