#include "../include/Roommate.hpp"

namespace Ktx {

RoommateManager::RoommateManager() {
    initRoommates();
}

RoommateManager& RoommateManager::getInstance() {
    static RoommateManager instance;
    return instance;
}

const Roommate* RoommateManager::getRoommate(const std::string& id) const {
    for (const auto& r : m_roommates) {
        if (r.id == id) {
            return &r;
        }
    }
    return nullptr;
}

void RoommateManager::recruit(const std::string& id) {
    for (auto& r : m_roommates) {
        if (r.id == id) {
            r.isRecruited = true;
            break;
        }
    }
}

void RoommateManager::initRoommates() {
    m_roommates = {
        {
            "tinh_than", "Tinh Thần", "Hoa Khôi Lạnh Lùng", "❄️",
            1, 60, 96, "Bắn Tỉa Tầm Xa & Hỗ Trợ Tinh Thần",
            "Tia Chớp Bạc Chuẩn Xác",
            "Tuyết Mộc... chừng nào cậu còn ở đây, tôi sẽ không sợ hãi bất cứ điều gì nữa.",
            true // Starter roommate in room 200
        },
        {
            "vuong_nhu_huyen", "Vương Như Huyên", "Ngự Quỷ Sư SS", "🔮",
            1, 40, 90, "Câu Hồn, Phong Ấn & Bách Quỷ Huyết Khế",
            "Lốc Xoáy Hắc Ám Thôn Phệ Oán Linh",
            "Em xin thề sẽ tuyệt đối phục tùng mệnh lệnh của anh Tuyết Mộc!",
            true // Rescued in Chapter 2
        },
        {
            "hua_thanh_nhien", "Hứa Thanh Nhiên", "Nữ Kiếm Khách Cổ Truyền", "⚔️",
            1, 30, 75, "Trảm Kích Cận Chiến & Kiếm Độc Phá Giáp",
            "Huyết Thệ Trảm Hồn Kiếm Vũ",
            "Thanh kiếm này chỉ rút ra vì sự an nguy của căn phòng 200.",
            false
        },
        {
            "lieu_nhu_yen", "Liễu Như Yên", "Du Hiệp Sương Mù", "🎭",
            1, 20, 60, "Trinh Sát Vùng Hoang Dã & Cảnh Báo Thù Hận",
            "Sương Mù Ẩn Tích",
            "Cẩn thận điểm thù hận đấy, anh không muốn làm con mồi số một của quái vật đâu.",
            false
        },
        {
            "lo_nuong", "Lô Nương", "Cựu Giảng Viên Ngoại Ngữ", "📖",
            1, 10, 120, "Quản Lý Tài Nguyên & Tăng Sản Lượng",
            "Khuếch Đại Thoải Mái 97 Điểm",
            "Cứ để sổ sách và tài chính ký túc xá cho tôi quán xuyến nhé.",
            false
        }
    };
}

} // namespace Ktx
