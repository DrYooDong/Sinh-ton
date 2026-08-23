#pragma once
#include <string>
#include <vector>
#include <memory>

namespace PvZ1 {

struct CampaignChapter {
    int chapterNumber;
    std::string title;
    std::string location;
    std::string bossName;
    int bossHp;
    std::string synopsis;
    std::string storyText;
    int rewardSun;
    int rewardEnergy;
    std::string unlockPlantId;
};

class CampaignManager {
public:
    static CampaignManager& getInstance();
    const CampaignChapter* getChapter(int chapterNum) const;
    const std::vector<CampaignChapter>& getAllChapters() const { return m_chapters; }

private:
    CampaignManager();
    void initChapters();
    std::vector<CampaignChapter> m_chapters;
};

} // namespace PvZ1
