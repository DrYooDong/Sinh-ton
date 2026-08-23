#pragma once
#include <string>
#include <vector>
#include <memory>

namespace PvZ2 {

struct FusionTransformation {
    std::string id;
    std::string name;
    std::string description;
    std::string buffEffect;
    std::string lore;
};

class FusionSystem {
public:
    static FusionSystem& getInstance();
    const std::vector<FusionTransformation>& getAllFusions() const { return m_fusions; }
    const FusionTransformation* getFusion(const std::string& id) const;

private:
    FusionSystem();
    void initFusions();
    std::vector<FusionTransformation> m_fusions;
};

} // namespace PvZ2
