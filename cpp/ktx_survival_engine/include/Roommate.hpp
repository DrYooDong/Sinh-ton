#pragma once
#include <string>
#include <vector>
#include <memory>

namespace Ktx {

class Roommate {
public:
    std::string id;
    std::string name;
    std::string title;
    std::string avatar;
    int level;
    int bond; // 0 - 100
    int bonusCoinPct; // % production boost
    std::string specialty;
    std::string signatureSkill;
    std::string dialogue;
    bool isRecruited;

    Roommate(
        std::string id,
        std::string name,
        std::string title,
        std::string avatar,
        int level,
        int bond,
        int bonusCoinPct,
        std::string specialty,
        std::string signatureSkill,
        std::string dialogue,
        bool isRecruited = false
    ) : id(std::move(id)),
        name(std::move(name)),
        title(std::move(title)),
        avatar(std::move(avatar)),
        level(level),
        bond(bond),
        bonusCoinPct(bonusCoinPct),
        specialty(std::move(specialty)),
        signatureSkill(std::move(signatureSkill)),
        dialogue(std::move(dialogue)),
        isRecruited(isRecruited) {}
};

class RoommateManager {
public:
    static RoommateManager& getInstance();
    const Roommate* getRoommate(const std::string& id) const;
    std::vector<Roommate>& getAllRoommates() { return m_roommates; }
    void recruit(const std::string& id);

private:
    RoommateManager();
    void initRoommates();
    std::vector<Roommate> m_roommates;
};

} // namespace Ktx
