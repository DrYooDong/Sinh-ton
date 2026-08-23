#include "../include/GachaSystem.hpp"
#include <iostream>
#include <ctime>

namespace PvZ2 {

GachaSystem::GachaSystem() {
    m_rng.seed(static_cast<unsigned int>(std::time(nullptr)));
}

CardRarity GachaSystem::rollRarity() {
    m_pityCount++;

    // Guaranteed S/SS at 10 pulls pity
    if (m_pityCount >= 10) {
        m_pityCount = 0;
        std::uniform_int_distribution<int> sDist(0, 100);
        return (sDist(m_rng) < 30) ? CardRarity::SS : CardRarity::S;
    }

    std::uniform_real_distribution<float> dist(0.0f, 100.0f);
    float roll = dist(m_rng);

    if (roll < 3.0f) {
        m_pityCount = 0;
        return CardRarity::SS; // 3% SS
    } else if (roll < 15.0f) {
        m_pityCount = 0;
        return CardRarity::S; // 12% S
    } else if (roll < 45.0f) {
        return CardRarity::A; // 30% A
    } else if (roll < 80.0f) {
        return CardRarity::B; // 35% B
    } else {
        return CardRarity::C; // 20% C
    }
}

std::string GachaSystem::getRandomCardOfRarity(CardRarity rarity) {
    std::vector<std::string> pool;
    for (const auto& pair : CardDatabase::getInstance().getAllCards()) {
        if (pair.second->rarity == rarity) {
            pool.push_back(pair.first);
        }
    }

    if (pool.empty()) {
        // Fallback default
        return "peashooter_devourer";
    }

    std::uniform_int_distribution<size_t> dist(0, pool.size() - 1);
    return pool[dist(m_rng)];
}

std::vector<SummonResult> GachaSystem::performSummon(Player& player, int times) {
    std::vector<SummonResult> results;
    int costDiamonds = (times == 10) ? 135 : (times * 15); // 10% discount for x10

    if (!player.spendDiamonds(costDiamonds)) {
        std::cout << "[LỖI GACHA] Không đủ Kim Cương! Cần " << costDiamonds << " 💎\n";
        return results;
    }

    const auto& unlocked = player.getUnlockedCards();

    for (int i = 0; i < times; ++i) {
        CardRarity rarity = rollRarity();
        std::string cardId = getRandomCardOfRarity(rarity);
        const CardDefinition* def = CardDatabase::getInstance().getCard(cardId);

        SummonResult res;
        res.cardId = cardId;
        res.cardName = def ? def->name : cardId;
        res.rarity = rarity;

        bool alreadyHas = std::find(unlocked.begin(), unlocked.end(), cardId) != unlocked.end();
        if (!alreadyHas) {
            res.isNew = true;
            res.convertedSouls = 0;
            player.unlockCard(cardId);
        } else {
            res.isNew = false;
            int souls = (rarity == CardRarity::SS) ? 150 : (rarity == CardRarity::S) ? 80 : 30;
            res.convertedSouls = souls;
            player.addSpiritSouls(souls);
        }

        results.push_back(res);
    }

    return results;
}

} // namespace PvZ2
