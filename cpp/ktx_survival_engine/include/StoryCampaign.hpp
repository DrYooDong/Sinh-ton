#pragma once
#include <string>
#include <vector>
#include <memory>

namespace Ktx {

struct KtxChapter {
    int chapterNumber;
    std::string title;
    std::string location;
    std::string bossName;
    int bossHp;
    int bossAtk;
    int bossDef;
    std::string synopsis;
    std::string fullStory;
    int rewardCoins;
    int rewardExp;
    std::string unlockItemOrSkill;
};

class StoryCampaign {
public:
    static StoryCampaign& getInstance();
    const KtxChapter* getChapter(int chapterNum) const;
    const std::vector<KtxChapter>& getAllChapters() const { return m_chapters; }

private:
    StoryCampaign();
    void initChapters();
    std::vector<KtxChapter> m_chapters;
};

} // namespace Ktx
