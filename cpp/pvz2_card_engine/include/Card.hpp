#pragma once
#include "Types.hpp"
#include <string>
#include <vector>
#include <memory>
#include <unordered_map>

namespace PvZ2 {

class CardDefinition {
public:
    std::string id;
    std::string name;
    std::string vietnameseTitle;
    std::string nickname;
    CardRarity rarity;
    CardCategory category;
    int sunCost;
    float cooldownSec;
    int health;
    int damage;
    float attackSpeedSec;
    std::string description;
    std::string lore;
    std::string voiceQuote;
    std::string plantFoodEffect;
    std::string avatarColor;
    std::vector<std::string> tags;

    CardDefinition(
        std::string id,
        std::string name,
        std::string vietnameseTitle,
        std::string nickname,
        CardRarity rarity,
        CardCategory category,
        int sunCost,
        float cooldownSec,
        int health,
        int damage,
        float attackSpeedSec,
        std::string description,
        std::string lore,
        std::string voiceQuote,
        std::string plantFoodEffect,
        std::vector<std::string> tags = {}
    ) : id(std::move(id)),
        name(std::move(name)),
        vietnameseTitle(std::move(vietnameseTitle)),
        nickname(std::move(nickname)),
        rarity(rarity),
        category(category),
        sunCost(sunCost),
        cooldownSec(cooldownSec),
        health(health),
        damage(damage),
        attackSpeedSec(attackSpeedSec),
        description(std::move(description)),
        lore(std::move(lore)),
        voiceQuote(std::move(voiceQuote)),
        plantFoodEffect(std::move(plantFoodEffect)),
        tags(std::move(tags)) {}
};

class CardDatabase {
public:
    static CardDatabase& getInstance();
    const CardDefinition* getCard(const std::string& id) const;
    const std::unordered_map<std::string, std::shared_ptr<CardDefinition>>& getAllCards() const;

private:
    CardDatabase();
    void initializeCards();
    std::unordered_map<std::string, std::shared_ptr<CardDefinition>> m_cards;
};

} // namespace PvZ2
