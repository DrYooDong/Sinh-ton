#include "../include/StoryCampaign.hpp"

namespace Ktx {

StoryCampaign::StoryCampaign() {
    initChapters();
}

StoryCampaign& StoryCampaign::getInstance() {
    static StoryCampaign instance;
    return instance;
}

const KtxChapter* StoryCampaign::getChapter(int chapterNum) const {
    for (const auto& ch : m_chapters) {
        if (ch.chapterNumber == chapterNum) {
            return &ch;
        }
    }
    return nullptr;
}

void StoryCampaign::initChapters() {
    m_chapters = {
        {
            1,
            "Chương 1: Khởi Đầu Hỗn Loạn – Thức Tỉnh Thiên Phú Chúa Tể",
            "Ký Túc Xá Tầng 10 - Phòng 200",
            "Côn Đồ Vương Đại Tráng & Zombie Sơ Cấp",
            500, 35, 15,
            "Tuyết Mộc thức tỉnh Thiên Phú Chúa Tể Dung Hợp cùng hoa khôi Tinh Thần. Nâng cấp cửa hợp kim, đánh gãy chân Vương Đại Tráng và cản phá đợt sương máu thứ nhất.",
            "Tuyết Mộc mở mắt trong căn phòng 200 ẩm mốc bên cạnh hoa khôi Tinh Thần hoảng loạn. Hệ thống kích hoạt 'Chúa Tể Dung Hợp', phát hiện Tinh Thần tăng +96% tốc độ sản xuất Tiền Chúa Tể. Khi Vương Đại Tráng phá cửa cướp bóc, Tuyết Mộc cường hóa cửa thành khối hợp kim khiến hắn gãy chân. Đêm xuống, đàn Zombie sơ cấp đập cửa vô vọng trong khi Tuyết Mộc bình thản đi ngủ tích lũy tiền!",
            300, 150, "Cửa Hợp Kim Cấp 1"
        },
        {
            2,
            "Chương 2: Xây Dựng Cứ Điểm – Chiêu Mộ Đồng Minh & Bẫy Tiến Hóa",
            "Hành Lang Tầng 10 & Nhà Thi Đấu",
            "Zombie Tàng Hình & Zombie Khổng Lồ Cấp 3",
            1200, 75, 40,
            "Cứu Vương Như Huyên (Ngự Quỷ Sư SS). Nâng cấp Máy Lọc Nước Cấp 2. Dùng Glock-17 Ánh Bạc Lôi Đình bắn gục Zombie Tàng Hình và Zombie Khổng Lồ leo tầng.",
            "Tuyết Mộc thu nạp Vương Như Huyên nâng sản lượng tiền lên 200%, lắp Máy Lọc Nước 18L/ngày. Khi Nhà Thi Đấu vỡ trận và Zombie Khổng Lồ Cấp 3 tràn lên tầng 10, Tuyết Mộc cường hóa Glock-17 thành Ánh Bạc Lôi Đình nã đạn xuyên phá hạ gục cả Zombie Tàng Hình lẫn Zombie Khổng Lồ, leo thẳng lên Top 1 Toàn Server!",
            600, 300, "wpn_glock_lightning"
        },
        {
            3,
            "Chương 3: Phong Vương Đệ Nhất – Đêm Hồi Hồn & Thư Mời Minh Phủ",
            "Phòng 200 Phong Vương",
            "Oán Linh Báo Thù & Kẻ Cướp Phòng Hoàng Dũng",
            2000, 110, 60,
            "Đạt danh hiệu Phong Vương, nhận Quỷ Đồng Hộ Mệnh và Siêu Trực Giác. Xử tử Hoàng Dũng bằng nỏ thép, chiêu mộ Hứa Thanh Nhiên, dâng Bát Sứ cho Âm Sai nhận Thư Mời Minh Phủ.",
            "Phòng 200 trở thành căn hộ cao cấp phong vương. Hoàng Dũng kéo quân cướp phòng liền bị Quỷ Đồng định thân và nỏ hắc thiết bắn nát. Liễu Như Yên cảnh báo điểm thù hận, Tuyết Mộc chiêu mộ kiếm khách Hứa Thanh Nhiên. Đêm Hồi Hồn, Quỷ Đồng hút sạch oán linh vào bụng, Tuyết Mộc dâng Bát Sứ Thanh Hoa cho Âm Sai Minh Phủ nhận tấm Thư Mời Thần Bí!",
            1000, 500, "item_underworld_invitation"
        },
        {
            4,
            "Chương 4: Điểm Yếu Dân Gian – Cuộc Càn Quét Thập Đại Ác Nhân",
            "10 Tầng Lầu Ký Túc Xá",
            "Thi Khôi Tầng 10 (Kim Tiêu Ngọc Y)",
            3500, 160, 90,
            "Dùng Huyết Thanh Hoàng Kim (+25 thuộc tính), Cổ Thư Dị Văn Dân Gian càn quét 10 Boss: Thi Khôi, Lang Man, Quỷ Thư Sinh, Phong Cương, Hồ Yêu và mở Máy Thu Thanh.",
            "Vòng chung kết ập đến với 10 con Boss cấp 4. Tuyết Mộc uống Huyết Thanh Hoàng Kim, dùng máu chó mực phá Kim Cương Thân của Thi Khôi đoạt Giáp Kim Tiêu Ngọc Y, dùng kiếm độc diệt Lang Man, thôi miên Quỷ Thư Sinh và chém nát con rối Phong Cương. Thu về 100.000 Tiền Vàng và kích hoạt Máy Thu Thanh Đa Chiều!",
            2500, 1200, "arm_golden_jade"
        },
        {
            5,
            "Chương 5: Sóng Radio Bí Ẩn – Hội Tương Trợ Huyết Vụ",
            "Kênh Radio 107.5MHz & Đáy Hồ Đồng Hồ",
            "Thủy Quái Hồ Đồng Hồ & Oán Linh Sương Mù",
            4800, 210, 120,
            "Bắt sóng Radio Hội Tương Trợ Huyết Vụ (Đao Khách Dạ Vũ Top 97). Tuyển Lô Nương 500 xu/ngày, Như Huyên mở Bách Quỷ Huyết Khế, lặn đáy hồ lấy Khiên Trụ Phản Xạ.",
            "Radio bắt được sóng bí mật của Top 100 thế giới: KTX chỉ là một 'Tế Đàn' sắp bị sáp nhập. Tuyết Mộc chiêu mộ cựu giảng viên Lô Nương tăng 500 xu/ngày, cùng Như Huyên mở khóa Bách Quỷ Huyết Khế ma thuật và tìm ra Khiên Trụ Phản Xạ Cấp 3 dưới đáy hồ Đồng Hồ!",
            4000, 2000, "skill_hundred_ghosts"
        },
        {
            6,
            "Chương 6: Đêm Cực Hàn & Đại Chiến Song Quỷ Chi Vương",
            "Hành Lang Bão Tuyết -40°C",
            "Dạ Mị Ma Cà Rồng & Binh Đoàn Asith",
            6500, 280, 160,
            "Đêm Cực Hàn -40°C buông xuống. Đánh sập phe đầu cơ da sói thu 800k Tiền Chúa Tể. Nâng cấp Pháo Đài Kẻ Phân Tách Không Gian tiêu diệt 10 Ma Cà Rồng Thuần Huyết.",
            "Nhiệt độ rơi xuống -40°C do ma pháp của Boss Asith. Tuyết Mộc xả kho da sói thu về 800.000 Tiền Chúa Tể đánh sập tài phiệt đầu cơ. Anh nâng cấp Pháo Đài Kẻ Phân Tách Không Gian, dùng Siêu Trực Giác nã đạn pháo trong đêm tối Dạ Mị quét sạch 10 Ma Cà Rồng Thuần Huyết, thu 10 viên Huyết Tinh!",
            8000, 4000, "Pháo Đài Kẻ Phân Tách Cấp 6"
        },
        {
            7,
            "Chương 7: Bước Ra Sương Mù – Hướng Tới Thành Phố Hoang Tàn",
            "Tầng 10 Ký Túc Xá – Cửa Sổ Vỡ",
            "Song Quỷ Chi Vương (Asith - Cấp 12)",
            12000, 450, 240,
            "Quyết chiến Asith Cuồng Huyết. Dung hợp Hàn Khí Cực Hạn vào nỏ phá thành đóng đinh Asith. Đoạt Bản Đồ Phân Vùng 09, bước vào Thế Giới Sương Mù Máu!",
            "Asith giáng lâm chém rách cửa siêu hợp kim! Tuyết Mộc thức tỉnh Chúa Tể Dung Hợp Cấp 2, dồn khí lạnh vào nỏ công trình bắn mũi tên tím xuyên lồng ngực Asith đóng đinh lên lan can. Lửa Minh Hỏa và kiếm Thanh Nhiên kết liễu Boss! Nhặt Bản Đồ Quân Sự Phân Vùng 09, Tuyết Mộc cùng đồng đội sẵn sàng bước ra Thế Giới Sương Mù Máu!",
            20000, 10000, "Bản Đồ Phân Vùng 09"
        }
    };
}

} // namespace Ktx
