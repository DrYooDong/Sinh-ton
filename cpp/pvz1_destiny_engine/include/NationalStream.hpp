#pragma once
#include "Pvz1Types.hpp"
#include <string>
#include <vector>
#include <deque>

namespace PvZ1 {

class NationalStream {
public:
    NationalStream();
    void addComment(const std::string& author, const std::string& content, const std::string& flag, const std::string& tag = "Fan");
    void triggerMcCommentary(const std::string& eventType, const std::string& context = "");
    void updateNationalStats(int zombiesKilled, int wavesCompleted);

    const NationalStats& getStats() const { return m_stats; }
    const std::deque<LiveComment>& getLiveFeed() const { return m_comments; }

private:
    NationalStats m_stats;
    std::deque<LiveComment> m_comments;
};

} // namespace PvZ1
