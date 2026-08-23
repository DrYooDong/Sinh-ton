#pragma once
#include "KtxTypes.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

namespace Ktx {

struct ItemStats {
    int atk = 0;
    int def = 0;
    int hp = 0;
    int mp = 0;
    int stamina = 0;
    int critRate = 0;
    int lifeSteal = 0;
};

class Item {
public:
    std::string id;
    std::string name;
    std::string description;
    ItemRarity rarity;
    ItemCategory category;
    std::string icon;
    int quantity;
    bool stackable;
    int value;
    int enhanceLevel = 0; // +1 to +15
    ItemStats stats;

    Item(
        std::string id,
        std::string name,
        std::string description,
        ItemRarity rarity,
        ItemCategory category,
        std::string icon,
        int quantity,
        bool stackable,
        int value,
        ItemStats stats = {}
    ) : id(std::move(id)),
        name(std::move(name)),
        description(std::move(description)),
        rarity(rarity),
        category(category),
        icon(std::move(icon)),
        quantity(quantity),
        stackable(stackable),
        value(value),
        stats(stats) {}
};

class ItemRegistry {
public:
    static ItemRegistry& getInstance();
    const Item* getItem(const std::string& id) const;
    const std::unordered_map<std::string, std::shared_ptr<Item>>& getAllItems() const;

private:
    ItemRegistry();
    void initItems();
    std::unordered_map<std::string, std::shared_ptr<Item>> m_items;
};

} // namespace Ktx
