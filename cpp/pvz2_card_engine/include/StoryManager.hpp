#pragma once
#include <string>
#include <vector>
#include <memory>
#include <functional>

namespace PvZ2 {

struct StoryChoice {
    std::string text;
    std::string outcomeText;
    int rewardSun = 0;
    int rewardSouls = 0;
    int grantPlantFood = 0;
    std::string grantCardId;
};

struct StoryArc {
    int id;
    std::string title;
    std::string subtitle;
    std::string location;
    std::string bossName;
    int bossLevel;
    std::string synopsis;
    std::string fullStory;
    std::vector<StoryChoice> choices;
};

class StoryManager {
public:
    static StoryManager& getInstance();
    const StoryArc* getArc(int arcId) const;
    const std::vector<StoryArc>& getAllArcs() const { return m_arcs; }

private:
    StoryManager();
    void initArcs();
    std::vector<StoryArc> m_arcs;
};

} // namespace PvZ2
