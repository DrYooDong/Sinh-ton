#include "../include/Skill.hpp"

namespace Ktx {

SkillRegistry::SkillRegistry() {
    initSkills();
}

SkillRegistry& SkillRegistry::getInstance() {
    static SkillRegistry instance;
    return instance;
}

const Skill* SkillRegistry::getSkill(const std::string& id) const {
    auto it = m_skills.find(id);
    if (it != m_skills.end()) {
        return it->second.get();
    }
    return nullptr;
}

const std::unordered_map<std::string, std::shared_ptr<Skill>>& SkillRegistry::getAllSkills() const {
    return m_skills;
}

void SkillRegistry::initSkills() {
    // 1. Chúa Tể Dung Hợp (Lord Fusion EX)
    m_skills["skill_lord_fusion"] = std::make_shared<Skill>(
        "skill_lord_fusion", "Chúa Tể Dung Hợp & Thức Tỉnh", SkillTier::EX,
        "Duy trì trạng thái nghỉ ngơi để sản sinh Tiền Chúa Tể. Cường hóa, tái cấu trúc và dung hợp vạn vật trong KTX.",
        "👑", 0, 0, SkillEffectType::Extract, 100, 1, 10,
        "Thiên phú tối thượng của Tuyết Mộc giúp biến phòng 200 thành pháo đài bất khả xâm phạm."
    );

    // 2. Siêu Trực Giác (Super Intuition SSS)
    m_skills["skill_super_intuition"] = std::make_shared<Skill>(
        "skill_super_intuition", "Siêu Trực Giác Thần Thánh", SkillTier::SSS,
        "Tăng 100% độ chính xác, bắn trúng mục tiêu tàng hình trong bóng tối và miễn nhiễm đòn đánh lén.",
        "👁️", 15, 3, SkillEffectType::Buff, 50, 1, 5,
        "Được khai mở sau khi nhận danh hiệu Ký Túc Xá Phong Vương."
    );

    // 3. Quỷ Đồng Định Thân (Ghost Child Stun S)
    m_skills["skill_ghost_stun"] = std::make_shared<Skill>(
        "skill_ghost_stun", "Quỷ Đồng Định Thân Thuật", SkillTier::S,
        "Quỷ Đồng gầm thét làm tê liệt và khóa cứng toàn bộ kẻ địch trong 2 lượt.",
        "👻", 25, 4, SkillEffectType::Control, 80, 1, 5,
        "Kỹ năng trứ danh từng kết liễu kẻ cướp phòng Hoàng Dũng trong chớp mắt."
    );

    // 4. Ánh Bạc Lôi Đình (Silver Lightning Shot A)
    m_skills["skill_silver_lightning"] = std::make_shared<Skill>(
        "skill_silver_lightning", "Phát Bắn Lôi Đình Xuyên Phá", SkillTier::A,
        "Bắn luồng đạn bạc mang điện tích phá hủy liên kết tế bào, gây 350% sát thương chuẩn.",
        "⚡", 20, 2, SkillEffectType::Damage, 350, 1, 5,
        "Khai hỏa từ súng lục hợp kim Glock-17 cải tiến."
    );

    // 5. Bách Quỷ Huyết Khế (100 Ghosts Blood Pact SS)
    m_skills["skill_hundred_ghosts"] = std::make_shared<Skill>(
        "skill_hundred_ghosts", "Bách Quỷ Huyết Khế Ma Pháp", SkillTier::SS,
        "Triệu hồi 3 Tiểu Quỷ và Song Quỷ Pháp Sư tấn công dồn dập, tạo lá chắn hút 50% sát thương.",
        "🔮", 40, 5, SkillEffectType::Shield, 400, 1, 5,
        "Bí pháp ngự quỷ đỉnh cao của Vương Như Huyên."
    );

    // 6. Kiếm Vũ Cổ Truyền (Ancient Sword Dance S)
    m_skills["skill_sword_dance"] = std::make_shared<Skill>(
        "skill_sword_dance", "Huyết Thệ Trảm Hồn Kiếm Vũ", SkillTier::S,
        "Tung ra 7 nhát chém phủ độc liên hoàn, gây sát thương chí mạng và giảm 50% phòng thủ mục tiêu.",
        "⚔️", 30, 3, SkillEffectType::Damage, 420, 1, 5,
        "Kiếm pháp gia truyền tuyệt hảo của nữ kiếm khách Hứa Thanh Nhiên."
    );
}

} // namespace Ktx
