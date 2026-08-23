#include "../include/FusionSystem.hpp"

namespace PvZ2 {

FusionSystem::FusionSystem() {
    initFusions();
}

FusionSystem& FusionSystem::getInstance() {
    static FusionSystem instance;
    return instance;
}

const FusionTransformation* FusionSystem::getFusion(const std::string& id) const {
    for (const auto& f : m_fusions) {
        if (f.id == id) {
            return &f;
        }
    }
    return nullptr;
}

void FusionSystem::initFusions() {
    m_fusions = {
        {
            "balloon_zombie",
            "Dung Hợp: Zombie Bóng Bay",
            "Tuyết Mộc nhập thể Zombie Bóng Bay, bay lơ lửng né tránh đòn đánh mặt đất.",
            "+30% Tốc độ di chuyển, Miễn nhiễm 100% bẫy chông và độc gai trên mặt đất.",
            "Pha nhập thể thót tim tại Bí Cảnh Khe Nứt được Tiểu Thôn nhả bóng quỷ ứng cứu."
        },
        {
            "gatling_peashooter",
            "Dung Hợp: Chiến Cơ Măng Tây Gatling",
            "Tuyết Mộc dung hợp khẩu pháo Gatling xả mưa đạn xuyên thấu.",
            "+50% Sát thương tầm xa cho toàn bộ quân Thực Vật trên cùng hàng.",
            "Tuyệt kỹ hỏa lực tối thượng sau khi lừa Xạ Thủ nuốt súng phòng vệ của La Quân."
        },
        {
            "bobsled_team",
            "Dung Hợp: Zombie Xe Trượt Tuyết",
            "Cải tạo chiến xa điện chạy bằng Nấm Điện, xuyên phá rừng sâu rậm rạp.",
            "Tạo đường băng tăng 40% tốc đánh cho đồng đội và đâm choáng quái vật.",
            "Vụ phóng xe trớ trêu đi chệch hàng chục km vì Hoa Hướng Dương mải đuổi theo mặt trời lặn."
        }
    };
}

} // namespace PvZ2
