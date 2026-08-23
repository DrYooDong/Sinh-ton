#include "../include/StoryManager.hpp"

namespace PvZ2 {

StoryManager::StoryManager() {
    initArcs();
}

StoryManager& StoryManager::getInstance() {
    static StoryManager instance;
    return instance;
}

const StoryArc* StoryManager::getArc(int arcId) const {
    for (const auto& arc : m_arcs) {
        if (arc.id == arcId) {
            return &arc;
        }
    }
    return nullptr;
}

void StoryManager::initArcs() {
    // ARC 1
    StoryArc arc1;
    arc1.id = 1;
    arc1.title = "Giai Đoạn 1: Sân Thượng Tử Thần";
    arc1.subtitle = "Sự Trỗi Dậy Của 'Nông Dân' Tuyết Mộc";
    arc1.location = "Sân Thượng Tòa Nhà Hoang Tàn";
    arc1.bossName = "Bầy Zombie Đột Kích & Thủ Lĩnh Biến Dị";
    arc1.bossLevel = 15;
    arc1.synopsis = "Tuyết Mộc xuyên không tới sân thượng ngập quái, lừa Xạ Thủ Nuốt Chửng nuốt súng lục và dùng Hạt Dẻ Khổng Lồ mở đường máu.";
    arc1.fullStory = "Tuyết Mộc vừa xuyên không đã rơi vào hoàn cảnh ngặt nghèo trên sân thượng. Xạ Thủ Nuốt Chửng kiêu ngạo từ chối chiến đấu, ép Tuyết Mộc phải ném súng lục cho nó nuốt để biến thành cỗ máy xả đạn. Rút Thẻ Pi 'Số 0', Tuyết Mộc thả Bức Tường Hạt Dẻ lăn nát hàng trăm Zombie từ sân thượng xuống sảnh, mở đường thoát cho nhóm người sống sót của La Quân.";
    
    StoryChoice c1_1;
    c1_1.text = "Lừa Xạ Thủ Nuốt Chửng nuốt súng lục quân dụng của người sống sót";
    c1_1.outcomeText = "Tiểu Thôn nhai ngấu nghiến khẩu súng, họng pháo biến đổi thành súng máy xả đạn mù mịt!";
    c1_1.rewardSun = 100;
    c1_1.rewardSouls = 50;
    c1_1.grantCardId = "peashooter_devourer";
    arc1.choices.push_back(c1_1);

    StoryChoice c1_2;
    c1_2.text = "Thả lá bài Hạt Dẻ Khổng Lồ 'Số 0' mở đường máu xuống sảnh";
    c1_2.outcomeText = "Quả cầu hạt dẻ khổng lồ lăn như thiên thạch, nghiền nát bầy zombie, cứu sống La Quân và Tuyết Tĩnh!";
    c1_2.grantPlantFood = 1;
    c1_2.grantCardId = "giant_walnut";
    arc1.choices.push_back(c1_2);
    m_arcs.push_back(arc1);

    // ARC 2
    StoryArc arc2;
    arc2.id = 2;
    arc2.title = "Giai Đoạn 2: Bí Cảnh Khe Nứt";
    arc2.subtitle = "Màn Nhập Vai Đại Lão & Samurai Nghiện Dưa";
    arc2.location = "Bí Cảnh Vách Đá Khe Nứt";
    arc2.bossName = "Thú Nhân Người Sói Đột Biến";
    arc2.bossLevel = 40;
    arc2.synopsis = "Tuyết Mộc nhập thể Zombie Bóng Bay thoát vực, gặp đại lão Eiker và Samurai Yagu Yosuke say mê ăn dưa hấu.";
    arc2.fullStory = "Bị hút vào Bí Cảnh Khe Nứt, Tuyết Mộc đánh cược mạng sống nhập thể Zombie Bóng Bay lơ lửng trên vực thẳm. Gặp gỡ đại lão cấp 50 Eiker và Samurai Yagu Yosuke. Nhờ bổ đôi quả dưa hấu mát lành mời Yosuke ăn, Tuyết Mộc thu phục kiếm sĩ cự phách làm tay đấm chủ lực bảo vệ mình.";
    
    StoryChoice c2_1;
    c2_1.text = "Nhập thể thẻ 'Zombie Bóng Bay' vượt qua vực sâu thăm thẳm";
    c2_1.outcomeText = "Tuyết Mộc bay bổng giữa không trung, Tiểu Thôn nhả bóng quỷ ứng cứu ngoạn mục!";
    c2_1.rewardSun = 150;
    c2_1.rewardSouls = 80;
    arc2.choices.push_back(c2_1);

    StoryChoice c2_2;
    c2_2.text = "Dùng tay bổ đôi quả Dưa Hấu tươi ngon mời Samurai Yagu Yosuke";
    c2_2.outcomeText = "Yosuke rơi nước mắt vì hương vị quê nhà ngọt lịm, thề rút katana bảo vệ Tuyết Mộc!";
    c2_2.grantCardId = "watermelon_pult";
    arc2.choices.push_back(c2_2);
    m_arcs.push_back(arc2);

    // ARC 3
    StoryArc arc3;
    arc3.id = 3;
    arc3.title = "Giai Đoạn 3: Cuộc Săn Boss Bạch Tuộc";
    arc3.subtitle = "Cú Lật Kèo Đau Điếng & Bước Ngoặt Tâm Lý";
    arc3.location = "Hồ Nước Độc Bí Cảnh";
    arc3.bossName = "Ma Thú Bạch Tuộc Khổng Lồ (Cấp 61)";
    arc3.bossLevel = 61;
    arc3.synopsis = "Tuyết Mộc dùng Rong Biển Quấn dìm Boss dưới hồ, nhưng bị Tạ Giao & Mạn Đà La cướp mất Tinh Hồn 10 triệu EXP.";
    arc3.fullStory = "Đụng độ Ma Thú Bạch Tuộc cấp 61 phun sương độc xanh. Tuyết Mộc tính toán kỹ lưỡng: dùng Rong Biển Quấn ghì chặt xúc tu, Zombie Cá Heo quấy rối và Bí Ngô chịu đòn. Ngay khi chuẩn bị quăng Bom Anh Đào kết liễu, sát thủ Tạ Giao và linh hồn Mạn Đà La bất ngờ lao ra tung nhát chém chí mạng cướp trắng Tinh Hồn Boss.";

    StoryChoice c3_1;
    c3_1.text = "Triệu hồi Rong Biển Quấn dìm chặt các xúc tu khổng lồ";
    c3_1.outcomeText = "Mặt hồ sôi sục, các xúc tu quái vật bị ghì chặt xuống đáy bùn lầy!";
    c3_1.rewardSouls = 120;
    arc3.choices.push_back(c3_1);

    StoryChoice c3_2;
    c3_2.text = "Dốc toàn lực ném Bom Anh Đào kết liễu quái vật";
    c3_2.outcomeText = "Tạ Giao lao ra vung đoản đao cướp Boss trong chớp mắt! Tuyết Mộc nhận bài học tàn nhẫn.";
    c3_2.grantCardId = "cherry_bomb";
    arc3.choices.push_back(c3_2);
    m_arcs.push_back(arc3);

    // ARC 4
    StoryArc arc4;
    arc4.id = 4;
    arc4.title = "Giai Đoạn 4: Trừng Trị Bạo Chúa Nhà Tù";
    arc4.subtitle = "Đòn Tâm Lý Quần Lót Hồng & Bão Từ Nấm";
    arc4.location = "Trại Sinh Tồn Nhà Tù Cũ";
    arc4.bossName = "Bạo Chúa Vô Năng (Súng Phóng Lựu RPG)";
    arc4.bossLevel = 50;
    arc4.synopsis = "Tuyết Mộc đột kích trại giam cứu La Quân, thả Zombie Đọc Báo quần hồng và dùng Nấm Từ Lực tước sạch súng đạn.";
    arc4.fullStory = "Trở về thế giới thực giải cứu La Quân, Tuyết Mộc triệu hồi Zombie Đọc Báo mặc quần lót hồng thản nhiên đọc báo, đánh sập ý chí chiến đấu của bạo chúa Vô Năng. Khi hắn lôi súng RPG định phản kháng, Nấm Từ Lực hút bay toàn bộ vũ khí kim loại trong tích tắc.";

    StoryChoice c4_1;
    c4_1.text = "Thả Thây Ma Đọc Báo (Nhị Gia) mặc quần hồng đọc báo điềm nhiên";
    c4_1.outcomeText = "Vô Năng điên cuồng nã đạn nhưng Nhị Gia vẫn thong dong lật trang nhất, bạo chúa hoàn toàn sụp đổ!";
    c4_1.grantCardId = "newspaper_zombie";
    arc4.choices.push_back(c4_1);

    StoryChoice c4_2;
    c4_2.text = "Kích hoạt Nấm Từ Lực kết hợp Plant Food tạo bão từ";
    c4_2.outcomeText = "Hàng ngàn vũ khí, đạn pháo và khẩu RPG của Vô Năng bị hút bay vào không trung!";
    c4_2.grantCardId = "magnet_shroom";
    arc4.choices.push_back(c4_2);
    m_arcs.push_back(arc4);

    // ARC 5
    StoryArc arc5;
    arc5.id = 5;
    arc5.title = "Giai Đoạn 5: Bách Quỷ Dạ Hành";
    arc5.subtitle = "Cải Tạo Xe Điện & Trận Chiến Rừng Sâu";
    arc5.location = "Khu Rừng Rậm Ma Thú Đột Biến";
    arc5.bossName = "Khỉ Đen Sơn Thị Cấp 38 & Bầy Thú Zombie";
    arc5.bossLevel = 55;
    arc5.synopsis = "Dùng Nấm Dòng Điện lái xe trượt tuyết, Xạ Thủ Nuốt Chửng làm tai nghe giảm thanh và dàn trận quét sạch bầy ma thú.";
    arc5.fullStory = "Tuyết Mộc gắn Nấm Điện vào xe trượt tuyết vượt rừng sâu. Đối đầu tiếng gầm rung chuyển của Khỉ Đen Sơn Thị và hàng trăm Thú Zombie, Tuyết Mộc tung hơn 10 lá bài: Cọc Gỗ Bốc Cháy, Nấm Thôi Miên và Xạ Thủ Đậu xả bão lửa thiêu rụi toàn bộ chiến trường!";

    StoryChoice c5_1;
    c5_1.text = "Biến Xạ Thủ Nuốt Chửng thành Tai Nghe Giảm Thanh chống tiếng gầm";
    c5_1.outcomeText = "Tiểu Thôn quấn quanh tai Tuyết Mộc chặn đứng sóng âm hủy diệt của Khỉ Đen Sơn Thị!";
    c5_1.rewardSun = 200;
    arc5.choices.push_back(c5_1);

    StoryChoice c5_2;
    c5_2.text = "Dàn trận Cọc Gỗ Bốc Cháy kết hợp Đậu Băng và Nấm Thôi Miên";
    c5_2.outcomeText = "Bão đạn lửa bùng cháy ngút trời, quét sạch bầy thú ma quỷ trong tràng pháo tay rực lửa!";
    c5_2.grantPlantFood = 2;
    c5_2.rewardSouls = 300;
    arc5.choices.push_back(c5_2);
    m_arcs.push_back(arc5);
}

} // namespace PvZ2
