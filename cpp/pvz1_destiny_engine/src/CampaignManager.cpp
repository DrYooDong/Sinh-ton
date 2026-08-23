#include "../include/CampaignManager.hpp"

namespace PvZ1 {

CampaignManager::CampaignManager() {
    initChapters();
}

CampaignManager& CampaignManager::getInstance() {
    static CampaignManager instance;
    return instance;
}

const CampaignChapter* CampaignManager::getChapter(int chapterNum) const {
    for (const auto& ch : m_chapters) {
        if (ch.chapterNumber == chapterNum) {
            return &ch;
        }
    }
    return nullptr;
}

void CampaignManager::initChapters() {
    m_chapters = {
        {
            1,
            "Chương 1: Kỷ Nguyên Vận Mệnh Quốc Gia",
            "Đường Phố Đô Thị Ngưng Đọng Thời Gian",
            "Đoàn Thây Ma Đường Phố",
            400,
            "Tuyết Mộc đại diện Hoa Quốc, chọn nghề Nông Dân, kích hoạt Sân Vườn Bác Sĩ Dave và dùng xẻng đập tan 9 zombie mở khóa Đậu Pháo.",
            "Tất cả cư dân Lam Tinh chú ý! Trò chơi vận mệnh quốc gia bắt đầu. Trong khi các bình luận viên Hồ Ca và Lý Băng còn đang bối rối, Tuyết Mộc lập tức chọn nghề Nông Dân, kích hoạt chiếc mũ Dave và ba lô Sân Vườn Bác Sĩ. Cầm xẻng đập bay đầu 9 con zombie, anh thu thập đủ 50 ánh sáng và 10 năng lượng để mở khóa Đậu Pháo!",
            100, 10, "plant_peashooter"
        },
        {
            2,
            "Chương 2: Cuộc Chiến Sinh Tồn",
            "Cổng Công Viên Xanh",
            "Zombie Tốc Độ & Đội Trưởng Tiên Phong",
            750,
            "Mở mảnh đất 10m², trồng Hướng Dương và Đậu Pháo bắn rơi đầu Zombie. Tái chế xác thây ma và thăng Cấp 2 tăng tuổi thọ quốc gia.",
            "Lớp dừng thời gian kết thúc! Người chơi nước Anh tử trận khiến quốc gia phải chịu phạt. Tuyết Mộc ném hạt giống xuống khu đất 10m², Hoa Hướng Dương mọc lên nhả mặt trời. Khi Đậu Pháo khai hỏa xé tan bầy quái vật, 10 tỷ khán giả toàn cầu kinh ngạc! Tuyết Mộc đạt cấp 2, tặng 1 tháng tuổi thọ cho toàn dân Hoa Quốc!",
            150, 20, "plant_sunflower"
        },
        {
            3,
            "Chương 3: Đồng Minh & Thế Lực",
            "Siêu Thị Tận Thế",
            "Thủ Lĩnh Côn Đồ & Zombie Tiến Hóa",
            1100,
            "Tiêu diệt nhóm côn đồ tàn ác, chôn xác mở khóa Thây Ma thường và thành lập thế lực Vĩnh Hằng Gia Viên cùng anh em họ Dương.",
            "Chạm trán nhóm côn đồ tống tiền tại siêu thị, Tuyết Mộc lạnh lùng gọi Đậu Pháo hạ sát tất cả. Khi chôn cất thi thể trong khu vườn, anh mở khóa khả năng điều khiển Thây Ma. Cứu được Dương Siêu và Dương Mễ Nhi, anh chính thức lập thế lực Vĩnh Hằng Gia Viên, mang lại lãnh thổ tự sinh cho quốc gia!",
            200, 30, "plant_zombie_wall"
        },
        {
            4,
            "Chương 4: Đụng Độ Quái Vật & Phe Phái",
            "Ga Tàu Điện Ngầm Ngầm Tối",
            "Zombie Sức Mạnh Cấp 2 & Yamamoto",
            1800,
            "Đội hình tam giác Thây Ma + Đậu Pháo hạ gục Zombie Sức Mạnh Cấp 2, thu nạp cao thủ đao pháp Đường Long và đánh bại Yamamoto.",
            "Tại ga tàu điện ngầm, Tuyết Mộc xếp đội hình tam giác Thây Ma phối hợp Đậu Pháo và Bom Anh Đào đánh tan Zombie Sức Mạnh Cấp 2. Cậu thu nhận Đường Long - cao thủ dùng đao sau bi kịch mất bạn gái, rồi tiến vào Đại học Nông Nghiệp đánh bại kẻ thù Yamamoto Sakura Quốc!",
            250, 45, "plant_cherry_bomb"
        },
        {
            5,
            "Chương 5: Thảm Họa Biến Dị & Tiến Hóa",
            "Khu Nhà Kính Đại Học Nông Nghiệp",
            "Zombie Bào Tử Giáp Vảy & Mèo Cam Khổng Lồ",
            2400,
            "Virus tiến hóa sinh vảy sừng kháng đạn. Mở khóa Phân Tích Bệnh Lý, kết hợp Đậu Băng, Nấm Phun và Tinh Hạch Ma Thú.",
            "Đậu Pháo bị kháng cự vì zombie mọc vảy sừng cứng. Hệ thống Dave mở khóa 'Phân Tích Bệnh Lý'. Tuyết Mộc chuyển đổi chiến thuật sang Đậu Băng làm chậm, Nấm Nam Châm tước giáp và Nấm Mê Hoặc khiến quái vật cắn xé lẫn nhau, thu thập Tinh Hạch Ma Thú từ Mèo Cam khổng lồ!",
            300, 60, "plant_snow_pea"
        },
        {
            6,
            "Chương 6: Vua Sư Tử",
            "Sân Vận Động Đại Học Nông Nghiệp",
            "Vua Sư Tử & Zombie Sức Mạnh Cấp 3",
            4500,
            "Trận đại chiến vạn quái vật. Đường Long dung hợp virus hóa Đường Tướng Quân Anh Hùng Thây Ma, Nấm Hủy Diệt nổ hạt nhân trảm sát Vua Sư Tử!",
            "Sân vận động là ổ của hàng vạn zombie do Vua Sư Tử cưỡi trên Zombie Cấp 3 chỉ huy! Đường Long liều mình chắn đòn và được Tuyết Mộc dung hợp virus hóa thành 'Đường Tướng Quân' mặc giáp xương bất khả chiến bại. Kết hợp Nấm Hạt Nhân Hủy Diệt, Tuyết Mộc nổ tung sân vận động và chặt đầu Vua Sư Tử!",
            500, 100, "plant_doom_shroom"
        },
        {
            7,
            "Chương 7: Cứu Rỗi Quốc Gia",
            "Căn Cứ Đảo Giữa Hồ",
            "Đại Quân Zombie Đột Kích Đêm Cuối",
            6000,
            "Chiết xuất Huyết Thanh Thanh Tẩy cứu người dân Hoa Quốc khỏi nan y. Đảo Giữa Hồ rực sáng Hoa Đèn Đường sẵn sàng bước vào Chiến Trường Quốc Vận!",
            "Chiến thắng mang lại chuỗi gen hoàn chỉnh, giúp Tuyết Mộc chiết xuất Huyết Thanh Thanh Tẩy truyền về hiện thực, chữa lành mọi dịch bệnh nan y cho Hoa Quốc. Đứng trên Đảo Giữa Hồ rực sáng bởi Hoa Đèn Đường bên cạnh Đường Tướng Quân, Tuyết Mộc đã sẵn sàng cho Chiến Trường Quốc Vận 30 ngày tới!",
            1000, 200, "plant_winter_melon"
        }
    };
}

} // namespace PvZ1
